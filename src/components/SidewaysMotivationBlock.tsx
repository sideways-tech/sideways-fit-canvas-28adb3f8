import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import HandwrittenLabel from "./HandwrittenLabel";
import HintTextarea from "./HintTextarea";
import HonestyMeter from "./HonestyMeter";
import { Building2, Sparkles, Shuffle } from "lucide-react";

type SidewaysMotivationLevel = "generic" | "culture-fit" | "sideways-specific";
type HonestyLevel = "flattery" | "diplomatic" | "honest";

interface SidewaysMotivationBlockProps {
  sidewaysLevel: SidewaysMotivationLevel | "";
  sidewaysReason: string;
  onSidewaysLevelChange: (level: SidewaysMotivationLevel) => void;
  onSidewaysReasonChange: (reason: string) => void;
  honestyLevel: HonestyLevel | "";
  onHonestyChange: (value: HonestyLevel) => void;
  campaignExamples: string;
  onCampaignExamplesChange: (value: string) => void;
}

const sidewaysOptions = [
  {
    value: "generic" as SidewaysMotivationLevel,
    label: "Generic — Could Be Any Agency",
    description: '"It seemed like a cool place" or no specific reason',
    icon: Shuffle,
    color: "text-reject",
  },
  {
    value: "culture-fit" as SidewaysMotivationLevel,
    label: "Culture Fit",
    description: "Resonates with values, work style, or team vibe",
    icon: Building2,
    color: "text-highlighter",
  },
  {
    value: "sideways-specific" as SidewaysMotivationLevel,
    label: "Specific to Sideways",
    description: "Knows our work, references projects, articulates unique draw",
    icon: Sparkles,
    color: "text-hire",
  },
];

const SidewaysMotivationBlock = ({
  sidewaysLevel,
  sidewaysReason,
  onSidewaysLevelChange,
  onSidewaysReasonChange,
  honestyLevel,
  onHonestyChange,
  campaignExamples,
  onCampaignExamplesChange,
}: SidewaysMotivationBlockProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-highlighter" />
        <Label className="text-sm font-medium">Why Sideways?</Label>
      </div>
      <p className="text-xs text-muted-foreground">
        Do they know who we are and why they want to be here specifically?
      </p>

      {/* All capture textareas first */}
      <div className="space-y-2">
        <Label htmlFor="sideways-reason" className="text-xs text-muted-foreground">
          Have they explored sideways.co.in? What appeals to them about Sideways? What would they change or critique about our work?
        </Label>
        <HintTextarea
          id="sideways-reason"
          hint="Did they explore sideways.co.in? What appeals? What would they critique?"
          placeholder="E.g., 'Loved the XYZ campaign', 'Would redesign the portfolio section'..."
          value={sidewaysReason}
          onChange={(e) => onSidewaysReasonChange(e.target.value)}
          className="sketch-border-light bg-background min-h-[100px] resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="campaign-examples" className="text-xs text-muted-foreground">
          Campaigns or creative work (Indian or international) they find inspirational
        </Label>
        <HintTextarea
          id="campaign-examples"
          hint="Campaigns they admire — Amul, Fevicol, Apple, Nike, Spotify Wrapped, etc."
          placeholder="E.g., 'Amul topicals', 'Swiggy's voice of hunger', 'Apple's Shot on iPhone', 'Spotify Wrapped'..."
          value={campaignExamples}
          onChange={(e) => onCampaignExamplesChange(e.target.value)}
          className="sketch-border-light bg-background min-h-[100px] resize-none"
        />
        />
      </div>

      {/* Grade: Honesty Meter */}
      <div className="space-y-3 pt-2">
        <Label className="text-sm font-medium">
          Their take on Sideways work — how honest were they?
        </Label>
        <HonestyMeter value={honestyLevel} onChange={onHonestyChange} />
      </div>

      {/* Grade: Sideways Motivation MCQ */}
      <Label className="text-xs text-muted-foreground">
        Based on their answer, how Sideways-specific was their motivation?
      </Label>
      <RadioGroup
        value={sidewaysLevel}
        onValueChange={(val) => onSidewaysLevelChange(val as SidewaysMotivationLevel)}
        className="space-y-3"
      >
        {sidewaysOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = sidewaysLevel === option.value;

          return (
            <motion.div
              key={option.value}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Label
                htmlFor={`sideways-${option.value}`}
                className={`flex items-start gap-4 p-4 cursor-pointer sketch-border-light transition-all duration-200 ${
                  isSelected
                    ? "bg-muted shadow-[2px_2px_0px_0px_hsl(var(--ink))]"
                    : "bg-background hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={`sideways-${option.value}`}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${option.color}`} />
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </Label>
            </motion.div>
          );
        })}
      </RadioGroup>

      {sidewaysLevel === "sideways-specific" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 p-3 bg-hire/10 rounded-lg sketch-border-light"
        >
          <Sparkles className="w-5 h-5 text-hire" />
          <HandwrittenLabel className="text-3xl text-hire">
            They did their homework!
          </HandwrittenLabel>
        </motion.div>
      )}
    </div>
  );
};

export default SidewaysMotivationBlock;
