import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import HandwrittenLabel from "./HandwrittenLabel";
import SketchCard from "./SketchCard";
import BackgroundSection from "./BackgroundSection";
import DiagnosticSection from "./DiagnosticSection";
import InterestedInOthersSection from "./InterestedInOthersSection";
import ReadingBreadthSection from "./ReadingBreadthSection";
import SidewaysWorkSection from "./SidewaysWorkSection";
import ProfessionalDeepDiveSection from "./ProfessionalDeepDiveSection";
import TShapeVisualizer from "./TShapeVisualizer";
import TShapeDepthSection from "./TShapeDepthSection";
import ResilienceRating from "./ResilienceRating";
import AestheticsSection from "./AestheticsSection";
import IndustryMotivationSection from "./IndustryMotivationSection";
import ScoresSummary from "./ScoresSummary";
import VerdictFooter from "./VerdictFooter";
import sidewaysLogo from "@/assets/sideways-logo.png";

type DiagnosticLevel = "order-taker" | "clarifier" | "diagnostician";
type HonestyLevel = "flattery" | "diplomatic" | "honest";
type MotivationLevel = "unclear" | "practical" | "passionate";
type SidewaysMotivationLevel = "generic" | "culture-fit" | "sideways-specific";
type Archetype = "vendor" | "birbal" | "work-in-progress";

interface FormState {
  candidateName: string;
  candidateRole: string;
  interviewerName: string;
  department: string;
  hiringLevel: string;
  // A. Background
  backgroundNotes: string;
  // B. Diagnostic
  diagnosticLevel: DiagnosticLevel | "";
  // C. Interested in Others
  interestedInOthers: number;
  // D. Interests & Passions
  readsWidely: number;
  recentReadExample: string;
  interestsPassionsNotes: string;
  // E. Sideways & Our Work
  sidewaysWebsiteFeedback: string;
  honestyLevel: HonestyLevel | "";
  // F. Professional Deep Dive
  depthOfCraft: number;
  articulationSkill: number;
  portfolioQuality: number;
  problemSolvingApproach: number;
  professionalBreadth: number;
  professionalDiveNotes: string;
  // G. Depth in Non-Work Topic
  depthTopic: string;
  depthScore: number;
  // H. Willingness to Iterate
  resilienceScore: number;
  // I. Art & Aesthetics
  aestheticsInterest: number;
  aestheticsProcessNote: string;
  // J. Industry Motivation
  motivationLevel: MotivationLevel | "";
  motivationReason: string;
  sidewaysMotivationLevel: SidewaysMotivationLevel | "";
  sidewaysMotivationReason: string;
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
    depthOfCraft,
    articulationSkill,
    portfolioQuality,
    problemSolvingApproach,
  } = state;

  const breadthScore = state.professionalBreadth;
  const professionalAvg = Math.round(
    (depthOfCraft + articulationSkill + portfolioQuality + problemSolvingApproach) / 4
  );

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
    depthOfCraft >= 60 &&
    state.professionalBreadth >= 60 &&
    honestyLevel === "honest" &&
    resilienceScore >= 4 &&
    aestheticsInterest >= 50 &&
    motivationLevel === "passionate" &&
    professionalAvg >= 60
  ) {
    return "birbal";
  }

  return "work-in-progress";
};

