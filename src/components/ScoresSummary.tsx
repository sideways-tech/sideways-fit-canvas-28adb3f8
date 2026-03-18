import { motion } from "framer-motion";
import HandwrittenLabel from "./HandwrittenLabel";
import TShapeVisualizer from "./TShapeVisualizer";
import {
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
  Compass,
} from "lucide-react";

type DiagnosticLevel = "order-taker" | "clarifier" | "diagnostician" | "";
type HonestyLevel = "flattery" | "diplomatic" | "honest" | "";
type MotivationLevel = "unclear" | "practical" | "passionate" | "";
type SidewaysMotivationLevel = "generic" | "culture-fit" | "sideways-specific" | "";

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
  sidewaysMotivationLevel: SidewaysMotivationLevel;
  depthOfCraft: number;
  articulationSkill: number;
  portfolioQuality: number;
  problemSolvingApproach: number;
  professionalBreadth: number;
}

type Status = "excellent" | "good" | "needs-work" | "not-assessed";

interface ScoreItem {
  label: string;
  status: Status;
  displayValue: string;
  sliderValue?: number; // if present, show a progress bar
  icon: React.ElementType;
}

const getSliderLabel = (value: number): string => {
  if (value <= 20) return "Low";
  if (value <= 40) return "Fair";
  if (value <= 60) return "Good";
  if (value <= 80) return "Strong";
  return "Excellent";
};

const getScoreStatus = (score: number): Status => {
  if (score >= 70) return "excellent";
  if (score >= 40) return "good";
  return "needs-work";
};

const dotColor = (status: Status) => {
  switch (status) {
    case "excellent": return "bg-hire";
    case "good": return "bg-highlighter";
    case "needs-work": return "bg-reject";
    case "not-assessed": return "border-2 border-muted-foreground/40 bg-transparent";
  }
};

const barColor = (status: Status) => {
  switch (status) {
    case "excellent": return "bg-hire";
    case "good": return "bg-highlighter";
    case "needs-work": return "bg-reject";
    case "not-assessed": return "bg-muted";
  }
};

