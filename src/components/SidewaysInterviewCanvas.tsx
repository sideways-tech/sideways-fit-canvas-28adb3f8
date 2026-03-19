import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
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
import CvUpload from "./CvUpload";
import KraReferenceBlock from "./KraReferenceBlock";
import sidewaysLogo from "@/assets/sideways-logo.png";

type DiagnosticLevel = "order-taker" | "clarifier" | "diagnostician";
type HonestyLevel = "flattery" | "diplomatic" | "honest";
type MotivationLevel = "unclear" | "practical" | "passionate";
type SidewaysMotivationLevel = "generic" | "culture-fit" | "sideways-specific";
type Verdict = "strong-no" | "lean-no" | "lean-yes" | "strong-yes";

interface FormState {
  candidateName: string;
  candidateRole: string;
  interviewerName: string;
  interviewerEmail: string;
  interviewRound: string;
  department: string;
  hiringLevel: string;
  education: string;
  candidateWebsite: string;
  backgroundNotes: string;
  diagnosticLevel: DiagnosticLevel | "";
  interestedInOthers: number;
  readsWidely: number;
  recentReadExample: string;
  interestsPassionsNotes: string;
  sidewaysWebsiteFeedback: string;
  honestyLevel: HonestyLevel | "";
  depthOfCraft: number;
  articulationSkill: number;
  portfolioQuality: number;
  problemSolvingApproach: number;
  professionalBreadth: number;
  professionalDiveNotes: string;
  depthTopic: string;
  depthScore: number;
  resilienceScore: number;
  aestheticsInterest: number;
  aestheticsProcessNote: string;
  motivationLevel: MotivationLevel | "";
  motivationReason: string;
  sidewaysMotivationLevel: SidewaysMotivationLevel | "";
  sidewaysMotivationReason: string;
}

interface CategoryScores {
  person: number;
  professional: number;
  mindset: number;
  overall: number;
}

const normalizeCategorical = (value: string, map: Record<string, number>): number => {
  return map[value] ?? 0;
};

const calculateCategoryScores = (state: FormState): CategoryScores => {
  // ACT 1: The Person (4 dimensions, equal weight)
  const person = Math.round(
    (state.interestedInOthers +
      state.readsWidely +
      state.aestheticsInterest +
      state.depthScore) / 4
  );

  // ACT 2: The Professional (6 dimensions, weighted)
  const resilienceNormalized = ((state.resilienceScore - 1) / 4) * 100; // 1-5 → 0-100
  const professional = Math.round(
    state.depthOfCraft * 0.22 +
    state.articulationSkill * 0.18 +
    state.portfolioQuality * 0.18 +
    state.problemSolvingApproach * 0.17 +
    state.professionalBreadth * 0.15 +
    resilienceNormalized * 0.10
  );

  // ACT 3: Mindset & Alignment (4 categorical dimensions)
  const diagnosticScore = normalizeCategorical(state.diagnosticLevel, {
    "order-taker": 15, "clarifier": 50, "diagnostician": 100,
  });
  const honestyScore = normalizeCategorical(state.honestyLevel, {
    "flattery": 10, "diplomatic": 50, "honest": 100,
  });
  const motivationScore = normalizeCategorical(state.motivationLevel, {
    "unclear": 10, "practical": 50, "passionate": 100,
  });
  const sidewaysMotivationScore = normalizeCategorical(state.sidewaysMotivationLevel, {
    "generic": 15, "culture-fit": 50, "sideways-specific": 100,
  });
  const mindset = Math.round(
    (diagnosticScore + honestyScore + motivationScore + sidewaysMotivationScore) / 4
  );

  // Overall: weighted combination (Professional matters most)
  const overall = Math.round(person * 0.25 + professional * 0.40 + mindset * 0.35);

  return { person, professional, mindset, overall };
};

