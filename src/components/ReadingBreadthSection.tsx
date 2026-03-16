import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import HandwrittenLabel from "./HandwrittenLabel";
import { BookOpen, Users, Globe } from "lucide-react";

interface ReadingBreadthSectionProps {
  interestedInOthers: number;
  readsWidely: number;
  recentReadExample: string;
  onInterestedInOthersChange: (value: number) => void;
  onReadsWidelyChange: (value: number) => void;
  onRecentReadExampleChange: (value: string) => void;
}

const ReadingBreadthSection = ({
  interestedInOthers,
  readsWidely,
  recentReadExample,
  onInterestedInOthersChange,
  onReadsWidelyChange,
  onRecentReadExampleChange
}: ReadingBreadthSectionProps) => {
  const breadthScore = Math.round((interestedInOthers + readsWidely) / 2);

  return (
    <div className="space-y-6">
      {/* B. Interested in Other People's Lives */}
      <div className="space-y-4 p-4 bg-muted/20 rounded-lg sketch-border-light">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-highlighter" />
          <Label className="text-sm font-medium">
            B. Interested in Other People's Lives
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Not living in a bubble — genuinely curious about others
        </p>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <HandwrittenLabel className="text-xl text-muted-foreground">
              Curiosity about others
            </HandwrittenLabel>
            <span className="text-sm font-medium tabular-nums">{interestedInOthers}%</span>
          </div>
          <Slider
            value={[interestedInOthers]}
            onValueChange={([value]) => onInterestedInOthersChange(value)}
            max={100}
            step={5}
            className="w-full" />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Self-focused</span>
            <span>Asks about everyone's story</span>
          </div>
        </div>
      </div>

      {/* D. Reads Widely */}
      <div className="space-y-4 p-4 bg-muted/20 rounded-lg sketch-border-light">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-highlighter" />
          <Label className="text-sm font-medium">
            D. Reads Widely (Beyond Their Domain)
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
            className="w-full" />
          
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
            className="sketch-border-light bg-background text-sm" />
          
        </div>
      </div>

      {/* Combined Breadth Score */}
      <div className="flex items-center justify-between p-3 bg-highlighter/10 rounded-lg sketch-border-light">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-highlighter" />
          <span className="text-sm font-medium">Societal Awareness & Intellectual Habits Score

          </span>
        </div>
        <HandwrittenLabel className={`text-3xl ${breadthScore >= 70 ?
        "text-hire" :
        breadthScore >= 40 ?
        "text-highlighter" :
        "text-muted-foreground"}`
        }>
          
          {breadthScore}%
        </HandwrittenLabel>
      </div>
    </div>);

};

export default ReadingBreadthSection;