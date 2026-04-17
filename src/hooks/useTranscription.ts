import { useState, useRef, useCallback, useEffect } from "react";

export type TranscriptionStatus = "idle" | "connecting" | "recording" | "paused" | "error";

export interface UseTranscriptionReturn {
  status: TranscriptionStatus;
  transcript: string;
  interimText: string;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  error: string | null;
}

const TARGET_SAMPLE_RATE = 16000;

export function useTranscription(): UseTranscriptionReturn {
  const [status, setStatus] = useState<TranscriptionStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const lastSpeakerRef = useRef<number>(-1);
  const pausedRef = useRef<boolean>(false);
  const statusRef = useRef<TranscriptionStatus>("idle");
  const stoppingRef = useRef<boolean>(false);

  const updateStatus = useCallback((next: TranscriptionStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const getWsUrl = () => {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    return `wss://${projectId}.supabase.co/functions/v1/deepgram-proxy?sample_rate=${TARGET_SAMPLE_RATE}`;
  };

  const teardownAudio = useCallback(() => {
    try {
      if (workletNodeRef.current) {
        workletNodeRef.current.port.onmessage = null;
        workletNodeRef.current.disconnect();
        workletNodeRef.current = null;
      }
      if (processorRef.current) {
        processorRef.current.onaudioprocess = null;
        processorRef.current.disconnect();
        processorRef.current = null;
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => { /* ignore */ });
      }
      audioContextRef.current = null;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    } catch (e) {
      console.error("teardownAudio error", e);
    }
  }, []);

  const sendAudio = useCallback((buffer: ArrayBuffer) => {
    if (pausedRef.current) return;
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      try { ws.send(buffer); } catch (e) { console.error("ws send failed", e); }
    }
  }, []);

  const startAudioPipeline = useCallback(async (stream: MediaStream) => {
    // Use the device's native sample rate to maximize compatibility; the worklet
    // downsamples to TARGET_SAMPLE_RATE for Deepgram.
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(stream);
    sourceRef.current = source;

    let usingWorklet = false;
    try {
      await audioContext.audioWorklet.addModule("/pcm-worklet.js");
      const node = new AudioWorkletNode(audioContext, "pcm-worklet", {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        channelCount: 1,
        processorOptions: { targetSampleRate: TARGET_SAMPLE_RATE },
      });
      node.port.onmessage = (e) => {
        if (e.data instanceof ArrayBuffer) sendAudio(e.data);
      };
      source.connect(node);
      // Connect to destination with a muted gain so the graph runs without playback.
      const silent = audioContext.createGain();
      silent.gain.value = 0;
      node.connect(silent).connect(audioContext.destination);
      workletNodeRef.current = node;
      usingWorklet = true;
    } catch (e) {
      console.warn("AudioWorklet unavailable, falling back to ScriptProcessor", e);
    }

    if (!usingWorklet) {
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      const inRate = audioContext.sampleRate;
      const ratio = inRate / TARGET_SAMPLE_RATE;
      processor.onaudioprocess = (e) => {
        if (pausedRef.current) return;
        const input = e.inputBuffer.getChannelData(0);
        const outLen = Math.floor(input.length / ratio);
        const out = new Int16Array(outLen);
        for (let i = 0; i < outLen; i++) {
          const start = Math.floor(i * ratio);
          const end = Math.floor((i + 1) * ratio);
          let sum = 0;
          let count = 0;
          for (let j = start; j < end && j < input.length; j++) {
            sum += input[j];
            count++;
          }
          const sample = count > 0 ? sum / count : 0;
          const s = Math.max(-1, Math.min(1, sample));
          out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        sendAudio(out.buffer);
      };
      source.connect(processor);
      processor.connect(audioContext.destination);
    }
  }, [sendAudio]);

  const start = useCallback(async () => {
    setError(null);
    stoppingRef.current = false;
    pausedRef.current = false;
    updateStatus("connecting");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err: any) {
      setError(err?.message || "Microphone access denied");
      updateStatus("error");
      return;
    }
    mediaStreamRef.current = stream;

    let ws: WebSocket;
    try {
      ws = new WebSocket(getWsUrl());
    } catch (err: any) {
      setError(err?.message || "Failed to open WebSocket");
      updateStatus("error");
      teardownAudio();
      return;
    }
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "connected") {
          startAudioPipeline(stream).catch((e) => {
            console.error("audio pipeline failed", e);
            setError(e?.message || "Audio pipeline failed");
            updateStatus("error");
          });
          updateStatus("recording");
          return;
        }

        if (data.type === "error") {
          setError(data.message || "Transcription error");
          updateStatus("error");
          return;
        }

        if (data.type === "dgClosed") {
          // Deepgram closed unexpectedly — surface for visibility
          if (!stoppingRef.current && statusRef.current !== "idle") {
            const reason = data.reason ? ` (${data.code}: ${data.reason})` : data.code ? ` (${data.code})` : "";
            setError(`Transcription stopped${reason}`);
          }
          return;
        }

        // Deepgram transcript payload
        if (data.channel?.alternatives?.[0]) {
          const alt = data.channel.alternatives[0];
          const words = alt.words || [];
          const text = alt.transcript || "";

          if (!text.trim()) return;

          if (data.is_final) {
            let formatted = "";
            let currentSpeaker = lastSpeakerRef.current;

            for (const word of words) {
              const speaker = word.speaker ?? 0;
              if (speaker !== currentSpeaker) {
                currentSpeaker = speaker;
                formatted += `\n[Speaker ${speaker + 1}]: `;
              }
              formatted += (word.punctuated_word ?? word.word) + " ";
            }

            if (words.length > 0) {
              lastSpeakerRef.current = words[words.length - 1].speaker ?? 0;
            }

            setTranscript((prev) => prev + formatted);
            setInterimText("");
          } else {
            setInterimText(text);
          }
        }
      } catch {
        /* non-JSON message, ignore */
      }
    };

    ws.onerror = () => {
      if (stoppingRef.current) return;
      setError("Connection error");
      updateStatus("error");
    };

    ws.onclose = () => {
      // Tear down audio so we don't keep capturing into a dead socket
      teardownAudio();
      if (stoppingRef.current) {
        updateStatus("idle");
      } else if (statusRef.current === "recording" || statusRef.current === "paused" || statusRef.current === "connecting") {
        updateStatus("error");
        setError((prev) => prev ?? "Transcription connection closed");
      }
    };
  }, [startAudioPipeline, teardownAudio, updateStatus]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    updateStatus("paused");
  }, [updateStatus]);

  const resume = useCallback(() => {
    pausedRef.current = false;
    updateStatus("recording");
  }, [updateStatus]);

  const stop = useCallback(() => {
    stoppingRef.current = true;
    pausedRef.current = false;

    const ws = wsRef.current;
    if (ws) {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "Finalize" }));
          ws.send(JSON.stringify({ type: "close" }));
        }
      } catch { /* ignore */ }
      try { ws.close(); } catch { /* ignore */ }
      wsRef.current = null;
    }

    teardownAudio();
    lastSpeakerRef.current = -1;
    setInterimText("");
    updateStatus("idle");
  }, [teardownAudio, updateStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stoppingRef.current = true;
      const ws = wsRef.current;
      if (ws) {
        try { ws.close(); } catch { /* ignore */ }
        wsRef.current = null;
      }
      teardownAudio();
    };
  }, [teardownAudio]);

  return {
    status,
    transcript,
    interimText,
    start,
    pause,
    resume,
    stop,
    error,
  };
}
