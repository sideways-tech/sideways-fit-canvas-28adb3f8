import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";
import HonestyMeter from "./HonestyMeter";

type HonestyLevel = "flattery" | "diplomatic" | "honest";

interface SidewaysWorkSectionProps {
  sidewaysWebsiteFeedback: string;
  honestyLevel: HonestyLevel | "";
  onFeedbackChange: (value: string) => void;
  onHonestyChange: (value: HonestyLevel) => void;
}

const SidewaysWorkSection = ({
  sidewaysWebsiteFeedback,
  honestyLevel,
  onFeedbackChange,
  onHonestyChange,
}: SidewaysWorkSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Website Feedback */}
      <div className="space-y-4 p-4 bg-muted/20 rounded-lg sketch-border-light">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-highlighter" />
          <Label className="text-sm font-medium">
            Have they explored sideways.co.in?
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          What caught their eye? What would they change? What did they genuinely dislike?
        </p>
        <Textarea
          placeholder="Capture what they liked, disliked, and critiqued about our work and presence..."
          value={sidewaysWebsiteFeedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          className="sketch-border-light bg-background text-sm min-h-[100px]"
        />
      </div>

      {/* Honesty Meter (existing component) */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Their take on Sideways work — how honest were they?
        </Label>
        <HonestyMeter value={honestyLevel} onChange={onHonestyChange} />
      </div>
    </div>
  );
};

export default SidewaysWorkSection;
