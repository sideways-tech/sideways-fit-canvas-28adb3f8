import { memo } from "react";
import HandwrittenLabel from "./HandwrittenLabel";

interface TShapeVisualizerProps {
  depthScore: number;
  breadthScore: number;
  title?: string;
  size?: "default" | "compact" | "tiny";
}

const TShapeVisualizer = ({
  depthScore,
  breadthScore,
  title,
  size = "default",
}: TShapeVisualizerProps) => {
  const dims =
    size === "tiny"
      ? { maxV: 70, maxH: 110, w: "w-32", h: "h-28", barT: "h-2", barW: "w-2", top: "top-3", dotTop: "top-6" }
      : size === "compact"
        ? { maxV: 140, maxH: 220, w: "w-60", h: "h-48", barT: "h-4", barW: "w-4", top: "top-4", dotTop: "top-8" }
        : { maxV: 180, maxH: 280, w: "w-72", h: "h-56", barT: "h-4", barW: "w-4", top: "top-4", dotTop: "top-8" };

  const verticalHeight = Math.max(size === "tiny" ? 10 : 20, (depthScore / 100) * dims.maxV);
  const horizontalWidth = Math.max(size === "tiny" ? 20 : 40, (breadthScore / 100) * dims.maxH);

  const status =
    depthScore >= 60 && breadthScore >= 60
      ? { label: "Strong T! ✓", color: "text-hire" }
      : depthScore >= 40 && breadthScore >= 40
        ? { label: "Emerging T", color: "text-highlighter" }
        : { label: "Needs dev.", color: "text-muted-foreground" };

  if (size === "tiny") {
    return (
      <div className="flex flex-col items-center gap-1">
        {title && (
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </div>
        )}
        <div className={`relative ${dims.w} ${dims.h}`}>
          <div
            className={`absolute ${dims.top} left-1/2 ${dims.barT} bg-highlighter rounded-sm transition-[width,margin] duration-300 ease-out`}
            style={{ width: horizontalWidth, marginLeft: -horizontalWidth / 2 }}
          />
          <div
            className={`absolute ${dims.top} left-1/2 ${dims.barW} bg-ink rounded-sm -translate-x-1/2 transition-[height] duration-300 ease-out`}
            style={{ height: verticalHeight }}
          />
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>B:<span className="text-ink font-bold ml-0.5">{breadthScore}</span></span>
          <span>D:<span className="text-ink font-bold ml-0.5">{depthScore}</span></span>
        </div>
        <span className={`text-[10px] font-semibold ${status.color}`}>{status.label}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
          {title} T-Shape
        </div>
      )}

      <div className="flex justify-center py-6">
        <div className={`relative ${dims.w} ${dims.h}`}>
          <div className={`absolute left-1/2 ${dims.dotTop} w-2 h-2 bg-muted-foreground/30 rounded-full -translate-x-1/2`} />
          <div
            className={`absolute ${dims.top} left-1/2 ${dims.barT} bg-highlighter rounded-sm transition-[width,margin] duration-300 ease-out`}
            style={{ width: horizontalWidth, marginLeft: -horizontalWidth / 2 }}
          />
          <div
            className={`absolute ${dims.top} left-1/2 ${dims.barW} bg-ink rounded-sm -translate-x-1/2 transition-[height] duration-300 ease-out`}
            style={{ height: verticalHeight }}
          />
          <div className="absolute -left-4 -top-8 text-muted-foreground font-handwritten text-2xl -rotate-12">
            Breadth → <span className="text-ink font-bold">{breadthScore}</span>
          </div>
          <div className="absolute left-1/2 bottom-0 text-muted-foreground font-handwritten text-2xl rotate-6 translate-x-4">
            ↓ Depth <span className="text-ink font-bold">{depthScore}</span>
          </div>
        </div>
      </div>

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
