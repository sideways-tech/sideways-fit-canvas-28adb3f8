import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import HandwrittenLabel from "./HandwrittenLabel";
import SketchCard from "./SketchCard";
import BackgroundSection from "./BackgroundSection";
import DiagnosticSection from "./DiagnosticSection";
import TShapeVisualizer from "./TShapeVisualizer";
import ReadingBreadthSection from "./ReadingBreadthSection";
import HonestyMeter from "./HonestyMeter";
import ResilienceRating from "./ResilienceRating";
import AestheticsSection from "./AestheticsSection";
import IndustryMotivationSection from "./IndustryMotivationSection";
import ScoresSummary from "./ScoresSummary";
import VerdictFooter from "./VerdictFooter";
import sidewaysLogo from "@/assets/sideways-logo.png";

type DiagnosticLevel = "order-taker" | "clarifier" | "diagnostician";
type HonestyLevel = "flattery" | "diplomatic" | "honest";
type MotivationLevel = "unclear" | "practical" | "passionate";
type Archetype = "vendor" | "birbal" | "work-in-progress";

interface FormState {
  candidateName: string;
  candidateRole: string;
  department: string;
  hiringLevel: string;
  // A. Background
  backgroundNotes: string;
  // B. Diagnostic
  diagnosticLevel: DiagnosticLevel | "";
  // C. Interested in Others
  interestedInOthers: number;
  // D. Honest POV
  honestyLevel: HonestyLevel | "";
  // E. Reads Widely
  readsWidely: number;
  recentReadExample: string;
  // F. Depth
  depthTopic: string;
  depthScore: number;
  // G. Willingness to Iterate
  resilienceScore: number;
  // H. Art/Aesthetics
  aestheticsInterest: number;
  aestheticsProcessNote: string;
  // I. Industry Motivation
  motivationLevel: MotivationLevel | "";
  motivationReason: string;
}

