import { motion } from "framer-motion";
import HandwrittenLabel from "./HandwrittenLabel";
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  HelpCircle,
  Lightbulb,
  Users,
  BookOpen,
  Shield,
  Star,
  Palette,
  Heart,
  Wrench,
  Mic,
  Briefcase,
  Puzzle,
} from "lucide-react";

type DiagnosticLevel = "order-taker" | "clarifier" | "diagnostician" | "";
type HonestyLevel = "flattery" | "diplomatic" | "honest" | "";
type MotivationLevel = "unclear" | "practical" | "passionate" | "";

interface ScoresSummaryProps {
  diagnosticLevel: DiagnosticLevel;
  interestedInOthers: number;
  readsWidely: number;
  depthScore: number;
  depthTopic: string;
  honestyLevel: HonestyLevel;
  resilienceScore: number;
  aestheticsInterest: number;
  motivationLevel: MotivationLevel;
  depthOfCraft: number;
  articulationSkill: number;
  portfolioQuality: number;
  problemSolvingApproach: number;
  professionalBreadth: number;
}

type Status = "excellent" | "good" | "needs-work" | "not-assessed";

interface ScoreItem {
  label: string;
  section: string;
  status: Status;
  value: string;
  icon: React.ElementType;
}

const getStatusColor = (status: Status) => {
  switch (status) {
    case "excellent": return "text-hire bg-hire/10 border-hire/30";
    case "good": return "text-highlighter bg-highlighter/10 border-highlighter/30";
    case "needs-work": return "text-reject bg-reject/10 border-reject/30";
    case "not-assessed": return "text-muted-foreground bg-muted/50 border-border";
  }
};

const getStatusIcon = (status: Status) => {
  switch (status) {
    case "excellent": return CheckCircle2;
    case "good": return AlertCircle;
    case "needs-work": return XCircle;
    case "not-assessed": return HelpCircle;
  }
};

const getScoreStatus = (score: number): Status => {
  if (score >= 70) return "excellent";
  if (score >= 40) return "good";
  return "needs-work";
};