const calculateVerdict = (state: FormState): { verdict: Verdict; scores: CategoryScores } => {
  const scores = calculateCategoryScores(state);
  const { person, professional, mindset, overall } = scores;
  const minCategory = Math.min(person, professional, mindset);

  // Strong No: any category critically low OR very low overall
  if (minCategory < 25 || overall < 30) {
    return { verdict: "strong-no", scores };
  }

  // Lean No: any category below threshold OR mediocre overall
  if (minCategory < 40 || overall < 45) {
    return { verdict: "lean-no", scores };
  }

  // Strong Yes: all categories strong AND high overall
  if (minCategory >= 60 && overall >= 65) {
    return { verdict: "strong-yes", scores };
  }

  // Lean Yes: passed minimum bars
  return { verdict: "lean-yes", scores };
};

const SidewaysInterviewCanvas = () => {
  const [formState, setFormState] = useState<FormState>({
    candidateName: "",
    candidateRole: "",
    interviewerName: "",
    interviewerEmail: "",
    interviewRound: "",
    department: "",
    hiringLevel: "",
    education: "",
    candidateWebsite: "",
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

  const [cvFilePath, setCvFilePath] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const { verdict, scores: categoryScores } = useMemo(() => calculateVerdict(formState), [formState]);
  const breadthScore = formState.professionalBreadth;

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const isValidEmail = (v: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(v);
  const isValidUrl = (v: string) => { try { const u = new URL(v); return ["http:", "https:"].includes(u.protocol); } catch { return false; } };

  const requiredFields: { field: keyof FormState; label: string }[] = [
    { field: "candidateName", label: "Candidate's Name" },
    { field: "candidateRole", label: "Role hiring for" },
    { field: "department", label: "Department" },
    { field: "hiringLevel", label: "Hiring Level" },
    { field: "interviewerName", label: "Interviewer Name" },
    { field: "interviewerEmail", label: "Interviewer Email" },
    { field: "interviewRound", label: "Round" },
  ];

  const isFieldEmpty = (field: keyof FormState) => !String(formState[field]).trim();

  const handleSubmitAssessment = async () => {
    // Mark all required fields as touched
    const allTouched: Record<string, boolean> = { ...touched };
    requiredFields.forEach(({ field }) => { allTouched[field] = true; });
    setTouched(allTouched);

    const firstMissing = requiredFields.find(({ field }) => isFieldEmpty(field));
    if (firstMissing) {
      toast({ title: "Missing info", description: `Please fill in "${firstMissing.label}".`, variant: "destructive" });
      return;
    }
    if (!isValidEmail(formState.interviewerEmail.trim())) {
      toast({ title: "Invalid email", description: "Please enter a valid interviewer email address.", variant: "destructive" });
      return;
    }
    if (formState.candidateWebsite.trim()) {
      try {
        const url = new URL(formState.candidateWebsite.trim());
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      } catch {
        toast({ title: "Invalid URL", description: "Please enter a valid portfolio URL starting with https://", variant: "destructive" });
        return;
      }
    }

    setSubmitting(true);
    try {
      // Upsert candidate
      const { data: existingCandidates } = await supabase
        .from("candidates")
        .select("id")
        .eq("name", formState.candidateName.trim())
        .eq("role", formState.candidateRole.trim() || "");

      let candidateId: string;

      if (existingCandidates && existingCandidates.length > 0) {
        candidateId = existingCandidates[0].id;
        await supabase.from("candidates").update({
          department: formState.department || null,
          hiring_level: formState.hiringLevel || null,
          education: formState.education || null,
          website: formState.candidateWebsite || null,
        }).eq("id", candidateId);
      } else {
        const { data: newCandidate, error: cErr } = await supabase
          .from("candidates")
          .insert({
            name: formState.candidateName.trim(),
            role: formState.candidateRole.trim() || null,
            department: formState.department || null,
            hiring_level: formState.hiringLevel || null,
            education: formState.education || null,
            website: formState.candidateWebsite || null,
          })
          .select("id")
          .single();

        if (cErr) throw cErr;
        candidateId = newCandidate.id;
      }

      // Insert assessment
      const { error: aErr } = await supabase.from("assessments").insert({
        candidate_id: candidateId,
        round_number: parseInt(formState.interviewRound),
        interviewer_name: formState.interviewerName.trim(),
        interviewer_email: formState.interviewerEmail.trim() || null,
        cv_file_path: cvFilePath || null,
        background_notes: formState.backgroundNotes || null,
        interested_in_others: formState.interestedInOthers,
        reads_widely: formState.readsWidely,
        recent_read_example: formState.recentReadExample || null,
        interests_passions_notes: formState.interestsPassionsNotes || null,
        depth_topic: formState.depthTopic || null,
        depth_score: formState.depthScore,
        aesthetics_interest: formState.aestheticsInterest,
        aesthetics_process_note: formState.aestheticsProcessNote || null,
        depth_of_craft: formState.depthOfCraft,
        articulation_skill: formState.articulationSkill,
        portfolio_quality: formState.portfolioQuality,
        problem_solving_approach: formState.problemSolvingApproach,
        professional_breadth: formState.professionalBreadth,
        professional_dive_notes: formState.professionalDiveNotes || null,
        resilience_score: formState.resilienceScore,
        diagnostic_level: formState.diagnosticLevel || null,
        honesty_level: formState.honestyLevel || null,
        sideways_website_feedback: formState.sidewaysWebsiteFeedback || null,
        motivation_level: formState.motivationLevel || null,
        motivation_reason: formState.motivationReason || null,
        sideways_motivation_level: formState.sidewaysMotivationLevel || null,
        sideways_motivation_reason: formState.sidewaysMotivationReason || null,
        person_score: categoryScores.person,
        professional_score: categoryScores.professional,
        mindset_score: categoryScores.mindset,
        overall_score: categoryScores.overall,
        verdict,
      });

      if (aErr) throw aErr;

      toast({
        title: "✅ Assessment Saved",
        description: `${formState.candidateName}'s Round ${formState.interviewRound} assessment has been saved.`,
      });
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = () => {
    handleSubmitAssessment();
  };

  const handleInvite = () => {
    if (verdict === "strong-no" || verdict === "lean-no") return;
    handleSubmitAssessment();
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
            "The best people are never just one thing."
          </p>
          <div className="pt-4">
            <h1 className="text-2xl font-semibold">Culture & Talent Assessment</h1>
            <p className="text-muted-foreground">The "Can't Be Templated" Fit Test</p>
          </div>
        </motion.header>

        {/* Candidate Info */}
        <SketchCard className="mb-8" delay={0.1}>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
             {/* Row 1 */}
            <div className="space-y-1.5">
              <Label htmlFor="candidate-name">Candidate's Name <span className="text-destructive">*</span></Label>
              <Input
                id="candidate-name"
                placeholder="Enter name..."
                value={formState.candidateName}
                onChange={(e) => updateField("candidateName", e.target.value)}
                onBlur={() => markTouched("candidateName")}
                className={`sketch-border-light bg-background ${touched.candidateName && isFieldEmpty("candidateName") ? "border-destructive" : ""}`}
              />
              {touched.candidateName && isFieldEmpty("candidateName") && (
                <p className="text-xs text-destructive mt-1">Required</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="candidate-role">Role hiring for <span className="text-destructive">*</span></Label>
              <Input
                id="candidate-role"
                placeholder="Position applying for..."
                value={formState.candidateRole}
                onChange={(e) => updateField("candidateRole", e.target.value)}
                onBlur={() => markTouched("candidateRole")}
                className={`sketch-border-light bg-background ${touched.candidateRole && isFieldEmpty("candidateRole") ? "border-destructive" : ""}`}
              />
              {touched.candidateRole && isFieldEmpty("candidateRole") && (
                <p className="text-xs text-destructive mt-1">Required</p>
              )}
            </div>

            {/* Row 2 */}
            <div className="space-y-1.5">
              <Label>Department <span className="text-destructive">*</span></Label>
              <Select value={formState.department} onValueChange={(value) => { updateField("department", value); markTouched("department"); }}>
                <SelectTrigger className={`sketch-border-light bg-background h-11 ${touched.department && isFieldEmpty("department") ? "border-destructive" : ""}`} onBlur={() => markTouched("department")}>
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
              {touched.department && isFieldEmpty("department") && (
                <p className="text-xs text-destructive mt-1">Required</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Hiring Level</Label>
              <Select value={formState.hiringLevel} onValueChange={(value) => { updateField("hiringLevel", value); if (value !== "L1") updateField("education", ""); }}>
                <SelectTrigger className="sketch-border-light bg-background h-11">
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

            {/* Row 3 */}
            <div className="space-y-1.5">
              <Label className={formState.hiringLevel !== "L1" ? "text-muted-foreground" : ""}>Education</Label>
              <Select
                value={formState.education}
                onValueChange={(value) => updateField("education", value)}
                disabled={formState.hiringLevel !== "L1"}
              >
                <SelectTrigger className={`sketch-border-light bg-background h-11 ${formState.hiringLevel !== "L1" ? "opacity-50 cursor-not-allowed" : ""}`}>
                  <SelectValue placeholder={formState.hiringLevel !== "L1" ? "Only for L1" : "Select education..."} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="graduate">Graduate</SelectItem>
                  <SelectItem value="pg-1year">Post-Graduate (1 year)</SelectItem>
                  <SelectItem value="pg-2years">Post-Graduate (2 years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="candidate-website">Portfolio / Website</Label>
              <Input
                id="candidate-website"
                type="url"
                placeholder="https://..."
                value={formState.candidateWebsite}
                onChange={(e) => updateField("candidateWebsite", e.target.value)}
                onBlur={() => markTouched("candidateWebsite")}
                className={`sketch-border-light bg-background ${touched.candidateWebsite && formState.candidateWebsite.trim() && !isValidUrl(formState.candidateWebsite.trim()) ? "border-destructive focus:ring-destructive" : ""}`}
              />
              {touched.candidateWebsite && formState.candidateWebsite.trim() && !isValidUrl(formState.candidateWebsite.trim()) && (
                <p className="text-xs text-destructive mt-1">Enter a valid URL starting with https://</p>
              )}
            </div>

            {/* Row 4 */}
            <div className="space-y-1.5">
              <Label htmlFor="interviewer-name">Interviewer Name</Label>
              <Input
                id="interviewer-name"
                placeholder="Who is conducting this interview..."
                value={formState.interviewerName}
                onChange={(e) => updateField("interviewerName", e.target.value)}
                className="sketch-border-light bg-background"
              />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="interviewer-email">Interviewer Email</Label>
                <Input
                  id="interviewer-email"
                  type="email"
                  placeholder="interviewer@sideways.com"
                  value={formState.interviewerEmail}
                  onChange={(e) => updateField("interviewerEmail", e.target.value)}
                  onBlur={() => markTouched("interviewerEmail")}
                  className={`sketch-border-light bg-background ${touched.interviewerEmail && formState.interviewerEmail.trim() && !isValidEmail(formState.interviewerEmail.trim()) ? "border-destructive focus:ring-destructive" : ""}`}
                />
                {touched.interviewerEmail && formState.interviewerEmail.trim() && !isValidEmail(formState.interviewerEmail.trim()) && (
                  <p className="text-xs text-destructive mt-1">Enter a valid email address</p>
                )}
              </div>
              <div className="space-y-1.5 shrink-0">
                <Label>Round</Label>
                <Select value={formState.interviewRound} onValueChange={(value) => updateField("interviewRound", value)}>
                  <SelectTrigger className="sketch-border-light bg-highlighter/30 h-11 w-20 rounded-full text-center text-sm font-medium">
                    <SelectValue placeholder="R" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* CV Upload - right column */}
            <div className="sm:col-start-2 pt-1">
              <CvUpload
                candidateName={formState.candidateName}
                onUploadComplete={(path) => setCvFilePath(path)}
                currentFilePath={cvFilePath}
              />
            </div>
          </div>
        </SketchCard>

        {/* KRA Reference Block */}
        <KraReferenceBlock department={formState.department} hiringLevel={formState.hiringLevel} />

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
            <VerdictFooter verdict={verdict} scores={categoryScores} onArchive={handleArchive} onInvite={handleInvite} />
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
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 mt-4 opacity-40 hover:opacity-70 transition-opacity text-xs">
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </motion.footer>
      </div>
    </div>
  );
};

export default SidewaysInterviewCanvas;