interface SectionGroup {
  title: string;
  items: ScoreItem[];
}

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
  sidewaysMotivationLevel,
  depthOfCraft,
  articulationSkill,
  portfolioQuality,
  problemSolvingApproach,
  professionalBreadth,
}: ScoresSummaryProps) => {

  const getDiagnosticStatus = (): Status => {
    if (!diagnosticLevel) return "not-assessed";
    if (diagnosticLevel === "diagnostician") return "excellent";
    if (diagnosticLevel === "clarifier") return "good";
    return "needs-work";
  };
  const getDiagnosticValue = (): string => {
    if (!diagnosticLevel) return "Not assessed";
    if (diagnosticLevel === "diagnostician") return "Diagnostician";
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
    if (honestyLevel === "honest") return "Constructive Critique";
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
    if (motivationLevel === "passionate") return "Deep Connection";
    if (motivationLevel === "practical") return "Practical Reasons";
    return "Unclear";
  };

  const getSidewaysMotivationStatus = (): Status => {
    if (!sidewaysMotivationLevel) return "not-assessed";
    if (sidewaysMotivationLevel === "sideways-specific") return "excellent";
    if (sidewaysMotivationLevel === "culture-fit") return "good";
    return "needs-work";
  };
  const getSidewaysMotivationValue = (): string => {
    if (!sidewaysMotivationLevel) return "Not assessed";
    if (sidewaysMotivationLevel === "sideways-specific") return "Sideways-Specific";
    if (sidewaysMotivationLevel === "culture-fit") return "Culture Fit";
    return "Generic";
  };

  const sections: SectionGroup[] = [
    {
      title: "B. Interests & Aesthetics",
      items: [
        { label: "Depth (Non-Work)", status: depthTopic ? getScoreStatus(depthScore) : "not-assessed", displayValue: depthTopic ? getSliderLabel(depthScore) : "No topic", sliderValue: depthTopic ? depthScore : undefined, icon: Lightbulb },
        { label: "Reads Widely", status: getScoreStatus(readsWidely), displayValue: getSliderLabel(readsWidely), sliderValue: readsWidely, icon: BookOpen },
        { label: "Interested in Others", status: getScoreStatus(interestedInOthers), displayValue: getSliderLabel(interestedInOthers), sliderValue: interestedInOthers, icon: Users },
        { label: "Art & Aesthetics", status: getScoreStatus(aestheticsInterest), displayValue: getSliderLabel(aestheticsInterest), sliderValue: aestheticsInterest, icon: Palette },
      ],
    },
    {
      title: "C. Experience Deep Dive",
      items: [
        { label: "Depth of Craft", status: getScoreStatus(depthOfCraft), displayValue: getSliderLabel(depthOfCraft), sliderValue: depthOfCraft, icon: Wrench },
        { label: "Professional Breadth", status: getScoreStatus(professionalBreadth), displayValue: getSliderLabel(professionalBreadth), sliderValue: professionalBreadth, icon: Compass },
        { label: "Articulation", status: getScoreStatus(articulationSkill), displayValue: getSliderLabel(articulationSkill), sliderValue: articulationSkill, icon: Mic },
        { label: "Portfolio Quality", status: getScoreStatus(portfolioQuality), displayValue: getSliderLabel(portfolioQuality), sliderValue: portfolioQuality, icon: Briefcase },
        { label: "Problem-Solving", status: getScoreStatus(problemSolvingApproach), displayValue: getSliderLabel(problemSolvingApproach), sliderValue: problemSolvingApproach, icon: Puzzle },
        { label: "Willingness to Iterate", status: getResilienceStatus(), displayValue: resilienceScore === 0 ? "Not rated" : `${resilienceScore}/5`, icon: Star },
      ],
    },
    {
      title: "D. Motivation & Honesty",
      items: [
        { label: "Industry Motivation", status: getMotivationStatus(), displayValue: getMotivationValue(), icon: Heart },
        { label: "Sideways Motivation", status: getSidewaysMotivationStatus(), displayValue: getSidewaysMotivationValue(), icon: Heart },
        { label: "Honest POV", status: getHonestyStatus(), displayValue: getHonestyValue(), icon: Shield },
      ],
    },
    {
      title: "E. Diagnostic Mindset",
      items: [
        { label: "Diagnostic Mindset", status: getDiagnosticStatus(), displayValue: getDiagnosticValue(), icon: Lightbulb },
      ],
    },
  ];

  const allItems = sections.flatMap((s) => s.items);
  const excellentCount = allItems.filter((s) => s.status === "excellent").length;
  const needsWorkCount = allItems.filter((s) => s.status === "needs-work").length;
  const notAssessedCount = allItems.filter((s) => s.status === "not-assessed").length;

  let itemIndex = 0;

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
            depthOfCraft >= 60 && professionalBreadth >= 60 ? "text-hire"
            : depthOfCraft >= 40 && professionalBreadth >= 40 ? "text-highlighter"
            : "text-muted-foreground"
          }`}>
            {depthOfCraft >= 60 && professionalBreadth >= 60 ? "Strong T"
            : depthOfCraft >= 40 && professionalBreadth >= 40 ? "Emerging"
            : "Developing"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Depth of Craft</span>
              <span>{getSliderLabel(depthOfCraft)}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full bg-ink" initial={{ width: 0 }} animate={{ width: `${depthOfCraft}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Prof. Breadth</span>
              <span>{getSliderLabel(professionalBreadth)}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full bg-highlighter" initial={{ width: 0 }} animate={{ width: `${professionalBreadth}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Scores by Section */}
      {sections.map((section) => (
        <div key={section.title} className="space-y-2">
          <HandwrittenLabel className="text-xl text-muted-foreground">{section.title}</HandwrittenLabel>
          <div className="space-y-1">
            {section.items.map((score) => {
              const Icon = score.icon;
              const idx = itemIndex++;
              return (
                <motion.div
                  key={score.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-muted/20 transition-colors"
                >
                  {/* Status dot */}
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor(score.status)}`} />

                  {/* Icon + Label */}
                  <Icon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                  <span className="text-sm flex-shrink-0">{score.label}</span>

                  {/* Progress bar or spacer */}
                  <div className="flex-1 mx-2">
                    {score.sliderValue !== undefined ? (
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${barColor(score.status)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${score.sliderValue}%` }}
                          transition={{ duration: 0.4, delay: idx * 0.03 }}
                        />
                      </div>
                    ) : (
                      <div className="h-px bg-muted/40" />
                    )}
                  </div>

                  {/* Descriptive value */}
                  <span className="text-xs text-muted-foreground flex-shrink-0 min-w-[5rem] text-right">
                    {score.displayValue}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-2">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-hire" /><span>Excellent</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-highlighter" /><span>Good</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-reject" /><span>Needs Work</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full border border-muted-foreground/40" /><span>Not Assessed</span></div>
      </div>
    </div>
  );
};

export default ScoresSummary;
