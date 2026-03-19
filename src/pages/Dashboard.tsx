import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, ChevronDown, ChevronRight, FileText, Paperclip, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import HandwrittenLabel from "@/components/HandwrittenLabel";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import sidewaysLogo from "@/assets/sideways-logo.png";

interface Assessment {
  id: string;
  round_number: number;
  interviewer_name: string;
  person_score: number | null;
  professional_score: number | null;
  mindset_score: number | null;
  overall_score: number | null;
  verdict: string | null;
  cv_file_path: string | null;
  created_at: string;
}

interface CandidateWithAssessments {
  id: string;
  name: string;
  role: string | null;
  department: string | null;
  hiring_level: string | null;
  education: string | null;
  website: string | null;
  created_at: string;
  assessments: Assessment[];
}

const verdictStyles: Record<string, { label: string; className: string }> = {
  "strong-no": { label: "Strong No", className: "bg-destructive/10 text-destructive border-destructive/30" },
  "lean-no": { label: "Lean No", className: "bg-destructive/5 text-destructive border-destructive/20" },
  "lean-yes": { label: "Lean Yes", className: "bg-success/5 text-success border-success/20" },
  "strong-yes": { label: "Strong Yes", className: "bg-success/10 text-success border-success/30" },
};

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [verdictFilter, setVerdictFilter] = useState<string>("all");
  const [expandedCandidates, setExpandedCandidates] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: candidates, isLoading } = useQuery({
    queryKey: ["candidates-dashboard"],
    queryFn: async () => {
      const { data: candidatesData, error: cErr } = await supabase
        .from("candidates")
        .select("*")
        .order("created_at", { ascending: false });

      if (cErr) throw cErr;

      const { data: assessmentsData, error: aErr } = await supabase
        .from("assessments")
        .select("*")
        .order("round_number", { ascending: true });

      if (aErr) throw aErr;

      const grouped: CandidateWithAssessments[] = (candidatesData || []).map((c) => ({
        ...c,
        assessments: (assessmentsData || []).filter((a) => a.candidate_id === c.id),
      }));

      return grouped;
    },
  });

  const filtered = candidates?.filter((c) => {
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = departmentFilter === "all" || c.department === departmentFilter;
    const matchesVerdict = verdictFilter === "all" ||
      c.assessments.some((a) => a.verdict === verdictFilter);
    return matchesSearch && matchesDept && matchesVerdict;
  });

  const toggleExpand = (id: string) => {
    setExpandedCandidates((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDelete = async (candidateId: string, candidateName: string) => {
    try {
      // Delete assessments first (foreign key)
      await supabase.from("assessments").delete().eq("candidate_id", candidateId);
      // Delete candidate
      const { error } = await supabase.from("candidates").delete().eq("id", candidateId);
      if (error) throw error;
      toast.success(`${candidateName} has been deleted`);
      queryClient.invalidateQueries({ queryKey: ["candidates-dashboard"] });
    } catch (err) {
      toast.error("Failed to delete candidate");
    }
  };

  const getLatestVerdict = (assessments: Assessment[]) => {
    const latest = assessments[assessments.length - 1];
    return latest?.verdict || null;
  };

  const getLatestOverall = (assessments: Assessment[]) => {
    const latest = assessments[assessments.length - 1];
    return latest?.overall_score ?? null;
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 60) return "text-success";
    if (score >= 40) return "text-secondary";
    return "text-destructive";
  };

  return (
    <div className="min-h-screen bg-background paper-texture">
      <div className="container max-w-6xl py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={sidewaysLogo} alt="Sideways" className="h-12" />
              <div>
                <HandwrittenLabel as="h1" className="text-5xl">Candidate Dashboard</HandwrittenLabel>
                <p className="text-sm text-muted-foreground">All assessments at a glance</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline" className="sketch-border-light gap-2">
                <ArrowLeft className="w-4 h-4" />
                New Assessment
              </Button>
            </Link>
          </div>
        </motion.header>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 sketch-border-light bg-background"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-48 sketch-border-light bg-background">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="strategy">Strategy</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="copy">Copy</SelectItem>
              <SelectItem value="tech-ux">Tech / UX</SelectItem>
              <SelectItem value="product-design">Product Design</SelectItem>
              <SelectItem value="servicing">Servicing</SelectItem>
            </SelectContent>
          </Select>
          <Select value={verdictFilter} onValueChange={setVerdictFilter}>
            <SelectTrigger className="w-full sm:w-48 sketch-border-light bg-background">
              <SelectValue placeholder="Verdict" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verdicts</SelectItem>
              <SelectItem value="strong-yes">Strong Yes</SelectItem>
              <SelectItem value="lean-yes">Lean Yes</SelectItem>
              <SelectItem value="lean-no">Lean No</SelectItem>
              <SelectItem value="strong-no">Strong No</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading candidates...</div>
        ) : !filtered?.length ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-muted-foreground">No candidates found.</p>
            <Link to="/">
              <Button variant="outline" className="sketch-border-light gap-2">
                Start your first assessment
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((candidate, i) => {
              const isExpanded = expandedCandidates.has(candidate.id);
              const latestVerdict = getLatestVerdict(candidate.assessments);
              const latestOverall = getLatestOverall(candidate.assessments);
              const verdictStyle = latestVerdict ? verdictStyles[latestVerdict] : null;

              return (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="sketch-border bg-card p-4 rounded-sm"
                >
                  {/* Candidate Row */}
                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => toggleExpand(candidate.id)}
                  >
                    <div className="flex-shrink-0">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{candidate.name}</h3>
                        {verdictStyle && (
                          <Badge variant="outline" className={verdictStyle.className}>
                            {verdictStyle.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {candidate.role || "No role"} · {candidate.department || "No dept"} · {candidate.hiring_level || "—"}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-sm">
                      <span className={`font-bold tabular-nums ${getScoreColor(latestOverall)}`}>
                        {latestOverall !== null ? latestOverall : "—"}
                      </span>
                      <span className="text-muted-foreground">
                        {candidate.assessments.length} round{candidate.assessments.length !== 1 ? "s" : ""}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(candidate.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Expanded: Assessment Rounds */}
                  {isExpanded && candidate.assessments.length > 0 && (
                    <div className="mt-4 ml-9 space-y-2">
                      {candidate.assessments.map((a) => {
                        const aVerdict = a.verdict ? verdictStyles[a.verdict] : null;
                        return (
                          <div key={a.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-sm text-sm">
                            <span className="font-medium w-20">Round {a.round_number}</span>
                            <span className="text-muted-foreground flex-1">{a.interviewer_name}</span>
                            <div className="hidden sm:flex items-center gap-3">
                              <span className={`tabular-nums ${getScoreColor(a.person_score)}`}>
                                P:{a.person_score ?? "—"}
                              </span>
                              <span className={`tabular-nums ${getScoreColor(a.professional_score)}`}>
                                Pro:{a.professional_score ?? "—"}
                              </span>
                              <span className={`tabular-nums ${getScoreColor(a.mindset_score)}`}>
                                M:{a.mindset_score ?? "—"}
                              </span>
                              <span className={`font-bold tabular-nums ${getScoreColor(a.overall_score)}`}>
                                {a.overall_score ?? "—"}
                              </span>
                            </div>
                            {aVerdict && (
                              <Badge variant="outline" className={aVerdict.className}>
                                {aVerdict.label}
                              </Badge>
                            )}
                            <a
                              href={`/report/${a.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title="View assessment report"
                            >
                              <FileText className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
                            </a>
                            {a.cv_file_path && (
                              <a
                                href="#"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const { data } = await supabase.storage
                                    .from("cvs")
                                    .createSignedUrl(a.cv_file_path!, 60);
                                  if (data?.signedUrl) {
                                    window.open(data.signedUrl, "_blank");
                                  }
                                }}
                                title="Download CV"
                              >
                                <Paperclip className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
                              </a>
                            )}
                            <span className="text-muted-foreground text-xs">
                              {new Date(a.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
