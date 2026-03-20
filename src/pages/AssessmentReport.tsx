import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import sidewaysLogo from "@/assets/sideways-logo.png";

const verdictLabels: Record<string, { label: string; className: string; description: string }> = {
  "strong-no": { label: "Strong No", className: "text-destructive", description: "Significant gaps across key dimensions. The candidate is unlikely to thrive in a diagnostic, T-shaped culture." },
  "lean-no": { label: "Lean No", className: "text-destructive", description: "Some promising signals but one or more categories fall short. Consider reconnecting in 6–12 months." },
  "lean-yes": { label: "Lean Yes", className: "text-success", description: "Clears the minimum thresholds across all categories. A follow-up conversation or work trial is recommended." },
  "strong-yes": { label: "Strong Yes", className: "text-success", description: "Diagnostic mindset, T-shaped curiosity, and genuine alignment with Sideways culture. Ready for the Circus!" },
};

// MCQ display configs matching the form components exactly
const diagnosticOptions: Record<string, { label: string; description: string }> = {
  "order-taker": { label: "Order Taker", description: "Asked about timeline/budget only" },
  "clarifier": { label: "Clarifier", description: "Asked superficial process questions" },
  "diagnostician": { label: "Diagnostician", description: "Challenged the premise / Asked 'Why'" },
};

const honestyOptions: Record<string, { label: string; description: string }> = {
  "flattery": { label: "Flattery", description: "Only positive things, avoided critique" },
  "diplomatic": { label: "Diplomatic", description: "Balanced but guarded feedback" },
  "honest": { label: "Constructive Critique", description: "The Birbal Standard — Truth to power" },
};

const motivationOptions: Record<string, { label: string; description: string }> = {
  "unclear": { label: "Unclear / Generic", description: "Couldn't articulate why" },
  "practical": { label: "Practical Reasons", description: "Career growth, industry reputation, learning opportunity" },
  "passionate": { label: "Deep Connection", description: "Clear passion for problem-solving, creativity, or impact" },
};

const sidewaysMotivationOptions: Record<string, { label: string; description: string }> = {
  "generic": { label: "Generic — Could Be Any Agency", description: "No specific reason" },
  "culture-fit": { label: "Culture Fit", description: "Resonates with values, work style, or team vibe" },
  "sideways-specific": { label: "Specific to Sideways", description: "Knows our work, references projects, articulates unique draw" },
};

const resilienceDescriptions: Record<number, string> = {
  1: "Took it personally, couldn't let go",
  2: "Struggled but eventually moved on",
  3: "Accepted feedback professionally",
  4: "Iterated well, learned from it",
  5: "Circus Ready! Kills darlings gracefully",
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
  const desc = value <= 20 ? "Low" : value <= 40 ? "Fair" : value <= 60 ? "Good" : value <= 80 ? "Strong" : "Excellent";
  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-bold tabular-nums">{desc} ({value})</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function StarRating({ label, value }: { label: string; value: number | null | undefined }) {
  if (!value) return null;
  const desc = resilienceDescriptions[value] || "";
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className="text-sm font-semibold text-foreground">
          {"★".repeat(value)}{"☆".repeat(5 - value)} {value}/5
        </span>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}

function McqRow({ label, value, options }: { label: string; value: string | null | undefined; options: Record<string, { label: string; description: string }> }) {
  if (!value || !options[value]) return null;
  const opt = options[value];
  const colorClass = Object.keys(options).indexOf(value) === 0 ? "text-destructive" : Object.keys(options).indexOf(value) === Object.keys(options).length - 1 ? "text-success" : "text-accent-foreground";
  return (
    <div className="py-2 border-b border-border last:border-0">
      <div className="flex justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`text-sm font-semibold ${colorClass}`}>{opt.label}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-0.5 text-right">{opt.description}</p>
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
          {c.email && <p className="text-sm text-muted-foreground mt-1">{c.email}</p>}
          {c.education && <p className="text-sm text-muted-foreground mt-1">Education: {c.education}</p>}
          {c.website && <p className="text-sm text-muted-foreground mt-1">Website: {c.website}</p>}
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
            <p className="text-sm mt-2 opacity-80">{v.description}</p>
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

        {/* Act 1: The Person */}
        <div className="sketch-border rounded-lg p-5 mb-5 bg-card">
          <h3 className="text-base font-bold text-foreground mb-4">Act 1 · The Person</h3>
          <SliderRow label="Interested in Others" value={a.interested_in_others} />
          <SliderRow label="Reading Breadth" value={a.reads_widely} />
          <SliderRow label="T-Shape Depth" value={a.depth_score} />
          <SliderRow label="Aesthetics Interest" value={a.aesthetics_interest} />
          {a.depth_topic && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-xs text-muted-foreground">Depth Topic</span>
              <span className="text-xs font-semibold text-foreground">{a.depth_topic}</span>
            </div>
          )}
          {a.recent_read_example && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-xs text-muted-foreground">Recent Read / Example</span>
              <span className="text-xs font-semibold text-foreground text-right max-w-[60%]">{a.recent_read_example}</span>
            </div>
          )}
        </div>

        {/* Person Notes */}
        <NoteBlock title="Background Notes" text={a.background_notes} />
        <NoteBlock title="Interests & Passions" text={a.interests_passions_notes} />

        {/* Act 2: The Professional */}
        <div className="sketch-border rounded-lg p-5 mb-5 bg-card">
          <h3 className="text-base font-bold text-foreground mb-4">Act 2 · The Professional</h3>
          <SliderRow label="Depth of Craft" value={a.depth_of_craft} />
          <SliderRow label="Articulation Skill" value={a.articulation_skill} />
          <SliderRow label="Portfolio Quality" value={a.portfolio_quality} />
          <SliderRow label="Professional Breadth" value={a.professional_breadth} />
          <StarRating label="Willingness to Iterate (Resilience)" value={a.resilience_score} />
        </div>

        {/* Professional Notes */}
        <NoteBlock title="Professional Deep Dive" text={a.professional_dive_notes} />
        <NoteBlock title="Aesthetics Process Note" text={a.aesthetics_process_note} />

        {/* Act 3: Mindset & Alignment */}
        <div className="sketch-border rounded-lg p-5 mb-5 bg-card">
          <h3 className="text-base font-bold text-foreground mb-4">Act 3 · Mindset & Alignment</h3>
          <McqRow label="Diagnostic Mindset" value={a.diagnostic_level} options={diagnosticOptions} />
          <McqRow label="Honesty Level" value={a.honesty_level} options={honestyOptions} />
          <McqRow label="Industry Motivation" value={a.motivation_level} options={motivationOptions} />
          <McqRow label="Sideways Motivation" value={a.sideways_motivation_level} options={sidewaysMotivationOptions} />
        </div>

        {/* Mindset Notes */}
        <NoteBlock title="Industry Motivation — Reason" text={a.motivation_reason} />
        <NoteBlock title="Sideways Motivation — Reason" text={a.sideways_motivation_reason} />

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
