import { motion } from "framer-motion";
import HandwrittenLabel from "./HandwrittenLabel";
import TShapeVisualizer from "./TShapeVisualizer";
import {
  Lightbulb,
  Users,
  BookOpen,
  Star,
  Palette,
  Heart,
  Wrench,
  Mic,
  Briefcase,
  Compass,
} from "lucide-react";

type DiagnosticLevel = "order-taker" | "clarifier" | "diagnostician" | "";
type MotivationLevel = "unclear" | "practical" | "passionate" | "";
type SidewaysEngagement = "surface-generic" | "informed-safe" | "genuine-fan" | "opinionated-engaged" | "";

interface ScoresSummaryProps {
  diagnosticLevel: DiagnosticLevel;
  interestedInOthers: number;
  readsWidely: number;
  depthScore: number;
  depthTopic: string;
  resilienceScore: number;
  aestheticsInterest: number;
  motivationLevel: MotivationLevel;
  sidewaysMotivationLevel: SidewaysEngagement;
  depthOfCraft: number;
  articulationSkill: number;
  portfolioQuality: number;
  professionalBreadth: number;
}

type Status = "excellent" | "good" | "needs-work" | "not-assessed";

interface ScoreItem {
  label: string;
  status: Status;
  displayValue: string;
  sliderValue?: number;
  icon: React.ElementType;
}

const getSliderLabel = (value: number): string => {
  if (value === 0) return "Not set";
  if (value <= 20) return "Low";
  if (value <= 40) return "Fair";
  if (value <= 60) return "Good";
  if (value <= 80) return "Strong";
  return "Excellent";
};

const getScoreStatus = (value: number): Status => {
  if (value === 0) return "not-assessed";
  if (value >= 60) return "excellent";
  if (value >= 40) return "good";
  return "needs-work";
};

interface SectionGroup {
  title: string;
  items: ScoreItem[];
}

const statusColors: Record<Status, string> = {
  excellent: "bg-hire/20 text-hire border-hire/30",
  good: "bg-highlighter/20 text-foreground border-highlighter/30",
  "needs-work": "bg-reject/20 text-reject border-reject/30",
  "not-assessed": "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<Status, string> = {
  excellent: "Strong",
  good: "OK",
  "needs-work": "Weak",
  "not-assessed": "—",
};

const ScoresSummary = ({
  diagnosticLevel,
  interestedInOthers,
  readsWidely,
  depthScore,
  depthTopic,
  resilienceScore,
  aestheticsInterest,
  motivationLevel,
  sidewaysMotivationLevel,
  depthOfCraft,
  articulationSkill,
  portfolioQuality,
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

  const getSidewaysEngagementStatus = (): Status => {
    if (!sidewaysMotivationLevel) return "not-assessed";
    if (sidewaysMotivationLevel === "genuine-fan" || sidewaysMotivationLevel === "opinionated-engaged") return "excellent";
    if (sidewaysMotivationLevel === "informed-safe") return "good";
    return "needs-work";
  };
  const getSidewaysEngagementValue = (): string => {
    if (!sidewaysMotivationLevel) return "Not assessed";
    if (sidewaysMotivationLevel === "opinionated-engaged") return "Opinionated & Engaged";
    if (sidewaysMotivationLevel === "genuine-fan") return "Genuine Admiration";
    if (sidewaysMotivationLevel === "informed-safe") return "Informed but Safe";
    return "Surface-Level";
  };

  const sections: SectionGroup[] = [
    {
      title: "B. Interests & Aesthetics",
      items: [
        { label: "Depth (Non-Work)", status: depthTopic ? getScoreStatus(depthScore) : "not-assessed", displayValue: depthTopic ? getSliderLabel(depthScore) : "No topic", sliderValue: depthTopic ? depthScore : undefined, icon: Lightbulb },
        { label: "Reads Widely", status: getScoreStatus(readsWidely), displayValue: getSliderLabel(readsWidely), sliderValue: readsWidely, icon: BookOpen },
        { label: "Interested in Others", status: getScoreStatus(interestedInOthers), displayValue: getSliderLabel(interestedInOthers), sliderValue: interestedInOthers, icon: Users },
        { label: "Art, Aesthetics & Design", status: getScoreStatus(aestheticsInterest), displayValue: getSliderLabel(aestheticsInterest), sliderValue: aestheticsInterest, icon: Palette },
      ],
    },
    {
      title: "C. Experience Deep Dive",
      items: [
        { label: "Depth of Craft", status: getScoreStatus(depthOfCraft), displayValue: getSliderLabel(depthOfCraft), sliderValue: depthOfCraft, icon: Wrench },
        { label: "Professional Breadth", status: getScoreStatus(professionalBreadth), displayValue: getSliderLabel(professionalBreadth), sliderValue: professionalBreadth, icon: Compass },
        { label: "Articulation", status: getScoreStatus(articulationSkill), displayValue: getSliderLabel(articulationSkill), sliderValue: articulationSkill, icon: Mic },
        { label: "Portfolio Quality", status: getScoreStatus(portfolioQuality), displayValue: getSliderLabel(portfolioQuality), sliderValue: portfolioQuality, icon: Briefcase },
        { label: "Willingness to Iterate", status: getResilienceStatus(), displayValue: resilienceScore === 0 ? "Not rated" : `${resilienceScore}/5`, icon: Star },
      ],
    },
    {
      title: "D. Motivation & Alignment",
      items: [
        { label: "Industry Motivation", status: getMotivationStatus(), displayValue: getMotivationValue(), icon: Heart },
        { label: "Sideways Engagement", status: getSidewaysEngagementStatus(), displayValue: getSidewaysEngagementValue(), icon: Heart },
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

  return (
    <div className="space-y-6">
      {/* T-Shape Visual */}
      <TShapeVisualizer depthScore={depthOfCraft} breadthScore={professionalBreadth} />

      {/* Section Groups */}
      {sections.map((section) => (
        <div key={section.title} className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {section.title}
          </h4>
          <div className="space-y-1.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-2.5 rounded-lg sketch-border-light bg-background"
                >
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm flex-1">{item.label}</span>
                  {item.sliderValue !== undefined && (
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          item.status === "excellent"
                            ? "bg-hire"
                            : item.status === "good"
                            ? "bg-highlighter"
                            : "bg-reject"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.sliderValue}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[item.status]}`}
                  >
                    {item.displayValue}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Quick Stats */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <div className="text-center">
          <span className="text-2xl font-bold text-hire">{excellentCount}</span>
          <p className="text-xs text-muted-foreground">Strong</p>
        </div>
        <div className="text-center">
          <span className="text-2xl font-bold text-reject">{needsWorkCount}</span>
          <p className="text-xs text-muted-foreground">Weak</p>
        </div>
      </div>
    </div>
  );
};

export default ScoresSummary;
