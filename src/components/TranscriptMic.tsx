import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Pause, Play, Square, ChevronDown, ChevronUp } from "lucide-react";
import { useTranscription, TranscriptionStatus } from "@/hooks/useTranscription";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TranscriptMicProps {
  onTranscriptChange: (transcript: string) => void;
}

const statusConfig: Record<TranscriptionStatus, { color: string; label: string }> = {
  idle: { color: "bg-muted", label: "Start Recording" },
  connecting: { color: "bg-highlighter/50", label: "Connecting..." },
  recording: { color: "bg-hire", label: "Recording" },
  paused: { color: "bg-highlighter", label: "Paused" },
  error: { color: "bg-destructive", label: "Error" },
};

const TranscriptMic = ({ onTranscriptChange }: TranscriptMicProps) => {
  const { status, transcript, interimText, start, pause, resume, stop, error } = useTranscription();
  const [expanded, setExpanded] = useState(false);

  // Sync transcript up to parent
  const prevTranscriptRef = transcript;
  if (prevTranscriptRef) {
    // Use effect-like pattern: call onTranscriptChange when transcript changes
  }

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

  const handleStop = () => {
    stop();
    onTranscriptChange(transcript);
  };

  const config = statusConfig[status];
  const isActive = status === "recording" || status === "paused" || status === "connecting";
  const hasTranscript = transcript.trim().length > 0 || interimText.trim().length > 0;

  const MainIcon = status === "recording" ? Pause : status === "paused" ? Play : Mic;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Expandable transcript panel */}
        <AnimatePresence>
          {expanded && hasTranscript && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-80 max-h-[40vh] bg-card sketch-border rounded-lg shadow-lg overflow-hidden"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground">Live Transcript</span>
                <button onClick={() => setExpanded(false)} className="text-muted-foreground hover:text-foreground">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <ScrollArea className="h-[30vh] p-3">
                <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {transcript}
                  {interimText && (
                    <span className="text-muted-foreground italic">{interimText}</span>
                  )}
                  {!transcript && !interimText && (
                    <span className="text-muted-foreground italic">Listening...</span>
                  )}
                </div>
              </ScrollArea>
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
              className="bg-destructive/10 text-destructive text-xs px-3 py-2 rounded-lg max-w-[240px]"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Button group */}
        <div className="flex items-center gap-2">
          {/* Expand/collapse transcript */}
          {hasTranscript && (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setExpanded(!expanded)}
                  className="w-10 h-10 rounded-full bg-card sketch-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-md"
                >
                  {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="left">{expanded ? "Hide transcript" : "Show transcript"}</TooltipContent>
            </Tooltip>
          )}

          {/* Stop button (only when active) */}
          {isActive && (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={handleStop}
                  className="w-10 h-10 rounded-full bg-card sketch-border flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors shadow-md"
                >
                  <Square className="w-4 h-4" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="left">Stop & save transcript</TooltipContent>
            </Tooltip>
          )}

          {/* Main mic button */}
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
                {/* Pulse rings when recording */}
                {status === "recording" && (
                  <>
                    <motion.span
                      className="absolute inset-0 rounded-full bg-hire/30"
                      animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.span
                      className="absolute inset-0 rounded-full bg-hire/20"
                      animate={{ scale: [1, 2], opacity: [0.3, 0] }}
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
        </div>

        {/* Status label */}
        {isActive && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground"
          >
            {config.label}
          </motion.span>
        )}
      </div>
    </TooltipProvider>
  );
};

export default TranscriptMic;
