import { useState, useRef, useCallback } from "react";

export type TranscriptionStatus = "idle" | "connecting" | "recording" | "paused" | "error";

interface TranscriptEntry {
  speaker: number;
  text: string;
  isFinal: boolean;
}

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

export function useTranscription(): UseTranscriptionReturn {
  const [status, setStatus] = useState<TranscriptionStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastSpeakerRef = useRef<number>(-1);

  const getWsUrl = () => {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    // Use wss for the edge function
    return `wss://${projectId}.supabase.co/functions/v1/deepgram-proxy`;
  };

  const start = useCallback(async () => {
    setError(null);
    setStatus("connecting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        // Wait for "connected" message from proxy
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "connected") {
            // Deepgram is ready, start streaming audio
            startAudioStream(stream);
            setStatus("recording");
            return;
          }

          if (data.type === "error") {
            setError(data.message);
            setStatus("error");
            return;
          }

          if (data.type === "dgClosed") {
            return;
          }

          // Deepgram transcript result
          if (data.channel?.alternatives?.[0]) {
            const alt = data.channel.alternatives[0];
            const words = alt.words || [];
            const text = alt.transcript || "";

            if (!text.trim()) return;

            if (data.is_final) {
              // Build text with speaker labels
              let formatted = "";
              let currentSpeaker = lastSpeakerRef.current;

              for (const word of words) {
                const speaker = word.speaker ?? 0;
                if (speaker !== currentSpeaker) {
                  currentSpeaker = speaker;
                  formatted += `\n[Speaker ${speaker + 1}]: `;
                }
                formatted += word.punctuated_word + " ";
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
          // Non-JSON message, ignore
        }
      };

      ws.onerror = () => {
        setError("WebSocket connection failed");
        setStatus("error");
      };

      ws.onclose = () => {
        if (status === "recording") {
          setStatus("idle");
        }
      };
    } catch (err: any) {
      setError(err.message || "Failed to access microphone");
      setStatus("error");
    }
  }, []);

  const startAudioStream = (stream: MediaStream) => {
    const audioContext = new AudioContext({ sampleRate: 16000 });
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(stream);
    // Use ScriptProcessor for broad compatibility (AudioWorklet needs more setup)
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert float32 to int16
        const int16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        wsRef.current.send(int16.buffer);
      }
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
  };

  const pause = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    if (
      audioContextRef.current &&
      mediaStreamRef.current &&
      processorRef.current
    ) {
      const source = audioContextRef.current.createMediaStreamSource(
        mediaStreamRef.current
      );
      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
    }
    setStatus("recording");
  }, []);

  const stop = useCallback(() => {
    // Close WebSocket
    if (wsRef.current) {
      try {
        wsRef.current.send(JSON.stringify({ type: "close" }));
      } catch { /* ignore */ }
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop audio
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    lastSpeakerRef.current = -1;
    setStatus("idle");
    setInterimText("");
  }, []);

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
