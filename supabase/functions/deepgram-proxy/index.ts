import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEEPGRAM_API_KEY = Deno.env.get("DEEPGRAM_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Service-role client for server-side transcript persistence.
// Bypasses RLS — only used inside this trusted edge function.
const adminClient = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

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
  const sampleRate = url.searchParams.get("sample_rate") || "16000";

  // Stable transcription session id passed from client. If absent, generate one
  // and tell the client so it can correlate via 'sessionInfo' message.
  const clientSessionId = url.searchParams.get("session_id");
  const interviewerEmail = url.searchParams.get("interviewer_email") || null;
  const sessionId = clientSessionId || crypto.randomUUID();
  const shortLogId = sessionId.slice(0, 8);

  const log = (...args: unknown[]) => console.log(`[dg ${shortLogId}]`, ...args);
  const warn = (...args: unknown[]) => console.warn(`[dg ${shortLogId}]`, ...args);
  const errorLog = (...args: unknown[]) => console.error(`[dg ${shortLogId}]`, ...args);

  const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);

  let deepgramSocket: WebSocket | null = null;
  let keepAliveTimer: number | null = null;
  let dgReady = false;
  let clientClosedFirst = false;
  let totalAudioBytes = 0;
  let totalAudioChunks = 0;

  // Server-side accumulated transcript (source of truth for save recovery)
  let finalizedText = "";
  let lastInterim = "";
  let lastSpeaker = -1;
  let dgRequestId: string | null = null;

  // Buffer audio that arrives before Deepgram socket is open
  const pendingAudio: ArrayBuffer[] = [];

  // Throttle DB writes — at most every 1.5s during active speech
  let pendingDbWrite = false;
  let lastDbWriteAt = 0;
  const DB_WRITE_THROTTLE_MS = 1500;

  const composeServerDraft = () => {
    const f = finalizedText;
    const i = lastInterim.trim();
    if (!i) return f;
    const spacer = f && !f.endsWith(" ") && !f.endsWith("\n") ? " " : "";
    return `${f}${spacer}${i}`;
  };

  const persistTranscript = async (final = false) => {
    if (!adminClient) return;
    try {
      const draft = composeServerDraft();
      const payload: Record<string, unknown> = {
        latest_transcript: draft,
        audio_chunks: totalAudioChunks,
        audio_bytes: totalAudioBytes,
      };
      if (final) {
        payload.final_transcript = finalizedText.trim() || draft.trim();
        payload.status = "completed";
      }
      if (dgRequestId) payload.deepgram_request_id = dgRequestId;
      await adminClient
        .from("transcription_sessions")
        .update(payload)
        .eq("id", sessionId);
      lastDbWriteAt = Date.now();
    } catch (e) {
      errorLog("persistTranscript failed", e);
    }
  };

  const schedulePersist = () => {
    if (!adminClient) return;
    const now = Date.now();
    if (now - lastDbWriteAt >= DB_WRITE_THROTTLE_MS) {
      persistTranscript(false);
      return;
    }
    if (pendingDbWrite) return;
    pendingDbWrite = true;
    setTimeout(() => {
      pendingDbWrite = false;
      persistTranscript(false);
    }, DB_WRITE_THROTTLE_MS);
  };

  // Ensure a row exists for this session id (idempotent upsert).
  const ensureSessionRow = async () => {
    if (!adminClient) return;
    try {
      await adminClient
        .from("transcription_sessions")
        .upsert(
          {
            id: sessionId,
            interviewer_email: interviewerEmail,
            status: "recording",
          },
          { onConflict: "id", ignoreDuplicates: false }
        );
    } catch (e) {
      errorLog("ensureSessionRow failed", e);
    }
  };

  const formatFinalChunk = (text: string, words: Array<{ speaker?: number; punctuated_word?: string; word?: string }>) => {
    if (!words || !words.length) {
      const spacer = finalizedText && !finalizedText.endsWith(" ") ? " " : "";
      return `${spacer}${text.trim()}`;
    }
    let out = "";
    let cur = lastSpeaker;
    for (const w of words) {
      const sp = w.speaker ?? 0;
      if (sp !== cur) {
        cur = sp;
        out += `\n[Speaker ${sp + 1}]: `;
      }
      out += `${w.punctuated_word ?? w.word ?? ""} `;
    }
    lastSpeaker = words[words.length - 1]?.speaker ?? cur;
    return out;
  };

  const safeClientSend = (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (clientSocket.readyState === WebSocket.OPEN) {
      try { clientSocket.send(data); } catch (e) { errorLog("client send failed", e); }
    }
  };

  const startKeepAlive = () => {
    if (keepAliveTimer !== null) return;
    keepAliveTimer = setInterval(() => {
      if (deepgramSocket && deepgramSocket.readyState === WebSocket.OPEN) {
        try {
          deepgramSocket.send(JSON.stringify({ type: "KeepAlive" }));
        } catch (e) {
          errorLog("KeepAlive send failed", e);
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
    log("client connected, sample_rate=", sampleRate, "session=", sessionId);
    // Ensure a backend row exists immediately so updates can land.
    ensureSessionRow();

    // Send session info to client so it knows the canonical id (especially
    // if the client did not pass one).
    safeClientSend(JSON.stringify({ type: "sessionInfo", sessionId }));

    const dgUrl = new URL("wss://api.deepgram.com/v1/listen");
    dgUrl.searchParams.set("model", "nova-3");
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
      errorLog("Failed to create Deepgram socket:", e);
      safeClientSend(JSON.stringify({ type: "error", message: "Failed to create Deepgram socket", fatal: true }));
      try { clientSocket.close(1011, "dg create failed"); } catch { /* ignore */ }
      return;
    }

    deepgramSocket.onopen = () => {
      dgReady = true;
      log("deepgram open, flushing", pendingAudio.length, "buffered chunks");
      safeClientSend(JSON.stringify({ type: "connected", sessionId }));
      while (pendingAudio.length > 0) {
        const chunk = pendingAudio.shift();
        if (chunk && deepgramSocket && deepgramSocket.readyState === WebSocket.OPEN) {
          try { deepgramSocket.send(chunk); } catch (e) { errorLog("flush send failed", e); }
        }
      }
      startKeepAlive();
    };

    deepgramSocket.onmessage = (event) => {
      // Forward raw payload to client (preserves existing client parsing)
      safeClientSend(event.data);

      // Also parse server-side to maintain authoritative transcript draft
      if (typeof event.data !== "string") return;
      try {
        const data = JSON.parse(event.data);
        if (data.request_id && !dgRequestId) {
          dgRequestId = data.request_id;
        }
        if (data.type === "Metadata" && data.request_id && !dgRequestId) {
          dgRequestId = data.request_id;
        }
        const alt = data.channel?.alternatives?.[0];
        if (!alt) return;
        const text = (alt.transcript || "").trim();
        if (!text) return;

        if (data.is_final) {
          finalizedText += formatFinalChunk(alt.transcript, alt.words || []);
          lastInterim = "";
          schedulePersist();
        } else {
          lastInterim = alt.transcript;
          schedulePersist();
        }
      } catch { /* ignore non-JSON */ }
    };

    deepgramSocket.onerror = (event) => {
      errorLog("Deepgram WebSocket error:", event);
      safeClientSend(JSON.stringify({ type: "error", message: "Deepgram connection error", source: "provider" }));
    };

    deepgramSocket.onclose = (event) => {
      stopKeepAlive();
      log("deepgram closed code=", event.code, "reason=", event.reason || "(none)", "audio chunks sent=", totalAudioChunks, "bytes=", totalAudioBytes, "transcript_len=", finalizedText.length);
      safeClientSend(JSON.stringify({
        type: "dgClosed",
        code: event.code,
        reason: event.reason || "",
        wasClientInitiated: clientClosedFirst,
        sessionId,
      }));
      // Persist final state with close metadata
      if (adminClient) {
        const isClean = event.code === 1000 || clientClosedFirst;
        adminClient
          .from("transcription_sessions")
          .update({
            close_code: event.code,
            close_reason: event.reason || null,
            status: isClean ? "completed" : "errored",
            final_transcript: finalizedText.trim() || composeServerDraft().trim() || null,
            latest_transcript: composeServerDraft(),
            audio_chunks: totalAudioChunks,
            audio_bytes: totalAudioBytes,
            deepgram_request_id: dgRequestId,
          })
          .eq("id", sessionId)
          .then(() => {}, (e) => errorLog("final persist failed", e));
      }
      try { clientSocket.close(1000, "dg closed"); } catch { /* ignore */ }
    };
  };

  clientSocket.onmessage = (event) => {
    if (event.data instanceof ArrayBuffer) {
      totalAudioChunks++;
      totalAudioBytes += event.data.byteLength;
      if (deepgramSocket && deepgramSocket.readyState === WebSocket.OPEN && dgReady) {
        try { deepgramSocket.send(event.data); } catch (e) { errorLog("dg audio send failed", e); }
      } else {
        if (pendingAudio.length < 50) pendingAudio.push(event.data);
      }
    } else if (event.data instanceof Blob) {
      event.data.arrayBuffer().then((buf) => {
        if (deepgramSocket && deepgramSocket.readyState === WebSocket.OPEN && dgReady) {
          try { deepgramSocket.send(buf); } catch (e) { errorLog("dg blob send failed", e); }
        }
      });
    } else if (typeof event.data === "string") {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "close" || msg.type === "CloseStream") {
          log("client requested close");
          clientClosedFirst = true;
          cleanup("client requested close");
        } else if (msg.type === "Finalize") {
          if (deepgramSocket && deepgramSocket.readyState === WebSocket.OPEN) {
            try { deepgramSocket.send(JSON.stringify({ type: "Finalize" })); } catch { /* ignore */ }
          }
        }
      } catch { /* ignore non-JSON */ }
    }
  };

  clientSocket.onclose = (event) => {
    log("client closed code=", event.code, "reason=", event.reason || "(none)", "transcript_len=", finalizedText.length);
    clientClosedFirst = true;
    cleanup("client closed");
    // Final flush — guarantees backend has the latest transcript even on browser close.
    persistTranscript(true);
  };

  clientSocket.onerror = (event) => {
    warn("Client WebSocket error:", event);
    cleanup("client error");
  };

  return response;
});
