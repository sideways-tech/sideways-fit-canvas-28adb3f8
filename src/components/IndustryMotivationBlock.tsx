import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import HandwrittenLabel from "./HandwrittenLabel";
import HintTextarea from "./HintTextarea";
import { Target, TrendingUp, Heart, Compass } from "lucide-react";
import { getDisciplineConfig } from "@/lib/disciplineConfig";

type MotivationLevel = "unclear" | "practical" | "passionate";

interface IndustryMotivationBlockProps {
  level: MotivationLevel | "";
  reason: string;
  department?: string;
  onLevelChange: (level: MotivationLevel) => void;
  onReasonChange: (reason: string) => void;
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

const IndustryMotivationBlock = ({
  level,
  reason,
  department,
  onLevelChange,
  onReasonChange,
}: IndustryMotivationBlockProps) => {
  const config = getDisciplineConfig(department);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-highlighter" />
        <Label className="text-sm font-medium">Why This Industry?</Label>
      </div>
      <p className="text-xs text-muted-foreground">
        Capture their specific reason for choosing this industry/role
      </p>

      <HintTextarea
        id="motivation-reason"
        hint={config.industryMotivation.hint}
        placeholder="What did they say about why they want to work in this industry or role?"
        value={reason}
        onChange={(e) => onReasonChange(e.target.value)}
        className="sketch-border-light bg-background min-h-[80px] resize-none"
      />

      <Label className="text-xs text-muted-foreground">
        Based on their answer, how would you rate their industry motivation?
      </Label>
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

export default IndustryMotivationBlock;
