import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";

interface FloatingHintProps {
  hint: string;
  isActive: boolean;
  position?: "left" | "right" | "top";
}

const FloatingHint = ({ hint, isActive, position = "left" }: FloatingHintProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(isActive);
  }, [isActive]);

  const positionClasses = {
    left: "right-full mr-3 top-2",
    right: "left-full ml-3 top-2",
    top: "bottom-full mb-3 left-4",
  };

  const animateFrom = {
    left: { x: 8, y: 0 },
    right: { x: -8, y: 0 },
    top: { x: 0, y: 8 },
  };

  const tailStyles = {
    left: "absolute top-4 -right-1.5 w-3 h-3 bg-highlighter/25 border-r border-t border-highlighter/40 rotate-45",
    right: "absolute top-4 -left-1.5 w-3 h-3 bg-highlighter/25 border-l border-b border-highlighter/40 rotate-45",
    top: "absolute -bottom-1.5 left-6 w-3 h-3 bg-highlighter/25 border-r border-b border-highlighter/40 rotate-45",
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, ...animateFrom[position] }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, ...animateFrom[position] }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`absolute z-10 max-w-[200px] ${positionClasses[position]}`}
        >
          <div className="relative bg-highlighter/25 border border-highlighter/40 rounded-xl px-3 py-2 shadow-md">
            <div className="flex items-start gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-highlighter shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/90 leading-relaxed">{hint}</p>
            </div>
            <div className={tailStyles[position]} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingHint;
