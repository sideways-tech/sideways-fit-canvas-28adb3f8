import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SketchCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const SketchCard = ({ children, className, delay = 0 }: SketchCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(
        "sketch-border bg-card p-6 shadow-[4px_4px_0px_0px_hsl(var(--ink))]",
        "hover:shadow-[6px_6px_0px_0px_hsl(var(--ink))] transition-shadow duration-200",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default SketchCard;
