import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import HandwrittenLabel from "./HandwrittenLabel";
import { Target, TrendingUp, Heart, Compass, Building2, Sparkles, Shuffle } from "lucide-react";

type MotivationLevel = "unclear" | "practical" | "passionate";
type SidewaysMotivationLevel = "generic" | "culture-fit" | "sideways-specific";

interface IndustryMotivationSectionProps {
  level: MotivationLevel | "";
  reason: string;
  onLevelChange: (level: MotivationLevel) => void;
  onReasonChange: (reason: string) => void;
  sidewaysLevel: SidewaysMotivationLevel | "";
  sidewaysReason: string;
  onSidewaysLevelChange: (level: SidewaysMotivationLevel) => void;
  onSidewaysReasonChange: (reason: string) => void;
}

const industryOptions = [
  {
    value: "unclear" as MotivationLevel,
    label: "Unclear / Generic",
    description: '"Wanted to try something new" or couldn\'t articulate why',
    icon: Compass,
    color: "text-reject",
  },
  {
    value: "practical" as MotivationLevel,
    label: "Practical Reasons",
    description: "Career growth, industry reputation, learning opportunity",
    icon: TrendingUp,
    color: "text-highlighter",
  },
  {
    value: "passionate" as MotivationLevel,
    label: "Deep Connection",
    description: "Clear passion for problem-solving, creativity, or impact",
    icon: Heart,
    color: "text-hire",
  },
];

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

const IndustryMotivationSection = ({
  level,
  reason,
  onLevelChange,
  onReasonChange,
  sidewaysLevel,
  sidewaysReason,
  onSidewaysLevelChange,
  onSidewaysReasonChange,
}: IndustryMotivationSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Industry Motivation Level */}
      <RadioGroup
        value={level}
        onValueChange={(val) => onLevelChange(val as MotivationLevel)}
        className="space-y-3"
      >
        {industryOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = level === option.value;

          return (
            <motion.div
              key={option.value}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Label
                htmlFor={`motivation-${option.value}`}
                className={`flex items-start gap-4 p-4 cursor-pointer sketch-border-light transition-all duration-200 ${
                  isSelected
                    ? "bg-muted shadow-[2px_2px_0px_0px_hsl(var(--ink))]"
                    : "bg-background hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={`motivation-${option.value}`}
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

      {/* Their Story */}
      <div className="space-y-3">
        <Label htmlFor="motivation-reason" className="text-sm font-medium flex items-center gap-2">
          <Target className="w-4 h-4 text-muted-foreground" />
          Their Story
        </Label>
        <p className="text-xs text-muted-foreground">
          Capture their specific reason for choosing this industry/role
        </p>
        <Textarea
          id="motivation-reason"
          placeholder="What did they say about why they want to work in creative problem-solving?"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          className="sketch-border-light bg-background min-h-[80px] resize-none"
        />
      </div>

      {/* Why Sideways? sub-block */}
      <div className="space-y-4 p-4 bg-muted/20 rounded-lg sketch-border-light">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-highlighter" />
          <Label className="text-sm font-medium">Why Sideways?</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Do they know who we are and why they want to be here specifically?
        </p>

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

        <div className="space-y-2 pt-2">
          <Label htmlFor="sideways-reason" className="text-xs text-muted-foreground">
            What specifically about Sideways appeals to them?
          </Label>
          <Textarea
            id="sideways-reason"
            placeholder="E.g., 'Loved the XYZ campaign', 'Resonated with the problem-solving approach', 'Knows someone here'..."
            value={sidewaysReason}
            onChange={(e) => onSidewaysReasonChange(e.target.value)}
            className="sketch-border-light bg-background min-h-[80px] resize-none"
          />
        </div>

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

      {/* Passionate indicator */}
      {level === "passionate" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 p-3 bg-hire/10 rounded-lg sketch-border-light"
        >
          <Heart className="w-5 h-5 text-hire fill-hire" />
          <HandwrittenLabel className="text-3xl text-hire">
            Genuine Intent!
          </HandwrittenLabel>
        </motion.div>
      )}
    </div>
  );
};

export default IndustryMotivationSection;
