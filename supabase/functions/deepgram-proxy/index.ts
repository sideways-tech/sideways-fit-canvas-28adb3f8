import { corsHeaders } from "@supabase/supabase-js/cors";

const DEEPGRAM_API_KEY = Deno.env.get("DEEPGRAM_API_KEY");

Deno.serve((req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only accept WebSocket upgrades
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

  const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);

  let deepgramSocket: WebSocket | null = null;

  clientSocket.onopen = () => {
    // Connect to Deepgram Live API
    const dgUrl = new URL("wss://api.deepgram.com/v1/listen");
    dgUrl.searchParams.set("model", "nova-2");
    dgUrl.searchParams.set("language", "en-IN");
    dgUrl.searchParams.set("diarize", "true");
    dgUrl.searchParams.set("smart_format", "true");
    dgUrl.searchParams.set("punctuate", "true");
    dgUrl.searchParams.set("interim_results", "true");
    dgUrl.searchParams.set("utterance_end_ms", "1500");
    dgUrl.searchParams.set("encoding", "linear16");
    dgUrl.searchParams.set("sample_rate", "16000");
    dgUrl.searchParams.set("channels", "1");

    deepgramSocket = new WebSocket(dgUrl.toString(), [
      "token",
      DEEPGRAM_API_KEY,
    ]);

    deepgramSocket.onopen = () => {
      clientSocket.send(JSON.stringify({ type: "connected" }));
    };

    deepgramSocket.onmessage = (event) => {
      // Forward Deepgram transcription results to client
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(event.data);
      }
    };

    deepgramSocket.onerror = (event) => {
      console.error("Deepgram WebSocket error:", event);
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(JSON.stringify({ type: "error", message: "Deepgram connection error" }));
      }
    };

    deepgramSocket.onclose = () => {
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(JSON.stringify({ type: "dgClosed" }));
      }
    };
  };

  clientSocket.onmessage = (event) => {
    // Forward audio data from client to Deepgram
    if (deepgramSocket && deepgramSocket.readyState === WebSocket.OPEN) {
      if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
        deepgramSocket.send(event.data);
      } else if (typeof event.data === "string") {
        // Handle control messages from client
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "close") {
            // Send close signal to Deepgram
            deepgramSocket.send(JSON.stringify({ type: "CloseStream" }));
          }
        } catch {
          // Not JSON, ignore
        }
      }
    }
  };

  clientSocket.onclose = () => {
    if (deepgramSocket && deepgramSocket.readyState === WebSocket.OPEN) {
      deepgramSocket.send(JSON.stringify({ type: "CloseStream" }));
      deepgramSocket.close();
    }
  };

  clientSocket.onerror = (event) => {
    console.error("Client WebSocket error:", event);
    if (deepgramSocket && deepgramSocket.readyState === WebSocket.OPEN) {
      deepgramSocket.close();
    }
  };

  return response;
});
