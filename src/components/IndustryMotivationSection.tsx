import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import HandwrittenLabel from "./HandwrittenLabel";
import { Target, TrendingUp, Heart, Compass, Building2, Sparkles, Shuffle, Eye } from "lucide-react";

type MotivationLevel = "unclear" | "practical" | "passionate";
type SidewaysEngagement = "surface-generic" | "informed-safe" | "genuine-fan" | "opinionated-engaged";

interface IndustryMotivationSectionProps {
  level: MotivationLevel | "";
  reason: string;
  onLevelChange: (level: MotivationLevel) => void;
  onReasonChange: (reason: string) => void;
  sidewaysLevel: SidewaysEngagement | "";
  sidewaysReason: string;
  onSidewaysLevelChange: (level: SidewaysEngagement) => void;
  onSidewaysReasonChange: (reason: string) => void;
  indianExamples: string;
  onIndianExamplesChange: (value: string) => void;
  internationalExamples: string;
  onInternationalExamplesChange: (value: string) => void;
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

const IndustryMotivationSection = ({
  level,
  reason,
  onLevelChange,
  onReasonChange,
  sidewaysLevel,
  sidewaysReason,
  onSidewaysLevelChange,
  onSidewaysReasonChange,
  indianExamples,
  onIndianExamplesChange,
  internationalExamples,
  onInternationalExamplesChange,
}: IndustryMotivationSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Why This Industry sub-block */}
      <div className="space-y-4 p-4 bg-muted/20 rounded-lg sketch-border-light">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-highlighter" />
          <Label className="text-sm font-medium">Why This Industry?</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Capture their specific reason for choosing this industry/role
        </p>

        <Textarea
          id="motivation-reason"
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

      {/* Why Sideways? sub-block */}
      <div className="space-y-4 p-4 bg-muted/20 rounded-lg sketch-border-light">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-highlighter" />
          <Label className="text-sm font-medium">Why Sideways?</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Do they know who we are and why they want to be here specifically?
        </p>

        <div className="space-y-2">
          <Label htmlFor="sideways-reason" className="text-xs text-muted-foreground">
            Have they explored our website sideways.co.in? What appeals to them about Sideways? What would they change or critique about our work?
          </Label>
          <Textarea
            id="sideways-reason"
            placeholder="E.g., 'Loved the XYZ campaign', 'Would redesign the portfolio section'..."
            value={sidewaysReason}
            onChange={(e) => onSidewaysReasonChange(e.target.value)}
            className="sketch-border-light bg-background min-h-[100px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="indian-examples" className="text-xs text-muted-foreground">
            🇮🇳 Indian campaigns or work they found inspirational
          </Label>
          <Textarea
            id="indian-examples"
            placeholder="E.g., 'The Amul topicals', 'Swiggy's voice of hunger', 'Fevicol's long-running print work'..."
            value={indianExamples}
            onChange={(e) => onIndianExamplesChange(e.target.value)}
            className="sketch-border-light bg-background min-h-[80px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="international-examples" className="text-xs text-muted-foreground">
            🌍 International campaigns or work they found inspirational
          </Label>
          <Textarea
            id="international-examples"
            placeholder="E.g., 'Apple's Shot on iPhone', 'Nike's Dream Crazy', 'Spotify Wrapped'..."
            value={internationalExamples}
            onChange={(e) => onInternationalExamplesChange(e.target.value)}
            className="sketch-border-light bg-background min-h-[80px] resize-none"
          />
        </div>

        <Label className="text-sm font-medium mt-2 block">
          Based on their answer, how Sideways-specific was their engagement?
        </Label>
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

        {sidewaysLevel === "opinionated-engaged" && (
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
    </div>
  );
};

export default IndustryMotivationSection;
