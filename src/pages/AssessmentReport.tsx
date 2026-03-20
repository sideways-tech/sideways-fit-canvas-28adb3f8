import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const verdictConfig: Record<string, { label: string; emoji: string; bgClass: string; borderClass: string; textClass: string; description: string }> = {
  "strong-no": { label: "Strong No", emoji: "✕", bgClass: "bg-red-50", borderClass: "border-red-300", textClass: "text-red-600", description: "Significant gaps across key dimensions. The candidate is unlikely to thrive in a diagnostic, T-shaped culture." },
  "lean-no": { label: "Lean No", emoji: "↓", bgClass: "bg-orange-50", borderClass: "border-orange-300", textClass: "text-orange-600", description: "Some promising signals but one or more categories fall short. Consider reconnecting in 6–12 months." },
  "lean-yes": { label: "Lean Yes", emoji: "✓", bgClass: "bg-green-50", borderClass: "border-green-300", textClass: "text-green-600", description: "Clears the minimum thresholds across all categories. A follow-up conversation or work trial is recommended." },
  "strong-yes": { label: "Strong Yes", emoji: "★", bgClass: "bg-green-50", borderClass: "border-green-400", textClass: "text-green-700", description: "Diagnostic mindset, T-shaped curiosity, and genuine alignment with Sideways culture. A natural fit." },
};

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
  1: "Got defensive — struggled to separate self from work",
  2: "Took it hard, but eventually found a way forward",
  3: "Handled it professionally — no drama, moved on",
  4: "Embraced the feedback and came back stronger",
  5: "Thrives on iteration — treats every critique as fuel",
};

function scoreColor(s: number) {
  return s >= 60 ? "text-green-600" : s >= 40 ? "text-amber-600" : "text-red-600";
}
function scoreBgColor(s: number) {
  return s >= 60 ? "bg-green-600" : s >= 40 ? "bg-amber-500" : "bg-red-500";
}
function scoreBgLight(s: number) {
  return s >= 60 ? "bg-green-100" : s >= 40 ? "bg-amber-100" : "bg-red-100";
}
function sliderLabel(v: number) {
  if (v <= 20) return "Low";
  if (v <= 40) return "Fair";
  if (v <= 60) return "Good";
  if (v <= 80) return "Strong";
  return "Excellent";
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-6 mb-4 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <p className="text-[15px] font-bold text-slate-900 mb-4">{icon} {title}</p>
  );
}

function CategoryScoreBlock({ label, score }: { label: string; score: number | null }) {
  const s = Number(score) || 0;
  return (
    <div className="bg-slate-50 rounded-lg border border-slate-200 p-3.5 text-center">
      <p className="text-[11px] text-slate-500 font-medium">{label}</p>
      <p className={`text-[28px] font-extrabold leading-none mt-1.5 ${scoreColor(s)}`}>{s}</p>
      <div className={`${scoreBgLight(s)} rounded-full h-1.5 overflow-hidden mt-2`}>
        <div className={`h-full ${scoreBgColor(s)} rounded-full`} style={{ width: `${s}%` }} />
      </div>
    </div>
  );
}

function SliderRow({ icon, label, value }: { icon: string; label: string; value: number | null | undefined }) {
  if (value === null || value === undefined) return null;
  const v = Number(value) || 0;
  return (
    <div className="py-2">
      <div className="flex items-center gap-3">
        <span className="text-[13px] text-slate-600 w-[40%]">{icon} {label}</span>
        <div className="flex-1 px-3">
          <div className={`${scoreBgLight(v)} rounded-full h-2 overflow-hidden`}>
            <div className={`h-full ${scoreBgColor(v)} rounded-full`} style={{ width: `${v}%` }} />
          </div>
        </div>
        <span className={`text-xs font-semibold whitespace-nowrap ${scoreColor(v)}`}>
          {sliderLabel(v)} ({v})
        </span>
      </div>
    </div>
  );
}

