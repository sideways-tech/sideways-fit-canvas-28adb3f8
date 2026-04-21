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
    description: "Vague praise or no specific take — could be about any agency",
    icon: Shuffle,
    color: "text-reject",
  },
  {
    value: "informed-safe" as SidewaysEngagement,
    label: "Informed but Safe",
    description: "Knows our work, can name projects, but offers no real opinion or POV",
    icon: Eye,
    color: "text-highlighter",
  },
  {
    value: "genuine-fan" as SidewaysEngagement,
    label: "Genuine Admiration",
    description: "Specific, detailed, authentic praise — clearly did their homework and means it",
    icon: Heart,
    color: "text-hire",
  },
  {
    value: "opinionated-engaged" as SidewaysEngagement,
    label: "Opinionated & Engaged",
    description: "Has a clear POV on our work — offers critique, suggestions, or strong takes",
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
        <Textarea
          id="sideways-reason"
          placeholder="E.g., 'Loved the XYZ campaign', 'Would redesign the portfolio section'..."
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
          This isn't about whether they praised or critiqued — it's about how deeply they engaged with who we are and what we do.
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
