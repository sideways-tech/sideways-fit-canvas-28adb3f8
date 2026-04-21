import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import HandwrittenLabel from "./HandwrittenLabel";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Sparkles, Shuffle, Eye, Heart } from "lucide-react";
import { getDisciplineConfig } from "@/lib/disciplineConfig";

type SidewaysEngagement = "surface-generic" | "informed-safe" | "genuine-fan" | "opinionated-engaged";

interface SidewaysMotivationBlockProps {
  sidewaysLevel: SidewaysEngagement | "";
  sidewaysReason: string;
  onSidewaysLevelChange: (level: SidewaysEngagement) => void;
  onSidewaysReasonChange: (reason: string) => void;
  department?: string;
}

const engagementOptions = [
  {
    value: "surface-generic" as SidewaysEngagement,
    label: "Surface-Level / Generic",
    description: "No real take. Vague comments that could apply to any agency.",
    icon: Shuffle,
    color: "text-reject",
  },
  {
    value: "informed-safe" as SidewaysEngagement,
    label: "Informed but Safe",
    description: "Knows our work, can name projects — but withholds any real opinion.",
    icon: Eye,
    color: "text-highlighter",
  },
  {
    value: "genuine-fan" as SidewaysEngagement,
    label: "Genuine Admiration",
    description: "Specific and authentic engagement with our work — clearly thought about it, even if mostly positive.",
    icon: Heart,
    color: "text-hire",
  },
  {
    value: "opinionated-engaged" as SidewaysEngagement,
    label: "Opinionated & Engaged",
    description: "Has a sharp POV — willing to dissect, push back, or offer a strong read on where we're headed.",
    icon: Sparkles,
    color: "text-hire",
  },
];

const SidewaysMotivationBlock = ({
  sidewaysLevel,
  sidewaysReason,
  onSidewaysLevelChange,
  onSidewaysReasonChange,
  department,
}: SidewaysMotivationBlockProps) => {
  const config = getDisciplineConfig(department);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-highlighter" />
        <Label className="text-sm font-medium">Their POV on Sideways</Label>
      </div>

      {/* All capture textareas first */}
      <div className="space-y-2">
        <Label htmlFor="sideways-reason" className="text-xs text-muted-foreground">
          What is their perspective on the work we do at Sideways?
        </Label>
        <p className="text-[11px] text-muted-foreground/80 -mt-1">
          Have they explored sideways.co.in? Listen for a sharp POV on our approach, specific projects, or where we sit in the industry — engagement over flattery.
        </p>
        <Textarea
          id="sideways-reason"
          placeholder="E.g., 'Thinks our XYZ campaign nailed the insight but felt safe in execution', 'Sees us as the anti-template agency'..."
          value={sidewaysReason}
          onChange={(e) => onSidewaysReasonChange(e.target.value)}
          className="sketch-border-light bg-background min-h-[100px] resize-none"
        />
      </div>

      {/* Merged Grade: Quality of Sideways Engagement */}
      <div className="space-y-3 pt-2">
        <Label className="text-sm font-medium">
          How would you rate the quality of their engagement with Sideways?
        </Label>
        <p className="text-xs text-muted-foreground">
          This isn't about praise or critique — it's about whether they have a real point of view on Sideways and the work we do.
        </p>
      </div>

      <RadioGroup
        value={sidewaysLevel}
        onValueChange={(val) => onSidewaysLevelChange(val as SidewaysEngagement)}
        className="space-y-3"
      >
        {engagementOptions.map((option) => {
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

      {(sidewaysLevel === "genuine-fan" || sidewaysLevel === "opinionated-engaged") && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 p-3 bg-hire/10 rounded-lg sketch-border-light"
        >
          <Sparkles className="w-5 h-5 text-hire" />
          <HandwrittenLabel className="text-3xl text-hire">
            {sidewaysLevel === "opinionated-engaged" ? "They brought receipts!" : "They did their homework!"}
          </HandwrittenLabel>
        </motion.div>
      )}
    </div>
  );
};

export default SidewaysMotivationBlock;
