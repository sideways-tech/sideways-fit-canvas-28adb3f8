import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import HandwrittenLabel from "./HandwrittenLabel";
import SketchCard from "./SketchCard";
import BackgroundSection from "./BackgroundSection";
import DiagnosticSection from "./DiagnosticSection";
import InterestedInOthersSection from "./InterestedInOthersSection";
import ReadingBreadthSection from "./ReadingBreadthSection";

import ProfessionalDeepDiveSection from "./ProfessionalDeepDiveSection";
import TShapeVisualizer from "./TShapeVisualizer";
import TShapeDepthSection from "./TShapeDepthSection";
import ResilienceRating from "./ResilienceRating";
import AestheticsSection from "./AestheticsSection";
import IndustryMotivationBlock from "./IndustryMotivationBlock";
import SidewaysMotivationBlock from "./SidewaysMotivationBlock";
import ScoresSummary from "./ScoresSummary";
import VerdictFooter from "./VerdictFooter";
import CvUpload from "./CvUpload";
import KraReferenceBlock from "./KraReferenceBlock";
import ThankYouPage from "./ThankYouPage";
import TranscriptMic, { TranscriptMicHandle } from "./TranscriptMic";
import sidewaysLogo from "@/assets/sideways-logo.png";

type DiagnosticLevel = "order-taker" | "clarifier" | "diagnostician";
type MotivationLevel = "unclear" | "practical" | "passionate";
type SidewaysEngagement = "surface-generic" | "informed-safe" | "genuine-fan" | "opinionated-engaged";
type Verdict = "strong-no" | "lean-no" | "lean-yes" | "strong-yes";

interface FormState {
  candidateName: string;
  candidateEmail: string;
  candidateRole: string;
  interviewerName: string;
  interviewerEmail: string;
  interviewRound: string;
  department: string;
  hiringLevel: string;
  education: string;
  candidateWebsite: string; // kept for DB compatibility
  backgroundNotes: string;
  diagnosticLevel: DiagnosticLevel | "";
  interestedInOthers: number;
  readsWidely: number;
  recentReadExample: string;
  interestsPassionsNotes: string;
  sidewaysWebsiteFeedback: string;
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
  sidewaysMotivationLevel: SidewaysEngagement | "";
  sidewaysMotivationReason: string;
  indianExamples: string;
  internationalExamples: string;
  transcript: string;
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

  // ACT 2: The Professional (5 dimensions, weighted)
  const resilienceNormalized = state.resilienceScore > 0 ? ((state.resilienceScore - 1) / 4) * 100 : 0; // 1-5 → 0-100, 0 = not rated
  const professional = Math.round(
    state.depthOfCraft * 0.27 +
    state.articulationSkill * 0.22 +
    state.portfolioQuality * 0.22 +
    state.professionalBreadth * 0.17 +
    resilienceNormalized * 0.12
  );

