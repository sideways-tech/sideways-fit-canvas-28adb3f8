import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import HandwrittenLabel from "./HandwrittenLabel";
import SketchCard from "./SketchCard";
import DiagnosticSection from "./DiagnosticSection";
import TShapeVisualizer from "./TShapeVisualizer";
import HonestyMeter from "./HonestyMeter";
import ResilienceRating from "./ResilienceRating";
import VerdictFooter from "./VerdictFooter";

type DiagnosticLevel = "order-taker" | "clarifier" | "diagnostician";
type HonestyLevel = "flattery" | "diplomatic" | "honest";
type Archetype = "vendor" | "birbal" | "work-in-progress";

interface FormState {
  candidateName: string;
  candidateRole: string;
  diagnosticLevel: DiagnosticLevel | "";
  depthTopic: string;
  depthScore: number;
  breadthScore: number;
  honestyLevel: HonestyLevel | "";
  resilienceScore: number;
}

const calculateArchetype = (state: FormState): Archetype => {
  const { diagnosticLevel, depthScore, breadthScore, honestyLevel, resilienceScore } = state;

  // Vendor: Low diagnostic OR flattery
  if (diagnosticLevel === "order-taker" || honestyLevel === "flattery") {
    return "vendor";
  }

  // Birbal: High diagnostic AND high depth AND high breadth AND honest
  if (
    diagnosticLevel === "diagnostician" &&
    depthScore >= 60 &&
    breadthScore >= 60 &&
    honestyLevel === "honest" &&
    resilienceScore >= 4
  ) {
    return "birbal";
  }

  // Work in Progress: Everything else
  return "work-in-progress";
};

const SidewaysInterviewCanvas = () => {
  const [formState, setFormState] = useState<FormState>({
    candidateName: "",
    candidateRole: "",
    diagnosticLevel: "",
    depthTopic: "",
    depthScore: 30,
    breadthScore: 30,
    honestyLevel: "",
    resilienceScore: 0,
  });

  const archetype = useMemo(() => calculateArchetype(formState), [formState]);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleArchive = () => {
    toast({
      title: "Assessment Archived",
      description: `${formState.candidateName || "Candidate"}'s assessment has been saved to archives.`,
    });
  };

  const handleInvite = () => {
    if (archetype === "vendor") return;
    toast({
      title: "🎪 Invitation Sent!",
      description: `${formState.candidateName || "Candidate"} has been invited to join the Circus!`,
    });
  };

  return (
    <div className="min-h-screen bg-background paper-texture">
      <div className="container max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 space-y-4"
        >
          <HandwrittenLabel as="h1" className="text-7xl sm:text-8xl">
            Sideways
          </HandwrittenLabel>
          <p className="text-sm text-muted-foreground max-w-md mx-auto italic">
            "We like problems that don't come with a drop-down menu."
          </p>
          <div className="pt-4">
            <h2 className="text-2xl font-semibold">Culture & Talent Assessment</h2>
            <p className="text-muted-foreground">The "No Drop-Down Menu" Fit Test</p>
          </div>
        </motion.header>

        {/* Candidate Info */}
        <SketchCard className="mb-8" delay={0.1}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="candidate-name">Candidate Name</Label>
              <Input
                id="candidate-name"
                placeholder="Enter name..."
                value={formState.candidateName}
                onChange={(e) => updateField("candidateName", e.target.value)}
                className="sketch-border-light bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidate-role">Role</Label>
              <Input
                id="candidate-role"
                placeholder="Position applying for..."
                value={formState.candidateRole}
                onChange={(e) => updateField("candidateRole", e.target.value)}
                className="sketch-border-light bg-background"
              />
            </div>
          </div>
        </SketchCard>

        {/* Section A: Diagnostic */}
        <SketchCard className="mb-8" delay={0.2}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">
                A. The Diagnostic Mindset
              </HandwrittenLabel>
              <p className="text-sm text-muted-foreground">
                Did they ask 'Why' before 'How'?
              </p>
            </div>
            <DiagnosticSection
              value={formState.diagnosticLevel}
              onChange={(value) => updateField("diagnosticLevel", value)}
            />
          </div>
        </SketchCard>

        {/* Section B/D/E: T-Shape */}
        <SketchCard className="mb-8" delay={0.3}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">
                B/D/E. The T-Shaped Profile
              </HandwrittenLabel>
              <p className="text-sm text-muted-foreground">
                Vertical = Obsession / Horizontal = Empathy
              </p>
            </div>
            <TShapeVisualizer
              depthTopic={formState.depthTopic}
              depthScore={formState.depthScore}
              breadthScore={formState.breadthScore}
              onDepthTopicChange={(value) => updateField("depthTopic", value)}
              onDepthScoreChange={(value) => updateField("depthScore", value)}
              onBreadthScoreChange={(value) => updateField("breadthScore", value)}
            />
          </div>
        </SketchCard>

        {/* Section C: Honesty */}
        <SketchCard className="mb-8" delay={0.4}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">
                C. The Birbal Quotient
              </HandwrittenLabel>
              <p className="text-sm text-muted-foreground">
                We need trusted advisors, not yes-men.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                POV on Sideways Work
              </Label>
              <HonestyMeter
                value={formState.honestyLevel}
                onChange={(value) => updateField("honestyLevel", value)}
              />
            </div>
          </div>
        </SketchCard>

        {/* Section F/I: Resilience */}
        <SketchCard className="mb-8" delay={0.5}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">
                F/I. Resilience & Iteration
              </HandwrittenLabel>
              <p className="text-sm text-muted-foreground">
                Can they work in the Circus?
              </p>
            </div>
            <ResilienceRating
              value={formState.resilienceScore}
              onChange={(value) => updateField("resilienceScore", value)}
            />
          </div>
        </SketchCard>

        {/* Footer: Verdict */}
        <SketchCard delay={0.6}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">
                The Verdict
              </HandwrittenLabel>
              <p className="text-sm text-muted-foreground">
                Based on the assessment criteria
              </p>
            </div>
            <VerdictFooter
              archetype={archetype}
              onArchive={handleArchive}
              onInvite={handleInvite}
            />
          </div>
        </SketchCard>

        {/* Footer Branding */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center text-sm text-muted-foreground"
        >
          <p>
            <HandwrittenLabel className="text-2xl">Sideways</HandwrittenLabel>
            {" "} · Creative Problem Solving Outfit
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

export default SidewaysInterviewCanvas;
