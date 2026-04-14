import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import HandwrittenLabel from "./HandwrittenLabel";
import FloatingHint from "./FloatingHint";
import { Users } from "lucide-react";

interface InterestedInOthersSectionProps {
  value: number;
  onChange: (value: number) => void;
}

const InterestedInOthersSection = ({ value, onChange }: InterestedInOthersSectionProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="space-y-4 p-4 bg-muted/20 rounded-lg sketch-border-light">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-highlighter" />
        <Label className="text-sm font-medium">
          Interested in Other People's Lives
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
          <span className="text-sm font-medium tabular-nums">{value}%</span>
        </div>
        <div
          className="relative overflow-visible"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Slider
            value={[value]}
            onValueChange={([v]) => onChange(v)}
            max={100}
            step={5}
            className="w-full"
          />
          <FloatingHint
            hint="Look for: Do they ask about your life unprompted? Remember details about others? Show curiosity about the interviewer's background — not just polite small talk?"
            isActive={hovered}
            position="left"
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Self-focused</span>
          <span>Asks about everyone's story</span>
        </div>
      </div>
    </div>
  );
};

export default InterestedInOthersSection;