  // ACT 3: Mindset & Alignment (4 categorical dimensions)
  const diagnosticScore = normalizeCategorical(state.diagnosticLevel, {
    "order-taker": 15, "clarifier": 50, "diagnostician": 100,
  });
  const motivationScore = normalizeCategorical(state.motivationLevel, {
    "unclear": 10, "practical": 50, "passionate": 100,
  });
  const sidewaysEngagementScore = normalizeCategorical(state.sidewaysMotivationLevel, {
    "surface-generic": 10, "informed-safe": 40, "genuine-fan": 85, "opinionated-engaged": 100,
  });
  const mindset = Math.round(
    (diagnosticScore + motivationScore + sidewaysEngagementScore) / 3
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

  // T-Shape floor: Depth of Craft must meet minimum for positive verdicts
  if (state.depthOfCraft < 15) {
    return { verdict: "strong-no", scores };
  }
  if (state.depthOfCraft < 30) {
    return { verdict: "lean-no", scores };
  }

  // T-Shape floor: Professional Breadth minimum
  if (state.professionalBreadth < 20) {
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
  const { signOut, session } = useAuth();
  const { isSuperAdmin } = useSuperAdmin();
  const loggedInEmail = session?.user?.email || "";
  const [formState, setFormState] = useState<FormState>({
    candidateName: "",
    candidateEmail: "",
    candidateRole: "",
    interviewerName: "",
    interviewerEmail: loggedInEmail,
    interviewRound: "",
    department: "",
    hiringLevel: "",
    education: "",
    candidateWebsite: "",
    backgroundNotes: "",
    diagnosticLevel: "",
    interestedInOthers: 0,
    readsWidely: 0,
    recentReadExample: "",
    interestsPassionsNotes: "",
    sidewaysWebsiteFeedback: "",
    depthOfCraft: 0,
    articulationSkill: 0,
    portfolioQuality: 0,
    problemSolvingApproach: 0,
    professionalBreadth: 0,
    professionalDiveNotes: "",
    depthTopic: "",
    depthScore: 0,
    resilienceScore: 0,
    aestheticsInterest: 0,
    aestheticsProcessNote: "",
    motivationLevel: "",
    motivationReason: "",
    sidewaysMotivationLevel: "",
    sidewaysMotivationReason: "",
    indianExamples: "",
    internationalExamples: "",
    transcript: "",
  });

  const [cvFilePath, setCvFilePath] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  // Auto-fill interviewer email from session
  useEffect(() => {
    if (loggedInEmail) {
      setFormState((prev) => ({ ...prev, interviewerEmail: loggedInEmail }));
    }
  }, [loggedInEmail]);

  const { verdict, scores: categoryScores } = useMemo(() => calculateVerdict(formState), [formState]);
  const breadthScore = formState.professionalBreadth;

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const [submitted, setSubmitted] = useState(false);
  const roundAutoSetRef = useRef(false);

  const isValidEmail = (v: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(v);
  const isValidUrl = (v: string) => { try { const u = new URL(v); return ["http:", "https:"].includes(u.protocol); } catch { return false; } };

  // Auto-detect round number when candidate email changes
  useEffect(() => {
    const email = formState.candidateEmail.trim();
    if (!email || !isValidEmail(email)) {
      roundAutoSetRef.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { data: candidates } = await supabase
          .from("candidates")
          .select("id")
          .eq("email", email)
          .limit(1);

        if (!candidates || candidates.length === 0) {
          setFormState((prev) => ({ ...prev, interviewRound: prev.interviewRound || "1" }));
          roundAutoSetRef.current = false;
          return;
        }

        const candidateId = candidates[0].id;
        const { data: assessments } = await supabase
          .from("assessments")
          .select("round_number")
          .eq("candidate_id", candidateId)
          .order("round_number", { ascending: false })
          .limit(1);

        const maxRound = assessments?.[0]?.round_number ?? 0;
        const nextRound = Math.min(maxRound + 1, 5);
        setFormState((prev) => ({ ...prev, interviewRound: nextRound.toString() }));
        roundAutoSetRef.current = true;

        if (maxRound > 0) {
          toast({
            title: "Returning candidate",
            description: `Previous round ${maxRound} found — auto-set to Round ${nextRound}.`,
          });
        }
      } catch {
        // Silent fail — don't block the form
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formState.candidateEmail]);

  const requiredFields: { field: keyof FormState; label: string }[] = [
    { field: "candidateName", label: "Candidate's Name" },
    { field: "candidateEmail", label: "Candidate's Email" },
    { field: "candidateRole", label: "Role hiring for" },
    { field: "department", label: "Department" },
    { field: "hiringLevel", label: "Hiring Level" },
    { field: "interviewerName", label: "Interviewer Name" },
    { field: "interviewRound", label: "Round" },
  ];

  const requiredSelections: { field: keyof FormState; label: string; section: string }[] = [
    { field: "diagnosticLevel", label: "Diagnostic Mindset", section: "Section F" },
    { field: "motivationLevel", label: "Industry Motivation", section: "Section D" },
    { field: "sidewaysMotivationLevel", label: "Sideways Engagement", section: "Section E" },
  ];

  const isFieldEmpty = (field: keyof FormState) => !String(formState[field]).trim();

  const transcriptMicRef = useRef<TranscriptMicHandle>(null);
  const transcriptRef = useRef<string>("");

  const handleSubmitAssessment = async () => {
    // Stop recording if active before saving, and wait for Deepgram to
    // flush any final words into the transcript before we read formState.
    if (transcriptMicRef.current?.isRecording()) {
      transcriptMicRef.current.stopRecording();
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    // Mark all required fields as touched
    const allTouched: Record<string, boolean> = { ...touched };
    requiredFields.forEach(({ field }) => { allTouched[field] = true; });
    requiredSelections.forEach(({ field }) => { allTouched[field as string] = true; });
    allTouched["resilienceScore"] = true;
    setTouched(allTouched);

    const firstMissing = requiredFields.find(({ field }) => isFieldEmpty(field));
    if (firstMissing) {
      toast({ title: "Missing info", description: `Please fill in "${firstMissing.label}".`, variant: "destructive" });
      return;
    }
    if (!isValidEmail(formState.candidateEmail.trim())) {
      toast({ title: "Invalid email", description: "Please enter a valid candidate email address.", variant: "destructive" });
      return;
    }
    if (!isValidEmail(formState.interviewerEmail.trim())) {
      toast({ title: "Invalid email", description: "Please enter a valid interviewer email address.", variant: "destructive" });
      return;
    }

    // Validate MCQs & widgets
    const missedSelection = requiredSelections.find(({ field }) => isFieldEmpty(field));
    if (missedSelection) {
      toast({ title: "Missing selection", description: `Please select an option for "${missedSelection.label}" in ${missedSelection.section}.`, variant: "destructive" });
      return;
    }
    if (formState.resilienceScore === 0) {
      toast({ title: "Missing rating", description: `Please rate "Resilience Score" (star rating) in Section C.`, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // Upsert candidate
      const { data: existingCandidates } = await supabase
        .from("candidates")
        .select("id")
        .eq("email", formState.candidateEmail.trim());

      let candidateId: string;

      if (existingCandidates && existingCandidates.length > 0) {
        candidateId = existingCandidates[0].id;
        await supabase.from("candidates").update({
          name: formState.candidateName.trim(),
          role: formState.candidateRole.trim() || null,
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
            email: formState.candidateEmail.trim(),
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
      const { data: savedAssessment, error: aErr } = await supabase.from("assessments").insert({
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
        honesty_level: null,
        sideways_website_feedback: formState.sidewaysWebsiteFeedback || null,
        motivation_level: formState.motivationLevel || null,
        motivation_reason: formState.motivationReason || null,
        sideways_motivation_level: formState.sidewaysMotivationLevel || null,
        sideways_motivation_reason: [
          formState.sidewaysMotivationReason,
          formState.indianExamples ? `[Indian Examples] ${formState.indianExamples}` : "",
          formState.internationalExamples ? `[International Examples] ${formState.internationalExamples}` : "",
        ].filter(Boolean).join("\n\n") || null,
        person_score: categoryScores.person,
        professional_score: categoryScores.professional,
        mindset_score: categoryScores.mindset,
        overall_score: categoryScores.overall,
        verdict,
        transcript: (transcriptRef.current || formState.transcript || null),
      }).select("*").single();

      if (aErr) throw aErr;

      // Send email report if interviewer email provided
      if (formState.interviewerEmail.trim()) {
        try {
          await supabase.functions.invoke("send-assessment-report", {
            body: {
              assessmentId: savedAssessment.id,
              interviewerEmail: formState.interviewerEmail.trim(),
            },
          });
        } catch {
          // Email is best-effort; don't block the save
        }
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  if (submitted) {
    return (
      <ThankYouPage
        candidateName={formState.candidateName}
        roundNumber={formState.interviewRound}
        verdict={verdict}
        interviewerEmail={formState.interviewerEmail}
        overallScore={categoryScores.overall}
        onStartNew={() => window.location.reload()}
      />
    );
  }

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
              <Label htmlFor="candidate-email">Candidate's Email <span className="text-destructive">*</span></Label>
              <Input
                id="candidate-email"
                type="email"
                placeholder="candidate@email.com"
                value={formState.candidateEmail}
                onChange={(e) => updateField("candidateEmail", e.target.value)}
                onBlur={() => markTouched("candidateEmail")}
                className={`sketch-border-light bg-background ${touched.candidateEmail && (isFieldEmpty("candidateEmail") || (!isFieldEmpty("candidateEmail") && !isValidEmail(formState.candidateEmail.trim()))) ? "border-destructive" : ""}`}
              />
              <div className="h-5">
                {touched.candidateEmail && isFieldEmpty("candidateEmail") && (
                  <p className="text-xs text-destructive">Required</p>
                )}
                {touched.candidateEmail && !isFieldEmpty("candidateEmail") && !isValidEmail(formState.candidateEmail.trim()) && (
                  <p className="text-xs text-destructive">Please enter a valid email</p>
                )}
              </div>
            </div>


            {/* Row 2 */}
            <div className="space-y-1.5">
              <Label>Department <span className="text-destructive">*</span></Label>
              <Select value={formState.department} onValueChange={(value) => { updateField("department", value); markTouched("department"); }}>
                <SelectTrigger className={`sketch-border-light bg-background h-11 ${touched.department && isFieldEmpty("department") ? "border-destructive" : ""}`} onBlur={() => markTouched("department")}>
                  <SelectValue placeholder="Select department..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creative-copy-art">Creative (Copy & Art)</SelectItem>
                  <SelectItem value="creative-design">Creative Design</SelectItem>
                  <SelectItem value="account-management">Account Management</SelectItem>
                  <SelectItem value="strategy">Strategy</SelectItem>
                  <SelectItem value="tech-ux">Tech / UX</SelectItem>
                </SelectContent>
              </Select>
              {touched.department && isFieldEmpty("department") && (
                <p className="text-xs text-destructive mt-1">Required</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Hiring Level <span className="text-destructive">*</span></Label>
              <Select value={formState.hiringLevel} onValueChange={(value) => { updateField("hiringLevel", value); markTouched("hiringLevel"); if (value !== "L1") updateField("education", ""); }}>
                <SelectTrigger className={`sketch-border-light bg-background h-11 ${touched.hiringLevel && isFieldEmpty("hiringLevel") ? "border-destructive" : ""}`} onBlur={() => markTouched("hiringLevel")}>
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
              {touched.hiringLevel && isFieldEmpty("hiringLevel") && (
                <p className="text-xs text-destructive mt-1">Required</p>
              )}
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
                  <SelectValue placeholder="Select education..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="graduate">Graduate</SelectItem>
                  <SelectItem value="pg-1year">Post-Graduate (1 year)</SelectItem>
                  <SelectItem value="pg-2years">Post-Graduate (2 years)</SelectItem>
                </SelectContent>
              </Select>
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

            {/* Row 4 */}
            <div className="space-y-1.5">
              <Label htmlFor="interviewer-name">Interviewer Name <span className="text-destructive">*</span></Label>
              <Input
                id="interviewer-name"
                placeholder="Who is conducting this interview..."
                value={formState.interviewerName}
                onChange={(e) => updateField("interviewerName", e.target.value)}
                onBlur={() => markTouched("interviewerName")}
                className={`sketch-border-light bg-background ${touched.interviewerName && isFieldEmpty("interviewerName") ? "border-destructive" : ""}`}
              />
              {touched.interviewerName && isFieldEmpty("interviewerName") && (
                <p className="text-xs text-destructive mt-1">Required</p>
              )}
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="interviewer-email">Interviewer Email <span className="text-destructive">*</span></Label>
                <Input
                  id="interviewer-email"
                  type="email"
                  placeholder="interviewer@sideways.com"
                  value={formState.interviewerEmail}
                  disabled
                  className="sketch-border-light bg-muted/50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Auto-filled from your login</p>
              </div>
              <div className="space-y-1.5 shrink-0">
                <Label>Round <span className="text-destructive">*</span></Label>
                <Select value={formState.interviewRound} onValueChange={(value) => { updateField("interviewRound", value); markTouched("interviewRound"); }}>
                  <SelectTrigger className={`sketch-border-light bg-highlighter/30 h-11 w-20 rounded-full text-center text-sm font-medium ${touched.interviewRound && isFieldEmpty("interviewRound") ? "border-destructive" : ""}`} onBlur={() => markTouched("interviewRound")}>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
                <div className="h-5">
                  {touched.interviewRound && isFieldEmpty("interviewRound") && (
                    <p className="text-xs text-destructive">Required</p>
                  )}
                </div>
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
              department={formState.department}
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
              department={formState.department}
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
              professionalBreadth={formState.professionalBreadth}
              professionalDiveNotes={formState.professionalDiveNotes}
              department={formState.department}
              onDepthOfCraftChange={(value) => updateField("depthOfCraft", value)}
              onArticulationSkillChange={(value) => updateField("articulationSkill", value)}
              onPortfolioQualityChange={(value) => updateField("portfolioQuality", value)}
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

        {/* D. Why This Industry */}
        <SketchCard className="mb-8" delay={0.4}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">D. Why This Industry</HandwrittenLabel>
              <p className="text-sm text-muted-foreground">Why did they choose this industry or role?</p>
            </div>
            <IndustryMotivationBlock
              level={formState.motivationLevel}
              reason={formState.motivationReason}
              department={formState.department}
              onLevelChange={(value) => updateField("motivationLevel", value)}
              onReasonChange={(value) => updateField("motivationReason", value)}
            />
          </div>
        </SketchCard>

        {/* E. Why Sideways */}
        <SketchCard className="mb-8" delay={0.45}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">E. Why Sideways</HandwrittenLabel>
              <p className="text-sm text-muted-foreground">Do they know who we are — and can they be honest about it?</p>
            </div>
            <SidewaysMotivationBlock
              sidewaysLevel={formState.sidewaysMotivationLevel}
              sidewaysReason={formState.sidewaysMotivationReason}
              onSidewaysLevelChange={(value) => updateField("sidewaysMotivationLevel", value)}
              onSidewaysReasonChange={(value) => updateField("sidewaysMotivationReason", value)}
              campaignExamples={formState.indianExamples}
              onCampaignExamplesChange={(value) => updateField("indianExamples", value)}
              department={formState.department}
            />
          </div>
        </SketchCard>

        {/* F. Diagnostic Mindset — Post-interview grading */}
        <SketchCard className="mb-8" delay={0.5}>
          <div className="space-y-4">
            <div className="space-y-1">
              <HandwrittenLabel as="h3" className="text-4xl">F. Diagnostic Mindset</HandwrittenLabel>
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
              resilienceScore={formState.resilienceScore}
              aestheticsInterest={formState.aestheticsInterest}
              motivationLevel={formState.motivationLevel}
              sidewaysMotivationLevel={formState.sidewaysMotivationLevel}
              depthOfCraft={formState.depthOfCraft}
              articulationSkill={formState.articulationSkill}
              portfolioQuality={formState.portfolioQuality}
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
            <VerdictFooter verdict={verdict} scores={categoryScores} onArchive={handleArchive} onInvite={handleInvite} isSaving={submitting} />
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
          <div className="flex items-center justify-center gap-4 mt-4">
            {isSuperAdmin && (
              <>
                <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
                <span className="text-border">|</span>
              </>
            )}
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              <span>Archive</span>
            </Link>
            <span className="text-border">|</span>
            <button onClick={signOut} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </motion.footer>

        {/* Sticky Transcript Mic */}
        <TranscriptMic ref={transcriptMicRef} onTranscriptChange={(t) => updateField("transcript", t)} />
      </div>
    </div>
  );
};

export default SidewaysInterviewCanvas;
