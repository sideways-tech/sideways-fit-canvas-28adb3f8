const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEEPGRAM_API_KEY = Deno.env.get("DEEPGRAM_API_KEY");

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response(
      JSON.stringify({ error: "WebSocket upgrade required" }),
      { status: 426, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!DEEPGRAM_API_KEY) {
    return new Response(
      JSON.stringify({ error: "DEEPGRAM_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const url = new URL(req.url);
  // Allow client to override sample rate (AudioContext default varies by device)
  const sampleRate = url.searchParams.get("sample_rate") || "16000";

  const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);

  let deepgramSocket: WebSocket | null = null;
  let keepAliveTimer: number | null = null;
  let dgReady = false;
  // Buffer audio that arrives before Deepgram socket is open
  const pendingAudio: ArrayBuffer[] = [];

  const safeClientSend = (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (clientSocket.readyState === WebSocket.OPEN) {
      try { clientSocket.send(data); } catch (e) { console.error("client send failed", e); }
    }
  };

  const startKeepAlive = () => {
    if (keepAliveTimer !== null) return;
    // Deepgram closes idle connections after ~10s. Send KeepAlive every 5s.
    keepAliveTimer = setInterval(() => {
      if (deepgramSocket && deepgramSocket.readyState === WebSocket.OPEN) {
        try {
          deepgramSocket.send(JSON.stringify({ type: "KeepAlive" }));
        } catch (e) {
          console.error("KeepAlive send failed", e);
        }
      }
    }, 5000) as unknown as number;
  };

  const stopKeepAlive = () => {
    if (keepAliveTimer !== null) {
      clearInterval(keepAliveTimer);
      keepAliveTimer = null;
    }
  };

  const cleanup = (reason: string) => {
    stopKeepAlive();
    if (deepgramSocket && deepgramSocket.readyState === WebSocket.OPEN) {
      try {
        deepgramSocket.send(JSON.stringify({ type: "CloseStream" }));
      } catch { /* ignore */ }
      try { deepgramSocket.close(1000, reason); } catch { /* ignore */ }
    }
    deepgramSocket = null;
  };

  clientSocket.onopen = () => {
    const dgUrl = new URL("wss://api.deepgram.com/v1/listen");
    dgUrl.searchParams.set("model", "nova-3");
    // Nova-3 supports code-switching across languages (English + Hindi)
    dgUrl.searchParams.set("language", "multi");
    dgUrl.searchParams.set("diarize", "true");
    dgUrl.searchParams.set("smart_format", "true");
    dgUrl.searchParams.set("punctuate", "true");
    dgUrl.searchParams.set("interim_results", "true");
    dgUrl.searchParams.set("utterance_end_ms", "1500");
    dgUrl.searchParams.set("endpointing", "300");
    dgUrl.searchParams.set("encoding", "linear16");
    dgUrl.searchParams.set("sample_rate", sampleRate);
    dgUrl.searchParams.set("channels", "1");

    try {
      deepgramSocket = new WebSocket(dgUrl.toString(), ["token", DEEPGRAM_API_KEY!]);
    } catch (e) {
      console.error("Failed to create Deepgram socket:", e);
      safeClientSend(JSON.stringify({ type: "error", message: "Failed to create Deepgram socket" }));
      try { clientSocket.close(1011, "dg create failed"); } catch { /* ignore */ }
      return;
    }

    deepgramSocket.onopen = () => {
      dgReady = true;
      safeClientSend(JSON.stringify({ type: "connected" }));
      // Flush buffered audio that arrived before Deepgram was ready
      while (pendingAudio.length > 0) {
        const chunk = pendingAudio.shift();
        if (chunk && deepgramSocket && deepgramSocket.readyState === WebSocket.OPEN) {
          try { deepgramSocket.send(chunk); } catch (e) { console.error("flush send failed", e); }
        }
      }
      startKeepAlive();
    };

    deepgramSocket.onmessage = (event) => {
      safeClientSend(event.data);
    };

    deepgramSocket.onerror = (event) => {
      console.error("Deepgram WebSocket error:", event);
      safeClientSend(JSON.stringify({ type: "error", message: "Deepgram connection error" }));
    };

    deepgramSocket.onclose = (event) => {
      stopKeepAlive();
      console.log("Deepgram closed", event.code, event.reason);
      safeClientSend(JSON.stringify({
        type: "dgClosed",
        code: event.code,
        reason: event.reason || "",
      }));
      // Tell the client so it can stop capturing
      try { clientSocket.close(1000, "dg closed"); } catch { /* ignore */ }
    };
  };

  clientSocket.onmessage = (event) => {
    if (event.data instanceof ArrayBuffer) {
      if (deepgramSocket && deepgramSocket.readyState === WebSocket.OPEN && dgReady) {
        try { deepgramSocket.send(event.data); } catch (e) { console.error("dg audio send failed", e); }
      } else {
        // Buffer briefly; cap to ~5s of 16kHz/16-bit mono to avoid runaway memory
        if (pendingAudio.length < 50) pendingAudio.push(event.data);
      }
    } else if (event.data instanceof Blob) {
      event.data.arrayBuffer().then((buf) => {
        if (deepgramSocket && deepgramSocket.readyState === WebSocket.OPEN && dgReady) {
          try { deepgramSocket.send(buf); } catch (e) { console.error("dg blob send failed", e); }
        }
      });
    } else if (typeof event.data === "string") {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "close" || msg.type === "CloseStream") {
          cleanup("client requested close");
        } else if (msg.type === "Finalize") {
          if (deepgramSocket && deepgramSocket.readyState === WebSocket.OPEN) {
            try { deepgramSocket.send(JSON.stringify({ type: "Finalize" })); } catch { /* ignore */ }
          }
        }
      } catch { /* ignore non-JSON */ }
    }
  };

  clientSocket.onclose = () => {
    cleanup("client closed");
  };

  clientSocket.onerror = (event) => {
    console.error("Client WebSocket error:", event);
    cleanup("client error");
  };

  return response;
});
