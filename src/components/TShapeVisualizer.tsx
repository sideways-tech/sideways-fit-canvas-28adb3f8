import { motion } from "framer-motion";
import HandwrittenLabel from "./HandwrittenLabel";

interface TShapeVisualizerProps {
  depthScore: number;
  breadthScore: number;
}

const TShapeVisualizer = ({
  depthScore,
  breadthScore,
}: TShapeVisualizerProps) => {
  const verticalHeight = Math.max(20, (depthScore / 100) * 180);
  const horizontalWidth = Math.max(40, (breadthScore / 100) * 280);

  return (
    <div className="space-y-6">
      {/* T-Shaped Visualization */}
      <div className="flex justify-center py-8">
        <div className="relative w-72 h-56">
          {/* Center point marker */}
          <div className="absolute left-1/2 top-8 w-2 h-2 bg-muted-foreground/30 rounded-full -translate-x-1/2" />
          
          {/* Horizontal Bar (Breadth) - Yellow */}
          <motion.div
            className="absolute top-4 left-1/2 h-4 bg-highlighter rounded-sm"
            style={{
              marginLeft: -horizontalWidth / 2,
            }}
            initial={{ width: 40 }}
            animate={{ width: horizontalWidth }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          />
          
          {/* Vertical Bar (Depth) - Black */}
          <motion.div
            className="absolute top-4 left-1/2 w-4 bg-ink rounded-sm -translate-x-1/2"
            initial={{ height: 20 }}
            animate={{ height: verticalHeight }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          />

          {/* Labels with scores */}
          <div className="absolute -left-4 top-2 text-muted-foreground font-handwritten text-3xl -rotate-12">
            Breadth → <span className="text-ink font-bold">{breadthScore}</span>
          </div>
          <div className="absolute left-1/2 bottom-0 text-muted-foreground font-handwritten text-3xl rotate-6 translate-x-4">
            ↓ Depth <span className="text-ink font-bold">{depthScore}</span>
          </div>
        </div>
      </div>

      {/* T-Shaped Assessment */}
      <div className="pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">T-Shaped Status:</span>
          <HandwrittenLabel 
            className={`text-3xl ${
              depthScore >= 60 && breadthScore >= 60 
                ? "text-hire" 
                : depthScore >= 40 && breadthScore >= 40 
                  ? "text-highlighter" 
                  : "text-muted-foreground"
            }`}
          >
            {depthScore >= 60 && breadthScore >= 60 
              ? "Strong T! ✓" 
              : depthScore >= 40 && breadthScore >= 40 
                ? "Emerging T" 
                : "Needs development"}
          </HandwrittenLabel>
        </div>
      </div>
    </div>
  );
};

export default TShapeVisualizer;
