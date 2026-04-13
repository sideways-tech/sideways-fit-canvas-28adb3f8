import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";

interface FloatingHintProps {
  hint: string;
  isActive: boolean;
  position?: "right" | "top";
}

const FloatingHint = ({ hint, isActive, position = "right" }: FloatingHintProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(isActive);
  }, [isActive]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: position === "right" ? -8 : 0, y: position === "top" ? 8 : 0 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: position === "right" ? -8 : 0, y: position === "top" ? 8 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`
            absolute z-10 max-w-[220px]
            ${position === "right" ? "left-full ml-3 top-2" : "bottom-full mb-3 left-4"}
          `}
        >
          <div className="relative bg-highlighter/15 border border-highlighter/30 rounded-xl px-3 py-2 shadow-md backdrop-blur-sm">
            <div className="flex items-start gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-highlighter shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/80 leading-relaxed">{hint}</p>
            </div>
            {/* Speech bubble tail */}
            {position === "right" && (
              <div className="absolute top-4 -left-1.5 w-3 h-3 bg-highlighter/15 border-l border-b border-highlighter/30 rotate-45" />
            )}
            {position === "top" && (
              <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-highlighter/15 border-r border-b border-highlighter/30 rotate-45" />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingHint;