const SidewaysInterviewCanvas = () => {
  const [formState, setFormState] = useState<FormState>({
    candidateName: "",
    candidateRole: "",
    interviewerName: "",
    department: "",
    hiringLevel: "",
    backgroundNotes: "",
    diagnosticLevel: "",
    interestedInOthers: 30,
    readsWidely: 30,
    recentReadExample: "",
    interestsPassionsNotes: "",
    sidewaysWebsiteFeedback: "",
    honestyLevel: "",
    depthOfCraft: 30,
    articulationSkill: 30,
    portfolioQuality: 30,
    problemSolvingApproach: 30,
    professionalBreadth: 30,
    professionalDiveNotes: "",
    depthTopic: "",
    depthScore: 30,
    resilienceScore: 0,
    aestheticsInterest: 30,
    aestheticsProcessNote: "",
    motivationLevel: "",
    motivationReason: "",
    sidewaysMotivationLevel: "",
    sidewaysMotivationReason: "",
  });

  const archetype = useMemo(() => calculateArchetype(formState), [formState]);
  const breadthScore = formState.professionalBreadth;

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
          <img src={sidewaysLogo} alt="Sideways" className="h-20 sm:h-24 mx-auto" />
          <p className="text-sm text-muted-foreground max-w-md mx-auto italic">
            "We like people who can't be summed up in a résumé bullet."
          </p>
          <div className="pt-4">
            <h1 className="text-2xl font-semibold">Culture & Talent Assessment</h1>
            <p className="text-muted-foreground">The "Can't Be Templated" Fit Test</p>
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
            <div className="space-y-2">
              <Label htmlFor="interviewer-name">Interviewer Name</Label>
              <Input
                id="interviewer-name"
                placeholder="Who is conducting this interview..."
                value={formState.interviewerName}
                onChange={(e) => updateField("interviewerName", e.target.value)}
                className="sketch-border-light bg-background"
              />
            </div>
          </div>
        </SketchCard>

        {/* A. Background */}
        <SketchCard className="mb-8" delay={0.15}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">A. Candidate's Background</HandwrittenLabel>
              <p className="text-sm text-muted-foreground">Understanding who they are beyond the résumé</p>
            </div>
            <BackgroundSection
              backgroundNotes={formState.backgroundNotes}
              onBackgroundNotesChange={(value) => updateField("backgroundNotes", value)}
            />
          </div>
        </SketchCard>

        {/* ACT 1: THE PERSON */}

        {/* B. Interests, Passions & Aesthetics — merge C + H */}
        <SketchCard className="mb-8" delay={0.2}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">B. Interests, Passions & Aesthetics</HandwrittenLabel>
              <p className="text-sm text-muted-foreground">Give them the floor for ~5 minutes. What do they geek out about outside of work? Hobbies, side projects, obsessions, rabbit holes — anything that reveals how they think and what they care about when no one's asking.</p>
            </div>
            <TShapeDepthSection
              depthTopic={formState.depthTopic}
              depthScore={formState.depthScore}
              onDepthTopicChange={(value) => updateField("depthTopic", value)}
              onDepthScoreChange={(value) => updateField("depthScore", value)}
            />
            <ReadingBreadthSection
              readsWidely={formState.readsWidely}
              recentReadExample={formState.recentReadExample}
              onReadsWidelyChange={(value) => updateField("readsWidely", value)}
              onRecentReadExampleChange={(value) => updateField("recentReadExample", value)}
            />
            <InterestedInOthersSection
              value={formState.interestedInOthers}
              onChange={(value) => updateField("interestedInOthers", value)}
            />
            <AestheticsSection
              interest={formState.aestheticsInterest}
              processNote={formState.aestheticsProcessNote}
              onInterestChange={(value) => updateField("aestheticsInterest", value)}
              onProcessNoteChange={(value) => updateField("aestheticsProcessNote", value)}
            />
          </div>
        </SketchCard>

        {/* ACT 2: THE PROFESSIONAL */}

        {/* C. Experience Deep Dive + Resilience */}
        <SketchCard className="mb-8" delay={0.3}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">C. Experience Deep Dive</HandwrittenLabel>
              <p className="text-sm text-muted-foreground">Ask them to walk you through their best professional work. This is where they present — portfolio pieces, case studies, demos, or slides. Let them lead. Watch for how they frame problems, explain decisions, and own outcomes.</p>
            </div>
            <ProfessionalDeepDiveSection
              depthOfCraft={formState.depthOfCraft}
              articulationSkill={formState.articulationSkill}
              portfolioQuality={formState.portfolioQuality}
              problemSolvingApproach={formState.problemSolvingApproach}
              professionalBreadth={formState.professionalBreadth}
              professionalDiveNotes={formState.professionalDiveNotes}
              onDepthOfCraftChange={(value) => updateField("depthOfCraft", value)}
              onArticulationSkillChange={(value) => updateField("articulationSkill", value)}
              onPortfolioQualityChange={(value) => updateField("portfolioQuality", value)}
              onProblemSolvingApproachChange={(value) => updateField("problemSolvingApproach", value)}
              onProfessionalBreadthChange={(value) => updateField("professionalBreadth", value)}
              onNotesChange={(value) => updateField("professionalDiveNotes", value)}
            />
            <TShapeVisualizer
              depthScore={formState.depthOfCraft}
              breadthScore={formState.professionalBreadth}
            />
            <ResilienceRating
              value={formState.resilienceScore}
              onChange={(value) => updateField("resilienceScore", value)}
            />
          </div>
        </SketchCard>

        {/* ACT 3: THE FIT */}

        {/* D. Why This Industry & Why Sideways */}
        <SketchCard className="mb-8" delay={0.4}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">D. Why This Industry & Why Sideways</HandwrittenLabel>
              <p className="text-sm text-muted-foreground">Why this industry, why Sideways — and can they be honest about it?</p>
            </div>
            <IndustryMotivationSection
              level={formState.motivationLevel}
              reason={formState.motivationReason}
              onLevelChange={(value) => updateField("motivationLevel", value)}
              onReasonChange={(value) => updateField("motivationReason", value)}
              sidewaysLevel={formState.sidewaysMotivationLevel}
              sidewaysReason={formState.sidewaysMotivationReason}
              onSidewaysLevelChange={(value) => updateField("sidewaysMotivationLevel", value)}
              onSidewaysReasonChange={(value) => updateField("sidewaysMotivationReason", value)}
            />
            <SidewaysWorkSection
              sidewaysWebsiteFeedback={formState.sidewaysWebsiteFeedback}
              honestyLevel={formState.honestyLevel}
              onFeedbackChange={(value) => updateField("sidewaysWebsiteFeedback", value)}
              onHonestyChange={(value) => updateField("honestyLevel", value)}
            />
          </div>
        </SketchCard>

        {/* E. Diagnostic Mindset — Post-interview grading */}
        <SketchCard className="mb-8" delay={0.5}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">E. Diagnostic Mindset</HandwrittenLabel>
              <p className="text-sm text-muted-foreground">Looking back at the full conversation — did they ask 'Why' before 'How'?</p>
            </div>
            <DiagnosticSection
              value={formState.diagnosticLevel}
              onChange={(value) => updateField("diagnosticLevel", value)}
            />
          </div>
        </SketchCard>

        {/* Scores Summary */}
        <SketchCard className="mb-8" delay={0.65}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">Assessment Summary</HandwrittenLabel>
              <p className="text-sm text-muted-foreground">All scores at a glance</p>
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
              sidewaysMotivationLevel={formState.sidewaysMotivationLevel}
              depthOfCraft={formState.depthOfCraft}
              articulationSkill={formState.articulationSkill}
              portfolioQuality={formState.portfolioQuality}
              problemSolvingApproach={formState.problemSolvingApproach}
              professionalBreadth={formState.professionalBreadth}
            />
          </div>
        </SketchCard>

        {/* Footer: Verdict */}
        <SketchCard delay={0.7}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">The Verdict</HandwrittenLabel>
              <p className="text-sm text-muted-foreground">Based on the T-shaped culture fit criteria</p>
            </div>
            <VerdictFooter archetype={archetype} onArchive={handleArchive} onInvite={handleInvite} />
          </div>
        </SketchCard>

        {/* Footer Branding */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center text-sm text-muted-foreground"
        >
          <img src={sidewaysLogo} alt="Sideways" className="h-8 mx-auto mb-2 opacity-50" />
          <p>Creative Problem Solving Outfit</p>
        </motion.footer>
      </div>
    </div>
  );
};

export default SidewaysInterviewCanvas;
