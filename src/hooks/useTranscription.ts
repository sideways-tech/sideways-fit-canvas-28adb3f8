import { useState, useRef, useCallback, useEffect } from "react";

export type TranscriptionStatus = "idle" | "connecting" | "recording" | "paused" | "error";

export interface UseTranscriptionReturn {
  status: TranscriptionStatus;
  transcript: string;
  interimText: string;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<string>;
  error: string | null;
}

const TARGET_SAMPLE_RATE = 16000;
const FINALIZE_TIMEOUT_MS = 1800;
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 800;

const friendlyCloseReason = (code?: number, reason?: string): string => {
  if (code === 1011) return "the transcription server hit an error";
  if (code === 1006) return "the network dropped the connection";
  if (code === 1008 || code === 4001 || code === 4003) return "authentication failed";
  if (code === 1013 || code === 429) return "the service is busy — please try again";
  if (reason && reason.trim()) return reason;
  return "the connection was closed";
};

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
  const transcriptRef = useRef("");
  const interimTextRef = useRef("");
  const stopResolverRef = useRef<((value: string) => void) | null>(null);
  const finalizeTimerRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimerRef = useRef<number | null>(null);

  const updateStatus = useCallback((next: TranscriptionStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const setTranscriptValue = useCallback((value: string) => {
    transcriptRef.current = value;
    setTranscript(value);
  }, []);

  const setInterimValue = useCallback((value: string) => {
    interimTextRef.current = value;
    setInterimText(value);
  }, []);

  const appendTranscript = useCallback((chunk: string) => {
    if (!chunk.trim()) return;
    setTranscriptValue(transcriptRef.current + chunk);
  }, [setTranscriptValue]);

  const resetTranscriptState = useCallback(() => {
    lastSpeakerRef.current = -1;
    setTranscriptValue("");
    setInterimValue("");
  }, [setInterimValue, setTranscriptValue]);

  const getWsUrl = () => {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    return `wss://${projectId}.supabase.co/functions/v1/deepgram-proxy?sample_rate=${TARGET_SAMPLE_RATE}`;
  };

  const clearFinalizeTimer = useCallback(() => {
    if (finalizeTimerRef.current !== null) {
      window.clearTimeout(finalizeTimerRef.current);
      finalizeTimerRef.current = null;
    }
  }, []);

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
        audioContextRef.current.close().catch(() => undefined);
      }
      audioContextRef.current = null;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    } catch (e) {
      console.error("teardownAudio error", e);
    }
  }, []);

  const resolveStop = useCallback(() => {
    const trailingInterim = interimTextRef.current.trim();
    if (trailingInterim) {
      const spacer = transcriptRef.current && !transcriptRef.current.endsWith(" ") ? " " : "";
      setTranscriptValue(`${transcriptRef.current}${spacer}${trailingInterim}`);
      setInterimValue("");
    }

    const finalTranscript = transcriptRef.current.trim();
    stopResolverRef.current?.(finalTranscript);
    stopResolverRef.current = null;
    clearFinalizeTimer();
    wsRef.current = null;
    lastSpeakerRef.current = -1;
    stoppingRef.current = false;
    updateStatus("idle");
  }, [clearFinalizeTimer, setInterimValue, setTranscriptValue, updateStatus]);

  const sendAudio = useCallback((buffer: ArrayBuffer) => {
    if (pausedRef.current) return;
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      try {
        ws.send(buffer);
      } catch (e) {
        console.error("ws send failed", e);
      }
    }
  }, []);

  const startAudioPipeline = useCallback(async (stream: MediaStream) => {
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
      node.port.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) sendAudio(event.data);
      };
      source.connect(node);
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
      const ratio = audioContext.sampleRate / TARGET_SAMPLE_RATE;

      processor.onaudioprocess = (event) => {
        if (pausedRef.current) return;
        const input = event.inputBuffer.getChannelData(0);
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
          const bounded = Math.max(-1, Math.min(1, sample));
          out[i] = bounded < 0 ? bounded * 0x8000 : bounded * 0x7fff;
        }

        sendAudio(out.buffer);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    }
  }, [sendAudio]);

  const formatFinalTranscriptChunk = useCallback((text: string, words: Array<{ speaker?: number; punctuated_word?: string; word?: string }>) => {
    if (!words.length) {
      const spacer = transcriptRef.current && !transcriptRef.current.endsWith(" ") ? " " : "";
      return `${spacer}${text.trim()}`;
    }

    let formatted = "";
    let currentSpeaker = lastSpeakerRef.current;

    for (const word of words) {
      const speaker = word.speaker ?? 0;
      if (speaker !== currentSpeaker) {
        currentSpeaker = speaker;
        formatted += `\n[Speaker ${speaker + 1}]: `;
      }
      formatted += `${word.punctuated_word ?? word.word ?? ""} `;
    }

    lastSpeakerRef.current = words[words.length - 1]?.speaker ?? currentSpeaker;
    return formatted;
  }, []);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const connectWebSocket = useCallback((stream: MediaStream, isReconnect: boolean) => {
    let ws: WebSocket;
    try {
      ws = new WebSocket(getWsUrl());
    } catch (err: any) {
      setError(err?.message || "Failed to open transcription connection");
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
          // Reset reconnect counter on a successful connection
          reconnectAttemptsRef.current = 0;
          if (!isReconnect) {
            startAudioPipeline(stream).catch((e) => {
              console.error("audio pipeline failed", e);
              setError(e?.message || "Audio pipeline failed");
              updateStatus("error");
            });
          }
          updateStatus("recording");
          return;
        }

        if (data.type === "error") {
          setError(data.message || "Transcription error");
          updateStatus("error");
          return;
        }

        if (data.type === "dgClosed") {
          // Don't surface a toast here — the ws.onclose handler will decide
          // whether to silently reconnect or show a final error message.
          if (data.code) {
            console.warn("Deepgram closed", data.code, data.reason || "");
          }
          return;
        }

        if (!data.channel?.alternatives?.[0]) return;

        const alt = data.channel.alternatives[0];
        const words = alt.words || [];
        const text = alt.transcript || "";
        if (!text.trim()) return;

        if (data.is_final) {
          appendTranscript(formatFinalTranscriptChunk(text, words));
          setInterimValue("");
        } else {
          setInterimValue(text);
        }
      } catch {
        undefined;
      }
    };

    ws.onerror = () => {
      // Defer to onclose for reconnect/error handling so we don't double-toast.
      console.warn("Transcription WebSocket error");
    };

    ws.onclose = (event) => {
      // Intentional stop by user — resolve the stop promise.
      if (stoppingRef.current) {
        teardownAudio();
        resolveStop();
        return;
      }

      // If we were actively transcribing, attempt silent auto-reconnect.
      const wasActive = ["recording", "paused", "connecting"].includes(statusRef.current);
      if (!wasActive) return;

      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS && mediaStreamRef.current) {
        reconnectAttemptsRef.current += 1;
        const attempt = reconnectAttemptsRef.current;
        console.warn(`Transcription dropped — reconnecting (attempt ${attempt}/${MAX_RECONNECT_ATTEMPTS})`);
        updateStatus("connecting");
        clearReconnectTimer();
        reconnectTimerRef.current = window.setTimeout(() => {
          if (stoppingRef.current || !mediaStreamRef.current) return;
          connectWebSocket(mediaStreamRef.current, true);
        }, RECONNECT_DELAY_MS * attempt);
        return;
      }

      // Out of retries — tear down and surface a friendly error.
      teardownAudio();
      updateStatus("error");
      const reason = friendlyCloseReason(event.code, event.reason);
      setError(`Transcription stopped — ${reason}. Tap the mic to retry.`);
    };
  }, [appendTranscript, clearReconnectTimer, formatFinalTranscriptChunk, resolveStop, setInterimValue, startAudioPipeline, teardownAudio, updateStatus]);

  const start = useCallback(async () => {
    setError(null);
    clearFinalizeTimer();
    clearReconnectTimer();
    stopResolverRef.current = null;
    stoppingRef.current = false;
    pausedRef.current = false;
    reconnectAttemptsRef.current = 0;
    resetTranscriptState();
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
      const msg = err?.name === "NotAllowedError"
        ? "Microphone access denied. Please allow mic access in your browser."
        : err?.message || "Could not access microphone";
      setError(msg);
      updateStatus("error");
      return;
    }
    mediaStreamRef.current = stream;

    connectWebSocket(stream, false);
  }, [clearFinalizeTimer, clearReconnectTimer, connectWebSocket, resetTranscriptState, updateStatus]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    updateStatus("paused");
  }, [updateStatus]);

  const resume = useCallback(() => {
    pausedRef.current = false;
    updateStatus("recording");
  }, [updateStatus]);

  const stop = useCallback(() => {
    if (stopResolverRef.current) {
      return Promise.resolve(transcriptRef.current.trim());
    }

    stoppingRef.current = true;
    pausedRef.current = true;
    teardownAudio();

    return new Promise<string>((resolve) => {
      stopResolverRef.current = resolve;
      const ws = wsRef.current;

      if (!ws) {
        resolveStop();
        return;
      }

      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "Finalize" }));
          finalizeTimerRef.current = window.setTimeout(() => {
            try {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "close" }));
                ws.close(1000, "client finalize timeout");
              }
            } catch {
              resolveStop();
            }
          }, FINALIZE_TIMEOUT_MS);
        } else {
          try {
            ws.close();
          } catch {
            resolveStop();
          }
        }
      } catch {
        resolveStop();
      }
    });
  }, [clearFinalizeTimer, resolveStop, teardownAudio]);

  useEffect(() => {
    return () => {
      stoppingRef.current = true;
      clearFinalizeTimer();
      const ws = wsRef.current;
      if (ws) {
        try {
          ws.close();
        } catch {
          undefined;
        }
      }
      teardownAudio();
    };
  }, [clearFinalizeTimer, teardownAudio]);

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
