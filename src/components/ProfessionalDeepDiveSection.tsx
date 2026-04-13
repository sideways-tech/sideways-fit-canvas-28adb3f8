import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import HandwrittenLabel from "./HandwrittenLabel";
import HintTextarea from "./HintTextarea";
import { Wrench, Mic, Briefcase, Compass } from "lucide-react";
import { getDisciplineConfig } from "@/lib/disciplineConfig";

interface ProfessionalDeepDiveSectionProps {
  depthOfCraft: number;
  articulationSkill: number;
  portfolioQuality: number;
  professionalBreadth: number;
  professionalDiveNotes: string;
  department?: string;
  onDepthOfCraftChange: (value: number) => void;
  onArticulationSkillChange: (value: number) => void;
  onPortfolioQualityChange: (value: number) => void;
  onProfessionalBreadthChange: (value: number) => void;
  onNotesChange: (value: string) => void;
}

const sliders = [
  {
    key: "articulationSkill" as const,
    label: "Articulation & Presentation",
    description: "Can they walk through their work with clarity, narrative, and presence?",
    icon: Mic,
    low: "Struggles to explain",
    high: "Compelling storyteller",
  },
  {
    key: "portfolioQuality" as const,
    label: "Portfolio Quality",
    description: "Quality of the work they chose to show — slides, demos, case studies",
    icon: Briefcase,
    low: "Underwhelming",
    high: "Outstanding work",
  },
  {
    key: "depthOfCraft" as const,
    label: "Depth of Craft",
    description: "How deep is their mastery in their core domain?",
    icon: Wrench,
    low: "Surface-level",
    high: "Deep expertise",
  },
  {
    key: "professionalBreadth" as const,
    label: "Breadth of Professional Interests",
    descriptionKey: "professionalBreadth" as const,
    icon: Compass,
    low: "Stays in their lane",
    high: "Cross-disciplinary curiosity",
  },
];

const ProfessionalDeepDiveSection = ({
  depthOfCraft,
  articulationSkill,
  portfolioQuality,
  professionalBreadth,
  professionalDiveNotes,
  department,
  onDepthOfCraftChange,
  onArticulationSkillChange,
  onPortfolioQualityChange,
  onProfessionalBreadthChange,
  onNotesChange,
}: ProfessionalDeepDiveSectionProps) => {
  const config = getDisciplineConfig(department);
  const values: Record<string, number> = {
    depthOfCraft,
    articulationSkill,
    portfolioQuality,
    professionalBreadth,
  };

  const handlers: Record<string, (v: number) => void> = {
    depthOfCraft: onDepthOfCraftChange,
    articulationSkill: onArticulationSkillChange,
    portfolioQuality: onPortfolioQualityChange,
    professionalBreadth: onProfessionalBreadthChange,
  };

  const avgScore = Math.round(
    (depthOfCraft + articulationSkill + portfolioQuality + professionalBreadth) / 4
  );

  return (
    <div className="space-y-6">
      {sliders.map((slider) => {
        const Icon = slider.icon;
        const val = values[slider.key];
        return (
          <div key={slider.key} className="space-y-3 p-4 bg-muted/20 rounded-lg sketch-border-light">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-highlighter" />
              <Label className="text-sm font-medium">{slider.label}</Label>
            </div>
            <p className="text-xs text-muted-foreground">{'descriptionKey' in slider ? config.professionalBreadth.description : slider.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <HandwrittenLabel className="text-xl text-muted-foreground">
                  {slider.label}
                </HandwrittenLabel>
                <span className="text-sm font-medium tabular-nums">{val}%</span>
              </div>
              <Slider
                value={[val]}
                onValueChange={([v]) => handlers[slider.key](v)}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{slider.low}</span>
                <span>{slider.high}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Interviewer notes on this section including demo / portfolio</Label>
        <HintTextarea
          hint="Key observations, standout moments, red flags from their portfolio walkthrough"
          placeholder="Key observations, standout moments, red flags..."
          value={professionalDiveNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="sketch-border-light bg-background text-sm min-h-[100px]"
        />
      </div>

      {/* Average Score */}
      <div className="flex items-center justify-between p-3 bg-highlighter/10 rounded-lg sketch-border-light">
        <span className="text-sm font-medium">Experience Deep Dive Score</span>
        <HandwrittenLabel
          className={`text-3xl ${
            avgScore >= 70 ? "text-hire" : avgScore >= 40 ? "text-highlighter" : "text-muted-foreground"
          }`}
        >
          {avgScore}%
        </HandwrittenLabel>
      </div>
    </div>
  );
};

export default ProfessionalDeepDiveSection;
