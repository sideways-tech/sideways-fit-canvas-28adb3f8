import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import HandwrittenLabel from "./HandwrittenLabel";
import HintTextarea from "./HintTextarea";
import { Flame } from "lucide-react";

interface TShapeDepthSectionProps {
  depthTopic: string;
  depthScore: number;
  interestsPassionsNotes: string;
  onDepthTopicChange: (topic: string) => void;
  onDepthScoreChange: (score: number) => void;
  onInterestsPassionsNotesChange: (notes: string) => void;
}

const TShapeDepthSection = ({
  depthTopic,
  depthScore,
  interestsPassionsNotes,
  onDepthTopicChange,
  onDepthScoreChange,
  onInterestsPassionsNotesChange,
}: TShapeDepthSectionProps) => {
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
          What's the one thing they can't stop talking about outside of work? A single deep rabbit hole.
        </Label>
        <HintTextarea
          id="depth-topic"
          hint="Capture the ONE obsession — 18th Century Pottery, Carnatic Music, Retro Gaming, Bird Watching..."
          placeholder="e.g., 18th Century Pottery, Carnatic Music, Retro Gaming, Bird Watching — describe what they said about it..."
          value={depthTopic}
          onChange={(e) => onDepthTopicChange(e.target.value)}
          className="sketch-border-light bg-background min-h-[100px] resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="interests-passions-notes" className="text-xs text-muted-foreground">
          Beyond the one obsession — what else do they consume or dabble in? Books, films, podcasts, hobbies, side projects, cultural interests.
        </Label>
        <HintTextarea
          id="interests-passions-notes"
          hint="Their broader cultural diet — architecture docs, Murakami, pottery Instagram, podcasts, hobbies..."
          placeholder="e.g. Obsessed with architecture documentaries, reads Murakami, runs a pottery Instagram..."
          value={interestsPassionsNotes}
          onChange={(e) => onInterestsPassionsNotesChange(e.target.value)}
          className="sketch-border-light bg-background min-h-[100px] resize-none"
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
