import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import HandwrittenLabel from "./HandwrittenLabel";
import { Archive, Sparkles, XCircle, ThumbsDown, ThumbsUp, Award } from "lucide-react";

type Verdict = "strong-no" | "lean-no" | "lean-yes" | "strong-yes";

interface CategoryScores {
  person: number;
  professional: number;
  mindset: number;
  overall: number;
}

interface VerdictFooterProps {
  verdict: Verdict;
  scores: CategoryScores;
  onArchive: () => void;
  onInvite: () => void;
}

const verdictConfig = {
  "strong-no": {
    label: "Strong No",
    sublabel: "Not a fit for Sideways",
    icon: XCircle,
    bgColor: "bg-reject/10",
    textColor: "text-reject",
    description:
      "Significant gaps across key dimensions. The candidate is unlikely to thrive in a diagnostic, T-shaped culture.",
  },
  "lean-no": {
    label: "Lean No",
    sublabel: "Below the bar — revisit if they grow",
    icon: ThumbsDown,
    bgColor: "bg-reject/5",
    textColor: "text-reject",
    description:
      "Some promising signals but one or more categories fall short. Consider reconnecting in 6–12 months.",
  },
  "lean-yes": {
    label: "Lean Yes",
    sublabel: "Above the bar — worth a second look",
    icon: ThumbsUp,
    bgColor: "bg-hire/5",
    textColor: "text-hire",
    description:
      "Clears the minimum thresholds across all categories. A follow-up conversation or work trial is recommended.",
  },
  "strong-yes": {
    label: "Strong Yes",
    sublabel: "Trusted Advisor Material",
    icon: Award,
    bgColor: "bg-hire/10",
    textColor: "text-hire",
    description:
      "Diagnostic mindset, T-shaped curiosity, and genuine alignment with Sideways culture. Ready for the Circus!",
  },
};

const categoryLabels: { key: keyof CategoryScores; label: string }[] = [
  { key: "person", label: "The Person" },
  { key: "professional", label: "The Professional" },
  { key: "mindset", label: "Mindset & Alignment" },
  { key: "overall", label: "Overall" },
];

const getScoreColor = (score: number) => {
  if (score >= 60) return "text-hire";
  if (score >= 40) return "text-highlighter";
  return "text-reject";
};

const getBarColor = (score: number) => {
  if (score >= 60) return "bg-hire";
  if (score >= 40) return "bg-highlighter";
  return "bg-reject";
};

const VerdictFooter = ({ verdict, scores, onArchive, onInvite }: VerdictFooterProps) => {
  const config = verdictConfig[verdict];
  const Icon = config.icon;
  const isHireable = verdict === "lean-yes" || verdict === "strong-yes";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-6"
    >
      {/* Category Scores Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categoryLabels.map(({ key, label }) => (
          <div key={key} className="p-3 rounded-lg sketch-border-light bg-muted/20 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className={`text-2xl font-bold tabular-nums ${getScoreColor(scores[key])}`}>
              {scores[key]}
            </p>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${getBarColor(scores[key])}`}
                initial={{ width: 0 }}
                animate={{ width: `${scores[key]}%` }}
                transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Verdict Card */}
      <div className={`p-6 rounded-lg sketch-border ${config.bgColor}`}>
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
          >
            <Icon className={`w-12 h-12 ${config.textColor}`} />
          </motion.div>
          <div className="flex-1 space-y-2">
            <div>
              <HandwrittenLabel className={`text-5xl ${config.textColor}`}>
                {config.label}
              </HandwrittenLabel>
              <p className="text-sm text-muted-foreground">{config.sublabel}</p>
            </div>
            <p className="text-sm">{config.description}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={onArchive}
          className="w-full sm:w-[40%] sketch-border-light gap-2 h-12"
        >
          <Archive className="w-4 h-4" />
          Save Report Card
        </Button>
      </div>
    </motion.div>
  );
};

export default VerdictFooter;