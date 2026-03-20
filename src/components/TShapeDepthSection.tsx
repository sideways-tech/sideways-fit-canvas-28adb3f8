import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import HandwrittenLabel from "./HandwrittenLabel";
import { Flame } from "lucide-react";

interface TShapeDepthSectionProps {
  depthTopic: string;
  depthScore: number;
  onDepthTopicChange: (topic: string) => void;
  onDepthScoreChange: (score: number) => void;
}

const TShapeDepthSection = ({
  depthTopic,
  depthScore,
  onDepthTopicChange,
  onDepthScoreChange,
}: TShapeDepthSectionProps) => {
  return (
    <div className="space-y-4 p-4 bg-muted/20 rounded-lg sketch-border-light">
      <div className="flex items-center gap-2">
        <Flame className="w-5 h-5 text-highlighter" />
        <Label className="text-sm font-medium">
          Non-Work Obsession
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="depth-topic" className="text-xs text-muted-foreground">
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
  );
};

export default TShapeDepthSection;
