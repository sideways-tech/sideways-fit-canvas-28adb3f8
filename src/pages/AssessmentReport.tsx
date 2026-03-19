import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import sidewaysLogo from "@/assets/sideways-logo.png";

const verdictLabels: Record<string, { label: string; className: string }> = {
  "strong-no": { label: "Strong No", className: "text-destructive" },
  "lean-no": { label: "Lean No", className: "text-destructive" },
  "lean-yes": { label: "Lean Yes", className: "text-success" },
  "strong-yes": { label: "Strong Yes", className: "text-success" },
};

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  if (score === null || score === undefined) return null;
  const color =
    score >= 60 ? "bg-success" : score >= 40 ? "bg-accent" : "bg-destructive";
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-bold tabular-nums">{score}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function SliderRow({ label, value }: { label: string; value: number | null | undefined }) {
  if (value === null || value === undefined) return null;
  const color =
    value >= 60 ? "bg-success" : value >= 40 ? "bg-accent" : "bg-destructive";
  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-bold tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === "" || value === "—") return null;
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground text-right max-w-[60%]">{String(value)}</span>
    </div>
  );
}

function NoteBlock({ title, text }: { title: string; text: string | null | undefined }) {
  if (!text) return null;
  return (
    <div className="sketch-border rounded-lg p-5 mb-5 bg-card">
      <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground whitespace-pre-line">{text}</p>
    </div>
  );
}

function formatCategorical(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const AssessmentReport = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["assessment-report", id],
    queryFn: async () => {
      const { data: assessment, error: aErr } = await supabase
        .from("assessments")
        .select("*")
        .eq("id", id!)
        .single();
      if (aErr) throw aErr;

      const { data: candidate, error: cErr } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", assessment.candidate_id)
        .single();
      if (cErr) throw cErr;

      return { assessment, candidate };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading report…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Report not found.</p>
      </div>
    );
  }

  const { assessment: a, candidate: c } = data;
  const v = a.verdict ? verdictLabels[a.verdict] : null;

  return (
    <div className="min-h-screen bg-background print:bg-white">
      <div className="max-w-2xl mx-auto px-6 py-10 print:py-4">
        {/* Header */}
        <div className="text-center mb-8 print:mb-4">
          <img src={sidewaysLogo} alt="Sideways" className="h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-foreground">Assessment Report</h1>
          <p className="text-sm text-muted-foreground mt-1">Culture & Talent Fit Evaluation</p>
        </div>

        {/* Candidate Info */}
        <div className="sketch-border rounded-lg p-5 mb-5 bg-card">
          <h2 className="text-xl font-bold text-foreground">{c.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {c.role || "Role not specified"} · {(c.department || "").replace(/-/g, " / ").replace(/\b\w/g, (ch) => ch.toUpperCase())} · {c.hiring_level || "—"}
          </p>
          {c.email && (
            <p className="text-sm text-muted-foreground mt-1">{c.email}</p>
          )}
          {c.education && (
            <p className="text-sm text-muted-foreground mt-1">Education: {c.education}</p>
          )}
          {c.website && (
            <p className="text-sm text-muted-foreground mt-1">Website: {c.website}</p>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            Round {a.round_number} · Interviewer: {a.interviewer_name}
            {a.interviewer_email ? ` (${a.interviewer_email})` : ""}
            {" · "}
            {new Date(a.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Verdict */}
        {v && (
          <div className={`sketch-border rounded-lg p-5 mb-5 text-center ${v.className}`}>
            <h3 className="text-3xl font-extrabold">{v.label}</h3>
          </div>
        )}

        {/* Category Scores */}
        <div className="sketch-border rounded-lg p-5 mb-5 bg-card">
          <h3 className="text-base font-bold text-foreground mb-4">Category Scores</h3>
          <ScoreBar label="The Person" score={a.person_score} />
          <ScoreBar label="The Professional" score={a.professional_score} />
          <ScoreBar label="Mindset & Alignment" score={a.mindset_score} />
          <div className="border-t-2 border-border pt-3 mt-4">
            <ScoreBar label="Overall" score={a.overall_score} />
          </div>
        </div>

        {/* The Person — Slider Dimensions */}
        <div className="sketch-border rounded-lg p-5 mb-5 bg-card">
          <h3 className="text-base font-bold text-foreground mb-4">The Person</h3>
          <SliderRow label="Interested in Others" value={a.interested_in_others} />
          <SliderRow label="Reading Breadth" value={a.reads_widely} />
          <SliderRow label="T-Shape Depth" value={a.depth_score} />
          <SliderRow label="Aesthetics Interest" value={a.aesthetics_interest} />
          <DetailRow label="Recent Read / Example" value={a.recent_read_example} />
          <DetailRow label="Depth Topic" value={a.depth_topic} />
          <DetailRow label="Interests & Passions" value={a.interests_passions_notes} />
        </div>

        {/* The Professional — Slider Dimensions */}
        <div className="sketch-border rounded-lg p-5 mb-5 bg-card">
          <h3 className="text-base font-bold text-foreground mb-4">The Professional</h3>
          <SliderRow label="Depth of Craft" value={a.depth_of_craft} />
          <SliderRow label="Articulation Skill" value={a.articulation_skill} />
          <SliderRow label="Portfolio Quality" value={a.portfolio_quality} />
          <SliderRow label="Problem Solving Approach" value={a.problem_solving_approach} />
          <SliderRow label="Professional Breadth" value={a.professional_breadth} />
          <DetailRow label="Aesthetics Process Note" value={a.aesthetics_process_note} />
        </div>

        {/* Mindset & Alignment */}
        <div className="sketch-border rounded-lg p-5 mb-5 bg-card">
          <h3 className="text-base font-bold text-foreground mb-4">Mindset & Alignment</h3>
          <SliderRow label="Resilience" value={a.resilience_score} />
          <DetailRow label="Diagnostic Level" value={formatCategorical(a.diagnostic_level)} />
          <DetailRow label="Honesty Level" value={formatCategorical(a.honesty_level)} />
          <DetailRow label="Motivation Level" value={formatCategorical(a.motivation_level)} />
          <DetailRow label="Motivation Reason" value={a.motivation_reason} />
          <DetailRow label="Sideways Motivation" value={formatCategorical(a.sideways_motivation_level)} />
          <DetailRow label="Sideways Motivation Reason" value={a.sideways_motivation_reason} />
          <DetailRow label="Sideways Website Feedback" value={a.sideways_website_feedback} />
        </div>

        {/* Notes */}
        <NoteBlock title="Background Notes" text={a.background_notes} />
        <NoteBlock title="Professional Deep Dive" text={a.professional_dive_notes} />

        {/* Footer */}
        <div className="text-center py-6 text-xs text-muted-foreground/60">
          <p>Sideways · Creative Problem Solving Outfit</p>
          <p className="mt-1">Internal assessment report — do not forward</p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentReport;
