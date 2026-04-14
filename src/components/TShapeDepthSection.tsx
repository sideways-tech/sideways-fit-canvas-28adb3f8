import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import HandwrittenLabel from "./HandwrittenLabel";
import { Flame } from "lucide-react";
import { getDisciplineConfig } from "@/lib/disciplineConfig";

interface TShapeDepthSectionProps {
  depthTopic: string;
  depthScore: number;
  department?: string;
  onDepthTopicChange: (topic: string) => void;
  onDepthScoreChange: (score: number) => void;
}

const TShapeDepthSection = ({
  depthTopic,
  depthScore,
  department,
  onDepthTopicChange,
  onDepthScoreChange,
}: TShapeDepthSectionProps) => {
  const config = getDisciplineConfig(department);

  return (
    <div className="space-y-4 p-4 bg-muted/20 rounded-lg sketch-border-light">
      <div className="flex items-center gap-2">
        <Flame className="w-5 h-5 text-highlighter" />
        <Label className="text-sm font-medium">
          Non-Work Obsessions & Cultural Diet
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="depth-topic" className="text-xs text-muted-foreground">
          What's the one thing they can't stop talking about outside of work? Plus any broader interests — books, films, podcasts, hobbies, side projects, cultural diet.
        </Label>
        <Textarea
          id="depth-topic"
          placeholder={config.nonWorkObsessions.placeholder}
          value={depthTopic}
          onChange={(e) => onDepthTopicChange(e.target.value)}
          className="sketch-border-light bg-background min-h-[120px] resize-none"
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
