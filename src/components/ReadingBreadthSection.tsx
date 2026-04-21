import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import HandwrittenLabel from "./HandwrittenLabel";
import { BookOpen } from "lucide-react";

interface ReadingBreadthSectionProps {
  readsWidely: number;
  recentReadExample: string;
  onReadsWidelyChange: (value: number) => void;
  onRecentReadExampleChange: (value: string) => void;
}

const ReadingBreadthSection = ({
  readsWidely,
  recentReadExample,
  onReadsWidelyChange,
  onRecentReadExampleChange,
}: ReadingBreadthSectionProps) => {
  return (
    <div className="space-y-4 p-4 bg-muted/20 rounded-lg sketch-border-light">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-highlighter" />
        <Label className="text-sm font-medium">
          Reads Widely (within domain + outside of domain)
        </Label>
      </div>
      <p className="text-xs text-muted-foreground">
        Non-work reading — diverse intellectual diet
      </p>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <HandwrittenLabel className="text-xl text-muted-foreground">
            Reading breadth
          </HandwrittenLabel>
          <span className="text-sm font-medium tabular-nums">{readsWidely}%</span>
        </div>
        <Slider
          value={[readsWidely]}
          onValueChange={([value]) => onReadsWidelyChange(value)}
          max={100}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Reads only work stuff</span>
          <span>Voracious & varied reader</span>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <Label htmlFor="recent-read" className="text-xs text-muted-foreground">
          Recent non-work read mentioned?
        </Label>
        <Input
          id="recent-read"
          placeholder="E.g., 'Sapiens', a poetry collection, science magazine..."
          value={recentReadExample}
          onChange={(e) => onRecentReadExampleChange(e.target.value)}
          className="sketch-border-light bg-background text-sm"
        />
      </div>
    </div>
  );
};

export default ReadingBreadthSection;