const calculateArchetype = (state: FormState): Archetype => {
  const {
    diagnosticLevel,
    interestedInOthers,
    honestyLevel,
    readsWidely,
    depthScore,
    resilienceScore,
    aestheticsInterest,
    motivationLevel,
  } = state;

  const breadthScore = Math.round((interestedInOthers + readsWidely) / 2);

  // Vendor: Low diagnostic OR flattery OR unclear motivation
  if (
    diagnosticLevel === "order-taker" ||
    honestyLevel === "flattery" ||
    motivationLevel === "unclear"
  ) {
    return "vendor";
  }

  // Birbal: High across all key dimensions
  if (
    diagnosticLevel === "diagnostician" &&
    depthScore >= 60 &&
    breadthScore >= 60 &&
    honestyLevel === "honest" &&
    resilienceScore >= 4 &&
    aestheticsInterest >= 50 &&
    motivationLevel === "passionate"
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
    department: "",
    hiringLevel: "",
    backgroundNotes: "",
    diagnosticLevel: "",
    interestedInOthers: 30,
    honestyLevel: "",
    readsWidely: 30,
    recentReadExample: "",
    depthTopic: "",
    depthScore: 30,
    resilienceScore: 0,
    aestheticsInterest: 30,
    aestheticsProcessNote: "",
    motivationLevel: "",
    motivationReason: "",
  });

  const archetype = useMemo(() => calculateArchetype(formState), [formState]);
  const breadthScore = Math.round((formState.interestedInOthers + formState.readsWidely) / 2);

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
          <img
            src={sidewaysLogo}
            alt="Sideways"
            className="h-20 sm:h-24 mx-auto"
          />
          <p className="text-sm text-muted-foreground max-w-md mx-auto italic">
            "We like problems that don't come with a drop-down menu."
          </p>
          <div className="pt-4">
            <h1 className="text-2xl font-semibold">Culture & Talent Assessment</h1>
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
              <Label htmlFor="candidate-role">Role hiring for</Label>
              <Input
                id="candidate-role"
                placeholder="Position applying for..."
                value={formState.candidateRole}
                onChange={(e) => updateField("candidateRole", e.target.value)}
                className="sketch-border-light bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={formState.department} onValueChange={(value) => updateField("department", value)}>
                <SelectTrigger className="sketch-border-light bg-background">
                  <SelectValue placeholder="Select department..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strategy">Strategy</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="copy">Copy</SelectItem>
                  <SelectItem value="tech-ux">Tech / UX</SelectItem>
                  <SelectItem value="product-design">Product Design</SelectItem>
                  <SelectItem value="servicing">Servicing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hiring Level</Label>
              <Select value={formState.hiringLevel} onValueChange={(value) => updateField("hiringLevel", value)}>
                <SelectTrigger className="sketch-border-light bg-background">
                  <SelectValue placeholder="Select level..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L1">L1</SelectItem>
                  <SelectItem value="L2">L2</SelectItem>
                  <SelectItem value="L3">L3</SelectItem>
                  <SelectItem value="L4">L4</SelectItem>
                  <SelectItem value="L5">L5</SelectItem>
                  <SelectItem value="L6">L6</SelectItem>
                  <SelectItem value="L7">L7</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SketchCard>

        {/* Section A: Background */}
        <SketchCard className="mb-8" delay={0.15}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">
                A. Candidate Background
              </HandwrittenLabel>
              <p className="text-sm text-muted-foreground">
                Understanding who they are beyond the résumé
              </p>
            </div>
            <BackgroundSection
              grewUp={formState.bgGrewUp}
              education={formState.bgEducation}
              family={formState.bgFamily}
              currentCity={formState.bgCurrentCity}
              weekendActivities={formState.bgWeekendActivities}
              onGrewUpChange={(value) => updateField("bgGrewUp", value)}
              onEducationChange={(value) => updateField("bgEducation", value)}
              onFamilyChange={(value) => updateField("bgFamily", value)}
              onCurrentCityChange={(value) => updateField("bgCurrentCity", value)}
              onWeekendActivitiesChange={(value) => updateField("bgWeekendActivities", value)}
            />
          </div>
        </SketchCard>

        {/* Section B: Diagnostic / Clarifying Questions */}
        <SketchCard className="mb-8" delay={0.2}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">
                B. Ask Questions (Clarifying Enough?)
              </HandwrittenLabel>
              <p className="text-sm text-muted-foreground">
                Did they ask 'Why' before 'How'? Doctor vs Waiter mindset.
              </p>
            </div>
            <DiagnosticSection
              value={formState.diagnosticLevel}
              onChange={(value) => updateField("diagnosticLevel", value)}
            />
          </div>
        </SketchCard>

        {/* Section C & E: Plugged Into Society */}
        <SketchCard className="mb-8" delay={0.25}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">
                C & E. Plugged Into Society
              </HandwrittenLabel>
              <p className="text-sm text-muted-foreground">
                Not living in a bubble — interested in others & reads widely
              </p>
            </div>
            <ReadingBreadthSection
              interestedInOthers={formState.interestedInOthers}
              readsWidely={formState.readsWidely}
              recentReadExample={formState.recentReadExample}
              onInterestedInOthersChange={(value) => updateField("interestedInOthers", value)}
              onReadsWidelyChange={(value) => updateField("readsWidely", value)}
              onRecentReadExampleChange={(value) => updateField("recentReadExample", value)}
            />
          </div>
        </SketchCard>

        {/* Section F: T-Shape Depth */}
        <SketchCard className="mb-8" delay={0.3}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">
                F. Depth in One Non-Work Topic
              </HandwrittenLabel>
              <p className="text-sm text-muted-foreground">
                The vertical bar of the T — obsessive depth in something outside work
              </p>
            </div>
            <TShapeVisualizer
              depthTopic={formState.depthTopic}
              depthScore={formState.depthScore}
              breadthScore={breadthScore}
              onDepthTopicChange={(value) => updateField("depthTopic", value)}
              onDepthScoreChange={(value) => updateField("depthScore", value)}
              onBreadthScoreChange={() => {}}
            />
          </div>
        </SketchCard>

        {/* Section D: Honesty */}
        <SketchCard className="mb-8" delay={0.35}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">
                D. Honest POV on Our Work
              </HandwrittenLabel>
              <p className="text-sm text-muted-foreground">
                Has a clear, honest point of view — not just flattery
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Their take on Sideways work
              </Label>
              <HonestyMeter
                value={formState.honestyLevel}
                onChange={(value) => updateField("honestyLevel", value)}
              />
            </div>
          </div>
        </SketchCard>

        {/* Section G: Willingness to Iterate */}
        <SketchCard className="mb-8" delay={0.4}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">
                G. Willingness to Iterate
              </HandwrittenLabel>
              <p className="text-sm text-muted-foreground">
                Can they kill their darlings? Work in the Circus?
              </p>
            </div>
            <ResilienceRating
              value={formState.resilienceScore}
              onChange={(value) => updateField("resilienceScore", value)}
            />
          </div>
        </SketchCard>

        {/* Section H: Art & Aesthetics */}
        <SketchCard className="mb-8" delay={0.45}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">
                H. Interest in Art & Aesthetics
              </HandwrittenLabel>
              <p className="text-sm text-muted-foreground">
                Process of creation — do they care about how things are made?
              </p>
            </div>
            <AestheticsSection
              interest={formState.aestheticsInterest}
              processNote={formState.aestheticsProcessNote}
              onInterestChange={(value) => updateField("aestheticsInterest", value)}
              onProcessNoteChange={(value) => updateField("aestheticsProcessNote", value)}
            />
          </div>
        </SketchCard>

        {/* Section I: Industry Motivation */}
        <SketchCard className="mb-8" delay={0.5}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">
                I. Clear Reason for This Industry
              </HandwrittenLabel>
              <p className="text-sm text-muted-foreground">
                Why creative problem-solving? What's their story?
              </p>
            </div>
            <IndustryMotivationSection
              level={formState.motivationLevel}
              reason={formState.motivationReason}
              onLevelChange={(value) => updateField("motivationLevel", value)}
              onReasonChange={(value) => updateField("motivationReason", value)}
            />
          </div>
        </SketchCard>

        {/* Scores Summary */}
        <SketchCard className="mb-8" delay={0.55}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">
                Assessment Summary
              </HandwrittenLabel>
              <p className="text-sm text-muted-foreground">
                All scores at a glance
              </p>
            </div>
            <ScoresSummary
              diagnosticLevel={formState.diagnosticLevel}
              interestedInOthers={formState.interestedInOthers}
              readsWidely={formState.readsWidely}
              depthScore={formState.depthScore}
              depthTopic={formState.depthTopic}
              honestyLevel={formState.honestyLevel}
              resilienceScore={formState.resilienceScore}
              aestheticsInterest={formState.aestheticsInterest}
              motivationLevel={formState.motivationLevel}
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
                Based on the T-shaped culture fit criteria
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
          <img
            src={sidewaysLogo}
            alt="Sideways"
            className="h-8 mx-auto mb-2 opacity-50"
          />
          <p>Creative Problem Solving Outfit</p>
        </motion.footer>
      </div>
    </div>
  );
};

export default SidewaysInterviewCanvas;
