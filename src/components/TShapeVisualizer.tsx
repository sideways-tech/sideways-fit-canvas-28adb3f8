import { memo } from "react";
import HandwrittenLabel from "./HandwrittenLabel";

interface TShapeVisualizerProps {
  depthScore: number;
  breadthScore: number;
  title?: string;
  compact?: boolean;
}

const TShapeVisualizer = ({
  depthScore,
  breadthScore,
  title,
  compact = false,
}: TShapeVisualizerProps) => {
  const maxVertical = compact ? 140 : 180;
  const maxHorizontal = compact ? 220 : 280;
  const verticalHeight = Math.max(20, (depthScore / 100) * maxVertical);
  const horizontalWidth = Math.max(40, (breadthScore / 100) * maxHorizontal);

  const status =
    depthScore >= 60 && breadthScore >= 60
      ? { label: "Strong T! ✓", color: "text-hire" }
      : depthScore >= 40 && breadthScore >= 40
        ? { label: "Emerging T", color: "text-highlighter" }
        : { label: "Needs development", color: "text-muted-foreground" };

  return (
    <div className="space-y-4">
      {title && (
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
          {title} T-Shape
        </div>
      )}

      {/* T-Shaped Visualization */}
      <div className="flex justify-center py-6">
        <div className={`relative ${compact ? "w-60 h-48" : "w-72 h-56"}`}>
          {/* Center point marker */}
          <div className="absolute left-1/2 top-8 w-2 h-2 bg-muted-foreground/30 rounded-full -translate-x-1/2" />

          {/* Horizontal Bar (Breadth) - Yellow */}
          <div
            className="absolute top-4 left-1/2 h-4 bg-highlighter rounded-sm transition-[width,margin] duration-300 ease-out"
            style={{
              width: horizontalWidth,
              marginLeft: -horizontalWidth / 2,
            }}
          />

          {/* Vertical Bar (Depth) - Black */}
          <div
            className="absolute top-4 left-1/2 w-4 bg-ink rounded-sm -translate-x-1/2 transition-[height] duration-300 ease-out"
            style={{ height: verticalHeight }}
          />

          {/* Labels with scores */}
          <div className="absolute -left-4 -top-8 text-muted-foreground font-handwritten text-2xl -rotate-12">
            Breadth → <span className="text-ink font-bold">{breadthScore}</span>
          </div>
          <div className="absolute left-1/2 bottom-0 text-muted-foreground font-handwritten text-2xl rotate-6 translate-x-4">
            ↓ Depth <span className="text-ink font-bold">{depthScore}</span>
          </div>
        </div>
      </div>

      {/* T-Shaped Assessment */}
      <div className="pt-3 border-t border-border/50">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Status:</span>
          <HandwrittenLabel className={`text-2xl ${status.color}`}>
            {status.label}
          </HandwrittenLabel>
        </div>
      </div>
    </div>
  );
};

export default memo(TShapeVisualizer);