function McqRow({ label, value, options }: { label: string; value: string | null | undefined; options: Record<string, { label: string; description: string }> }) {
  if (!value || !options[value]) return null;
  const opt = options[value];
  const keys = Object.keys(options);
  const idx = keys.indexOf(value);
  const colorClass = idx === keys.length - 1 ? "text-green-600" : idx === 0 ? "text-red-600" : "text-amber-600";
  return (
    <div className="py-2.5 border-b border-slate-100 last:border-0">
      <div className="flex justify-between items-start">
        <span className="text-[13px] text-slate-500 w-[40%]">{label}</span>
        <div className="text-right">
          <p className={`text-[13px] font-bold ${colorClass}`}>{opt.label}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{opt.description}</p>
        </div>
      </div>
    </div>
  );
}

function StarRating({ label, value }: { label: string; value: number | null | undefined }) {
  if (!value) return null;
  const desc = resilienceDescriptions[value] || "";
  const color = value >= 4 ? "text-green-600" : value >= 3 ? "text-amber-600" : "text-red-600";
  return (
    <div className="py-2.5 border-b border-slate-100 last:border-0">
      <div className="flex justify-between items-start">
        <span className="text-[13px] text-slate-500 w-[40%]">{label}</span>
        <div className="text-right">
          <p className={`text-base ${color}`} style={{ letterSpacing: "2px" }}>
            {"★".repeat(value)}{"☆".repeat(5 - value)}{" "}
            <span className="text-[13px] font-bold">{value}/5</span>
          </p>
          {desc && <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>}
        </div>
      </div>
    </div>
  );
}

