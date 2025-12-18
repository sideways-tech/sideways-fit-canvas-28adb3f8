import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import HandwrittenLabel from "./HandwrittenLabel";

interface TShapeVisualizerProps {
  depthTopic: string;
  depthScore: number;
  breadthScore: number;
  onDepthTopicChange: (topic: string) => void;
  onDepthScoreChange: (score: number) => void;
  onBreadthScoreChange: (score: number) => void;
}

const TShapeVisualizer = ({
  depthTopic,
  depthScore,
  breadthScore,
  onDepthTopicChange,
  onDepthScoreChange,
}: TShapeVisualizerProps) => {
  const verticalHeight = Math.max(20, (depthScore / 100) * 180);
  const horizontalWidth = Math.max(40, (breadthScore / 100) * 280);

  return (
    <div className="space-y-8">
      {/* T-Shape Visualization */}
      <div className="flex justify-center py-8">
        <div className="relative w-72 h-56">
          {/* Center point marker */}
          <div className="absolute left-1/2 top-8 w-2 h-2 bg-muted-foreground/30 rounded-full -translate-x-1/2" />
          
          {/* Horizontal Bar (Breadth/Empathy) - Yellow - from B & D sections */}
          <motion.div
            className="absolute top-4 left-1/2 h-4 bg-highlighter rounded-sm"
            style={{
              marginLeft: -horizontalWidth / 2,
            }}
            initial={{ width: 40 }}
            animate={{ width: horizontalWidth }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          />
          
          {/* Vertical Bar (Depth/Obsession) - Black */}
          <motion.div
            className="absolute top-4 left-1/2 w-4 bg-ink rounded-sm -translate-x-1/2"
            initial={{ height: 20 }}
            animate={{ height: verticalHeight }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          />

          {/* Labels */}
          <div className="absolute -left-4 top-2 text-xs text-muted-foreground font-handwritten text-2xl -rotate-12">
            Society →
          </div>
          <div className="absolute left-1/2 bottom-0 text-xs text-muted-foreground font-handwritten text-2xl rotate-6 translate-x-4">
            ↓ Depth
          </div>
        </div>
      </div>

      {/* Depth Topic Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="depth-topic" className="text-sm font-medium">
            What's their obsession? (Non-work topic)
          </Label>
          <Input
            id="depth-topic"
            placeholder="e.g., 18th Century Pottery, Carnatic Music, Retro Gaming, Bird Watching..."
            value={depthTopic}
            onChange={(e) => onDepthTopicChange(e.target.value)}
            className="sketch-border-light bg-background"
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <HandwrittenLabel className="text-2xl text-muted-foreground">
              Obsession Level
            </HandwrittenLabel>
            <span className="text-sm font-medium tabular-nums">{depthScore}%</span>
          </div>
          <Slider
            value={[depthScore]}
            onValueChange={([value]) => onDepthScoreChange(value)}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Casual mention</span>
            <span>Could write a thesis</span>
          </div>
        </div>
      </div>

      {/* Breadth indicator (read-only, fed from B & D) */}
      <div className="p-3 bg-highlighter/10 rounded-lg sketch-border-light">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Breadth Score (from B & D)
          </span>
          <HandwrittenLabel className="text-2xl">{breadthScore}%</HandwrittenLabel>
        </div>
      </div>

      {/* T-Shape Assessment */}
      <div className="pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">T-Shape Status:</span>
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
