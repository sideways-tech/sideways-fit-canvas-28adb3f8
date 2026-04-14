import { useEffect, useImperativeHandle, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Pause } from "lucide-react";
import { useTranscription, TranscriptionStatus } from "@/hooks/useTranscription";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface TranscriptMicProps {
  onTranscriptChange: (transcript: string) => void;
}

export interface TranscriptMicHandle {
  stopRecording: () => void;
  isRecording: () => boolean;
}

const statusConfig: Record<TranscriptionStatus, { color: string; label: string }> = {
  idle: { color: "bg-muted", label: "Start Recording" },
  connecting: { color: "bg-[hsl(48,60%,80%)]/70", label: "Connecting..." },
  recording: { color: "bg-[hsl(142,40%,75%)]", label: "Recording" },
  paused: { color: "bg-[hsl(48,60%,80%)]", label: "Paused" },
  error: { color: "bg-destructive", label: "Error" },
};

const TranscriptMic = forwardRef<TranscriptMicHandle, TranscriptMicProps>(({ onTranscriptChange }, ref) => {
  const { status, transcript, start, pause, resume, stop, error } = useTranscription();
  const isMobile = useIsMobile();

  useImperativeHandle(ref, () => ({
    stopRecording: () => stop(),
    isRecording: () => status === "recording" || status === "paused" || status === "connecting",
  }), [stop, status]);

  useEffect(() => {
    if (transcript) {
      onTranscriptChange(transcript);
    }
  }, [transcript, onTranscriptChange]);

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

        {/* Mic button + status label */}
        <div className="flex flex-col items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMainAction}
                disabled={status === "connecting"}
                className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${config.color} ${
                  status === "connecting" ? "opacity-70 cursor-wait" : "cursor-pointer"
                }`}
              >
                {status === "recording" && !isMobile && (
                  <>
                    <motion.span
                      className="absolute inset-0 rounded-full bg-[hsl(142,40%,75%)]/40 pointer-events-none"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.span
                      className="absolute inset-0 rounded-full bg-[hsl(142,40%,75%)]/30 pointer-events-none"
                      initial={{ scale: 1, opacity: 0.4 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                    />
                  </>
                )}
                <MainIcon className={`w-6 h-6 relative z-10 ${
                  status === "recording" ? "text-background" : 
                  status === "paused" ? "text-background" : 
                  "text-foreground"
                }`} />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="left">{config.label}</TooltipContent>
          </Tooltip>

          <div className="h-4 flex items-center justify-center">
            {isActive && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground whitespace-nowrap"
              >
                {config.label}
              </motion.span>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
});

TranscriptMic.displayName = "TranscriptMic";

export default TranscriptMic;