const ScoresSummary = ({
  diagnosticLevel,
  interestedInOthers,
  readsWidely,
  depthScore,
  depthTopic,
  honestyLevel,
  resilienceScore,
  aestheticsInterest,
  motivationLevel,
  depthOfCraft,
  articulationSkill,
  portfolioQuality,
  problemSolvingApproach,
}: ScoresSummaryProps) => {
  const breadthScore = Math.round((interestedInOthers + readsWidely) / 2);
  const professionalAvg = Math.round(
    (depthOfCraft + articulationSkill + portfolioQuality + problemSolvingApproach) / 4
  );

  const getDiagnosticStatus = (): Status => {
    if (!diagnosticLevel) return "not-assessed";
    if (diagnosticLevel === "diagnostician") return "excellent";
    if (diagnosticLevel === "clarifier") return "good";
    return "needs-work";
  };

  const getDiagnosticValue = (): string => {
    if (!diagnosticLevel) return "Not assessed";
    if (diagnosticLevel === "diagnostician") return "Diagnostician ✓";
    if (diagnosticLevel === "clarifier") return "Clarifier";
    return "Order Taker";
  };

  const getHonestyStatus = (): Status => {
    if (!honestyLevel) return "not-assessed";
    if (honestyLevel === "honest") return "excellent";
    if (honestyLevel === "diplomatic") return "good";
    return "needs-work";
  };

  const getHonestyValue = (): string => {
    if (!honestyLevel) return "Not assessed";
    if (honestyLevel === "honest") return "Constructive Critique ✓";
    if (honestyLevel === "diplomatic") return "Diplomatic";
    return "Flattery";
  };

  const getResilienceStatus = (): Status => {
    if (resilienceScore === 0) return "not-assessed";
    if (resilienceScore >= 4) return "excellent";
    if (resilienceScore >= 3) return "good";
    return "needs-work";
  };

  const getMotivationStatus = (): Status => {
    if (!motivationLevel) return "not-assessed";
    if (motivationLevel === "passionate") return "excellent";
    if (motivationLevel === "practical") return "good";
    return "needs-work";
  };

  const getMotivationValue = (): string => {
    if (!motivationLevel) return "Not assessed";
    if (motivationLevel === "passionate") return "Deep Connection ✓";
    if (motivationLevel === "practical") return "Practical Reasons";
    return "Unclear";
  };

  const scores: ScoreItem[] = [
    { label: "Diagnostic Mindset", section: "B", status: getDiagnosticStatus(), value: getDiagnosticValue(), icon: Lightbulb },
    { label: "Interested in Others", section: "C", status: getScoreStatus(interestedInOthers), value: `${interestedInOthers}%`, icon: Users },
    { label: "Reads Widely", section: "D", status: getScoreStatus(readsWidely), value: `${readsWidely}%`, icon: BookOpen },
    { label: "Honest POV", section: "E", status: getHonestyStatus(), value: getHonestyValue(), icon: Shield },
    { label: "Depth of Craft", section: "F", status: getScoreStatus(depthOfCraft), value: `${depthOfCraft}%`, icon: Wrench },
    { label: "Articulation & Presentation", section: "F", status: getScoreStatus(articulationSkill), value: `${articulationSkill}%`, icon: Mic },
    { label: "Portfolio Quality", section: "F", status: getScoreStatus(portfolioQuality), value: `${portfolioQuality}%`, icon: Briefcase },
    { label: "Problem-Solving", section: "F", status: getScoreStatus(problemSolvingApproach), value: `${problemSolvingApproach}%`, icon: Puzzle },
    { label: "Depth (Non-Work)", section: "G", status: depthTopic ? getScoreStatus(depthScore) : "not-assessed", value: depthTopic ? `${depthScore}%` : "No topic", icon: Lightbulb },
    { label: "Willingness to Iterate", section: "H", status: getResilienceStatus(), value: resilienceScore === 0 ? "Not rated" : `${resilienceScore}/5 ★`, icon: Star },
    { label: "Art & Aesthetics", section: "I", status: getScoreStatus(aestheticsInterest), value: `${aestheticsInterest}%`, icon: Palette },
    { label: "Industry Motivation", section: "J", status: getMotivationStatus(), value: getMotivationValue(), icon: Heart },
  ];

  const excellentCount = scores.filter((s) => s.status === "excellent").length;
  const needsWorkCount = scores.filter((s) => s.status === "needs-work").length;
  const notAssessedCount = scores.filter((s) => s.status === "not-assessed").length;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-hire/10 rounded-lg sketch-border-light">
          <div className="text-2xl font-bold text-hire">{excellentCount}</div>
          <div className="text-xs text-muted-foreground">Excellent</div>
        </div>
        <div className="text-center p-3 bg-reject/10 rounded-lg sketch-border-light">
          <div className="text-2xl font-bold text-reject">{needsWorkCount}</div>
          <div className="text-xs text-muted-foreground">Needs Work</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg sketch-border-light">
          <div className="text-2xl font-bold text-muted-foreground">{notAssessedCount}</div>
          <div className="text-xs text-muted-foreground">Not Assessed</div>
        </div>
      </div>

      {/* T-Shape Summary */}
      <div className="p-4 bg-muted/20 rounded-lg sketch-border-light">
        <div className="flex items-center justify-between mb-3">
          <HandwrittenLabel className="text-2xl">T-Shape Profile</HandwrittenLabel>
          <span className={`text-sm font-medium ${
            depthScore >= 60 && breadthScore >= 60 ? "text-hire" 
            : depthScore >= 40 && breadthScore >= 40 ? "text-highlighter" 
            : "text-muted-foreground"
          }`}>
            {depthScore >= 60 && breadthScore >= 60 ? "Strong T" 
            : depthScore >= 40 && breadthScore >= 40 ? "Emerging" 
            : "Developing"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Depth</span>
              <span>{depthScore}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full bg-ink" initial={{ width: 0 }} animate={{ width: `${depthScore}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Breadth</span>
              <span>{breadthScore}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full bg-highlighter" initial={{ width: 0 }} animate={{ width: `${breadthScore}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Professional Deep Dive Summary */}
      <div className="p-4 bg-muted/20 rounded-lg sketch-border-light">
        <div className="flex items-center justify-between mb-3">
          <HandwrittenLabel className="text-2xl">Professional Deep Dive</HandwrittenLabel>
          <span className={`text-sm font-medium ${
            professionalAvg >= 70 ? "text-hire" : professionalAvg >= 40 ? "text-highlighter" : "text-muted-foreground"
          }`}>
            {professionalAvg}%
          </span>
        </div>
      </div>

      {/* Detailed Scores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {scores.map((score, index) => {
          const StatusIcon = getStatusIcon(score.status);
          const Icon = score.icon;
          return (
            <motion.div
              key={`${score.section}-${score.label}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor(score.status)}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium opacity-60">{score.section}.</span>
                  <span className="text-sm font-medium truncate">{score.label}</span>
                </div>
                <div className="text-xs truncate opacity-80">{score.value}</div>
              </div>
              <StatusIcon className="w-4 h-4 flex-shrink-0" />
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-2">
        <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-hire" /><span>Excellent</span></div>
        <div className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-highlighter" /><span>Good</span></div>
        <div className="flex items-center gap-1"><XCircle className="w-3 h-3 text-reject" /><span>Needs Work</span></div>
        <div className="flex items-center gap-1"><HelpCircle className="w-3 h-3 text-muted-foreground" /><span>Not Assessed</span></div>
      </div>
    </div>
  );
};

export default ScoresSummary;
