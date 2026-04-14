import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, ArrowLeft, ChevronDown, ChevronRight, FileText, Paperclip, Trash2, ChevronLeftIcon, ChevronRightIcon, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import HandwrittenLabel from "@/components/HandwrittenLabel";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import sidewaysLogo from "@/assets/sideways-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";

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
  transcript?: string | null;
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

const ROWS_PER_PAGE = 10;

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [verdictFilter, setVerdictFilter] = useState<string>("all");
  const [expandedCandidates, setExpandedCandidates] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { isSuperAdmin, isLoading: isAdminLoading } = useSuperAdmin();
  const userEmail = session?.user?.email?.toLowerCase() || "";

  const { data: candidates, isLoading } = useQuery({
    queryKey: ["candidates-dashboard", isSuperAdmin, userEmail],
    queryFn: async () => {
      const { data: candidatesData, error: cErr } = await supabase
        .from("candidates")
        .select("*")
        .order("created_at", { ascending: false });

      if (cErr) throw cErr;

      let assessmentsQuery = supabase
        .from("assessments")
        .select("*")
        .order("round_number", { ascending: true });

      // Non-admins only see their own assessments
      if (!isSuperAdmin) {
        assessmentsQuery = assessmentsQuery.eq("interviewer_email", userEmail);
      }

      const { data: assessmentsData, error: aErr } = await assessmentsQuery;
      if (aErr) throw aErr;

      const assessmentCandidateIds = new Set((assessmentsData || []).map((a) => a.candidate_id));

      let grouped: CandidateWithAssessments[] = (candidatesData || []).map((c) => ({
        ...c,
        assessments: (assessmentsData || []).filter((a) => a.candidate_id === c.id),
      }));

      // Non-admins only see candidates they have assessments for
      if (!isSuperAdmin) {
        grouped = grouped.filter((c) => assessmentCandidateIds.has(c.id));
      }

      return grouped;
    },
    enabled: !isAdminLoading,
  });

  const filtered = candidates?.filter((c) => {
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = departmentFilter === "all" || c.department === departmentFilter;
    const matchesVerdict = verdictFilter === "all" ||
      c.assessments.some((a) => a.verdict === verdictFilter);
    return matchesSearch && matchesDept && matchesVerdict;
  });

  // Reset to page 1 when filters change
  const totalPages = Math.ceil((filtered?.length || 0) / ROWS_PER_PAGE);
  const safePage = Math.min(currentPage, totalPages || 1);
  const paginatedCandidates = filtered?.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  const toggleExpand = (id: string) => {
    setExpandedCandidates((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDelete = async (candidateId: string, candidateName: string) => {
    try {
      await supabase.from("assessments").delete().eq("candidate_id", candidateId);
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
    <TooltipProvider delayDuration={300}>
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
                  <HandwrittenLabel as="h1" className="text-5xl">Interview Archive</HandwrittenLabel>
                  <p className="text-sm text-muted-foreground">All assessments at a glance</p>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/">
                    <Button variant="outline" className="sketch-border-light gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      New Assessment
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Start a new candidate assessment</TooltipContent>
              </Tooltip>
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
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-10 sketch-border-light bg-background"
              />
            </div>
            <Select value={departmentFilter} onValueChange={(v) => { setDepartmentFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-48 sketch-border-light bg-background">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="creative-copy-art">Creative (Copy & Art)</SelectItem>
                <SelectItem value="creative-design">Creative Design</SelectItem>
                <SelectItem value="account-management">Account Management</SelectItem>
                <SelectItem value="strategy">Strategy</SelectItem>
                <SelectItem value="tech-ux">Tech / UX</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verdictFilter} onValueChange={(v) => { setVerdictFilter(v); setCurrentPage(1); }}>
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
            <>
              <div className="space-y-3">
                {paginatedCandidates?.map((candidate, i) => {
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex-shrink-0">
                              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{isExpanded ? "Collapse rounds" : "Expand rounds"}</TooltipContent>
                        </Tooltip>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{candidate.name}</h3>
                            {verdictStyle && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className={verdictStyle.className}>
                                    {verdictStyle.label}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>Latest interview verdict</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {candidate.role || "No role"} · {candidate.department || "No dept"} · {candidate.hiring_level || "—"}
                          </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-4 text-sm">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className={`font-bold tabular-nums ${getScoreColor(latestOverall)}`}>
                                {latestOverall !== null ? latestOverall : "—"}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>Overall score (latest round)</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-muted-foreground">
                                {candidate.assessments.length} round{candidate.assessments.length !== 1 ? "s" : ""}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>Number of assessment rounds</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-muted-foreground">
                                {new Date(candidate.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>Date added</TooltipContent>
                          </Tooltip>
                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1 rounded hover:bg-destructive/10 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                                  </button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Delete candidate</TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete {candidate.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this candidate and all their assessment rounds. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDelete(candidate.id, candidate.name)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {/* Expanded: Assessment Rounds */}
                      {isExpanded && candidate.assessments.length > 0 && (
                        <div className="mt-4 ml-9 space-y-2">
                          {candidate.assessments.map((a) => {
                            const aVerdict = a.verdict ? verdictStyles[a.verdict] : null;
                            return (
                              <div key={a.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-sm text-sm">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="font-medium w-20">Round {a.round_number}</span>
                                  </TooltipTrigger>
                                  <TooltipContent>Assessment round number</TooltipContent>
                                </Tooltip>
                                <span className="text-muted-foreground flex-1">{a.interviewer_name}</span>
                                <div className="hidden sm:flex items-center gap-3">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className={`tabular-nums ${getScoreColor(a.person_score)}`}>
                                        P:{a.person_score ?? "—"}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>Person Score</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className={`tabular-nums ${getScoreColor(a.professional_score)}`}>
                                        Pro:{a.professional_score ?? "—"}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>Professional Score</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className={`tabular-nums ${getScoreColor(a.mindset_score)}`}>
                                        M:{a.mindset_score ?? "—"}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>Mindset Score</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className={`font-bold tabular-nums ${getScoreColor(a.overall_score)}`}>
                                        {a.overall_score ?? "—"}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>Overall Score</TooltipContent>
                                  </Tooltip>
                                </div>
                                {aVerdict && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className={aVerdict.className}>
                                        {aVerdict.label}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>Round verdict</TooltipContent>
                                  </Tooltip>
                                )}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <a
                                      href={`/report/${a.id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <FileText className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
                                    </a>
                                  </TooltipTrigger>
                                  <TooltipContent>View assessment report</TooltipContent>
                                </Tooltip>
                                {a.cv_file_path && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
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
                                      >
                                        <Paperclip className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
                                      </a>
                                    </TooltipTrigger>
                                    <TooltipContent>Download CV</TooltipContent>
                                  </Tooltip>
                                )}
                                {a.transcript && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Open transcript in a simple modal/alert
                                          const win = window.open("", "_blank", "width=600,height=500");
                                          if (win) {
                                            win.document.write(`<html><head><title>Interview Transcript</title><style>body{font-family:monospace;white-space:pre-wrap;padding:24px;line-height:1.6;color:#333;}</style></head><body>${a.transcript.replace(/</g, "&lt;")}</body></html>`);
                                            win.document.close();
                                          }
                                        }}
                                      >
                                        <Mic className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>View transcript</TooltipContent>
                                  </Tooltip>
                                )}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-muted-foreground text-xs">
                                      {new Date(a.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>Assessment date</TooltipContent>
                                </Tooltip>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Showing {(safePage - 1) * ROWS_PER_PAGE + 1}–{Math.min(safePage * ROWS_PER_PAGE, filtered.length)} of {filtered.length} candidates
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="sketch-border-light h-8 w-8 p-0"
                      disabled={safePage <= 1}
                      onClick={() => setCurrentPage(safePage - 1)}
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === safePage ? "default" : "outline"}
                        size="sm"
                        className={`h-8 w-8 p-0 ${page !== safePage ? "sketch-border-light" : ""}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="sketch-border-light h-8 w-8 p-0"
                      disabled={safePage >= totalPages}
                      onClick={() => setCurrentPage(safePage + 1)}
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Dashboard;
