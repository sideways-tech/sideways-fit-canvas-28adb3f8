import { useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, Pause } from "lucide-react";
import { useTranscription, TranscriptionStatus } from "@/hooks/useTranscription";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface TranscriptMicProps {
  onTranscriptChange: (transcript: string) => void;
}

export interface TranscriptMicHandle {
  stopRecording: () => Promise<string>;
  isRecording: () => boolean;
  /** Returns best available transcript draft (finalized + interim), even when stopped/errored. */
  getTranscriptDraft: () => string;
  /** Clears in-memory + persisted draft. Call after a successful save. */
  clearDraft: () => void;
}

const statusConfig: Record<TranscriptionStatus, { color: string; label: string }> = {
  idle: { color: "bg-muted", label: "Start Recording" },
  connecting: { color: "bg-[hsl(48,60%,80%)]/70", label: "Reconnecting..." },
  recording: { color: "bg-[hsl(142,40%,75%)]", label: "Recording" },
  paused: { color: "bg-[hsl(48,60%,80%)]", label: "Paused" },
  error: { color: "bg-destructive", label: "Error" },
};

const TranscriptMic = forwardRef<TranscriptMicHandle, TranscriptMicProps>(({ onTranscriptChange }, ref) => {
  const { status, draftTranscript, transcript, interimText, start, pause, resume, stop, getTranscriptDraft, clearDraft, error } = useTranscription();
  const isMobile = useIsMobile();
  const onTranscriptChangeRef = useRef(onTranscriptChange);
  onTranscriptChangeRef.current = onTranscriptChange;

  useImperativeHandle(ref, () => ({
    stopRecording: async () => {
      const finalized = await stop();
      // Prefer the finalized return; fall back to draft if empty (edge case)
      return finalized.trim() || getTranscriptDraft();
    },
    isRecording: () => status === "recording" || status === "paused" || status === "connecting",
    getTranscriptDraft,
    clearDraft,
  }), [stop, getTranscriptDraft, clearDraft, status]);

  // Push the combined draft (finalized + interim) up to the parent on every change,
  // so the form always has the best-available text — even if connection drops.
  useEffect(() => {
    onTranscriptChangeRef.current(draftTranscript);
  }, [draftTranscript]);

  const handleMainAction = async () => {
    switch (status) {
      case "idle":
      case "error":
        await start();
        break;
      case "recording":
        pause();
        break;
      case "paused":
        resume();
        break;
    }
  };

  const config = statusConfig[status];
  const isActive = status === "recording" || status === "paused" || status === "connecting";
  const MainIcon = status === "recording" ? Pause : Mic;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="fixed bottom-3 right-3 z-50">
        {/* Live transcript preview (debug) */}
        <AnimatePresence>
          {(status === "recording" || status === "paused") && (transcript || interimText) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-2 w-[280px] max-h-[40vh] overflow-y-auto rounded-lg border border-border bg-background/95 backdrop-blur p-3 shadow-lg text-xs text-foreground whitespace-pre-wrap"
            >
              {transcript}
              {interimText && (
                <span className="text-muted-foreground italic">{transcript ? " " : ""}{interimText}</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-destructive/10 text-destructive text-xs px-3 py-2 rounded-lg max-w-[240px] mb-2"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative w-14 h-[76px]">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleMainAction}
                disabled={status === "connecting"}
                className={`absolute top-0 left-0 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${config.color} ${
                  status === "connecting" ? "opacity-70 cursor-wait" : "cursor-pointer"
                }`}
              >
                {status === "recording" && !isMobile && (
                  <span
                    className="absolute inset-0 rounded-full bg-[hsl(142,40%,75%)]/40 pointer-events-none animate-ping"
                  />
                )}
                <MainIcon className={`w-6 h-6 relative z-10 ${
                  status === "recording" ? "text-background" :
                  status === "paused" ? "text-background" :
                  "text-foreground"
                }`} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">{config.label}</TooltipContent>
          </Tooltip>

          <div className="absolute top-[60px] left-1/2 flex h-4 -translate-x-1/2 items-center justify-center">
            {isActive && (
              <span className="whitespace-nowrap text-xs text-muted-foreground">
                {config.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
});

TranscriptMic.displayName = "TranscriptMic";

export default TranscriptMic;