function NoteBlock({ title, text, icon }: { title: string; text: string | null | undefined; icon: string }) {
  if (!text) return null;
  return (
    <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-3">
      <p className="text-[13px] font-bold text-slate-900 mb-2">{icon} {title}</p>
      <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-line">{text}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="py-2 border-b border-slate-100 flex justify-between">
      <span className="text-[13px] text-slate-400">{label}</span>
      <span className="text-[13px] font-semibold text-slate-900">{value}</span>
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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-500">Loading report…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-red-600">Report not found.</p>
      </div>
    );
  }

  const { assessment: a, candidate: c } = data;
  const v = a.verdict ? verdictConfig[a.verdict] : null;
  const deptDisplay = (c.department || "").replace(/-/g, " / ").replace(/\b\w/g, (ch) => ch.toUpperCase());

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      <div className="max-w-[640px] mx-auto px-4 py-8 print:py-4">

        {/* Header */}
        <div className="text-center mb-6 print:mb-4">
          <p className="text-[13px] font-extrabold tracking-[4px] uppercase text-slate-900">SIDEWAYS</p>
          <p className="text-[11px] tracking-[1.5px] text-slate-400 uppercase mt-1">Hiring Assessment Report</p>
        </div>

        {/* Candidate Info Card */}
        <Card>
          <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight">{c.name}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {c.role || "Role not specified"}{deptDisplay ? ` · ${deptDisplay}` : ""}{c.hiring_level ? ` · ${c.hiring_level}` : ""}
          </p>
          {c.email && <p className="text-[13px] text-slate-400 mt-1">{c.email}</p>}
          {c.education && <p className="text-[13px] text-slate-400 mt-0.5">Education: {c.education}</p>}
          {c.website && <p className="text-[13px] text-slate-400 mt-0.5">Website: {c.website}</p>}
          <p className="text-xs text-slate-400 mt-3">
            Round {a.round_number} · Interviewer: {a.interviewer_name}
            {a.interviewer_email ? ` (${a.interviewer_email})` : ""}
            {" · "}
            {new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </Card>

        {/* Verdict Banner */}
        {v && (
          <div className={`${v.bgClass} rounded-xl border-2 ${v.borderClass} p-7 mb-4 text-center`}>
            <p className={`text-4xl font-black tracking-tight ${v.textClass}`}>{v.emoji} {v.label}</p>
            <p className={`text-[13px] ${v.textClass} mt-2 leading-snug`}>{v.description}</p>
          </div>
        )}

        {/* Category Scores Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <CategoryScoreBlock label="The Person" score={a.person_score} />
          <CategoryScoreBlock label="The Professional" score={a.professional_score} />
          <CategoryScoreBlock label="Mindset" score={a.mindset_score} />
          <CategoryScoreBlock label="Overall" score={a.overall_score} />
        </div>

        {/* Act 1: The Person */}
        <Card>
          <SectionTitle icon="👤" title="Act 1 · The Person" />
          <SliderRow icon="🤝" label="Interested in Others" value={a.interested_in_others} />
          <SliderRow icon="📚" label="Reading Breadth" value={a.reads_widely} />
          <SliderRow icon="🔬" label="T-Shape Depth" value={a.depth_score} />
          <SliderRow icon="🎨" label="Aesthetics Interest" value={a.aesthetics_interest} />
          {a.depth_topic && <DetailRow label="Depth Topic" value={a.depth_topic} />}
          {a.recent_read_example && <DetailRow label="Recent Read / Example" value={a.recent_read_example} />}
        </Card>

        <NoteBlock title="Interests & Passions" text={a.interests_passions_notes} icon="✨" />
        <NoteBlock title="Background Notes" text={a.background_notes} icon="📝" />

        {/* Act 2: The Professional */}
        <Card>
          <SectionTitle icon="💼" title="Act 2 · The Professional" />
          <SliderRow icon="⚒️" label="Depth of Craft" value={a.depth_of_craft} />
          <SliderRow icon="🗣️" label="Articulation Skill" value={a.articulation_skill} />
          <SliderRow icon="📁" label="Portfolio Quality" value={a.portfolio_quality} />
          <SliderRow icon="🌐" label="Professional Breadth" value={a.professional_breadth} />
          <StarRating label="Willingness to Iterate (Resilience)" value={a.resilience_score} />
        </Card>

        <NoteBlock title="Professional Deep Dive" text={a.professional_dive_notes} icon="🔍" />
        <NoteBlock title="Aesthetics Process Note" text={a.aesthetics_process_note} icon="🎨" />

        {/* Act 3: Mindset & Alignment */}
        <Card>
          <SectionTitle icon="🧠" title="Act 3 · Mindset & Alignment" />
          <McqRow label="Diagnostic Mindset" value={a.diagnostic_level} options={diagnosticOptions} />
          <McqRow label="Honesty Level" value={a.honesty_level} options={honestyOptions} />
          <McqRow label="Industry Motivation" value={a.motivation_level} options={motivationOptions} />
          <McqRow label="Sideways Motivation" value={a.sideways_motivation_level} options={sidewaysMotivationOptions} />
        </Card>

        <NoteBlock title="Why This Industry — Reason" text={a.motivation_reason} icon="🔥" />
        <NoteBlock title="Why Sideways / Work Critique" text={a.sideways_motivation_reason || a.sideways_website_feedback} icon="🎯" />
        {a.sideways_motivation_reason && a.sideways_website_feedback && a.sideways_website_feedback !== a.sideways_motivation_reason && (
          <NoteBlock title="Additional Sideways Work Feedback" text={a.sideways_website_feedback} icon="🧭" />
        )}

        {/* CV Link */}
        {a.cv_file_path && (
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-3.5 mb-4 text-center">
            <p className="text-[13px] text-blue-700 font-semibold">📎 Candidate's CV / Resume is on file</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-[11px] font-bold tracking-[3px] uppercase text-slate-300">Sideways</p>
          <p className="text-[11px] text-slate-300 mt-1">Creative Problem Solving Outfit</p>
          <p className="text-[10px] text-slate-200 mt-2">This is an internal assessment report. Please do not forward.</p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentReport;
