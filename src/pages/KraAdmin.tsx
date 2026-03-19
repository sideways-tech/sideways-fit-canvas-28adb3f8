import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Trash2, FileSpreadsheet, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import HandwrittenLabel from "@/components/HandwrittenLabel";
import SketchCard from "@/components/SketchCard";
import sidewaysLogo from "@/assets/sideways-logo.png";

const DISCIPLINES = [
  { value: "strategy", label: "Strategy" },
  { value: "creative", label: "Creative" },
  { value: "copy", label: "Copy" },
  { value: "tech-ux", label: "Tech / UX" },
  { value: "product-design", label: "Product Design" },
  { value: "servicing", label: "Servicing" },
];

const KraAdmin = () => {
  const [selectedDiscipline, setSelectedDiscipline] = useState("");
  const [customDiscipline, setCustomDiscipline] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const discipline = showCustom ? customDiscipline.trim().toLowerCase() : selectedDiscipline;

  // Fetch all disciplines that have KRA data
  const { data: existingDisciplines, isLoading: loadingDisciplines } = useQuery({
    queryKey: ["kra-disciplines"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("kra_definitions")
        .select("discipline")
        .order("discipline");

      if (error) throw error;
      const unique = [...new Set((data || []).map((d: { discipline: string }) => d.discipline))];
      return unique;
    },
  });

  // Fetch KRA summary for selected discipline
  const { data: kraSummary } = useQuery({
    queryKey: ["kra-summary", discipline],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("kra_definitions")
        .select("kra_name, kra_order, level")
        .eq("discipline", discipline)
        .order("kra_order", { ascending: true });

      if (error) throw error;

      // Group unique KRAs and count levels
      const kraMap = new Map<string, { order: number; levels: Set<string> }>();
      for (const row of data || []) {
        if (!kraMap.has(row.kra_name)) {
          kraMap.set(row.kra_name, { order: row.kra_order, levels: new Set() });
        }
        kraMap.get(row.kra_name)!.levels.add(row.level);
      }

      return Array.from(kraMap.entries()).map(([name, info]) => ({
        name,
        order: info.order,
        levels: Array.from(info.levels).sort(),
      }));
    },
    enabled: !!discipline,
  });

  const handleUpload = async () => {
    if (!file || !discipline) {
      toast({ title: "Missing info", description: "Select a discipline and upload a file.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("discipline", discipline);

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/parse-kra-excel`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey },
          body: formData,
        }
      );

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Upload failed");

      toast({
        title: "✅ KRA Data Uploaded",
        description: `${result.records_inserted} records for "${discipline}" (${result.kra_count} KRAs).`,
      });

      setFile(null);
      queryClient.invalidateQueries({ queryKey: ["kra-disciplines"] });
      queryClient.invalidateQueries({ queryKey: ["kra-summary", discipline] });
      queryClient.invalidateQueries({ queryKey: ["kra-definitions"] });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (disc: string) => {
    if (!confirm(`Delete all KRA data for "${disc}"?`)) return;

    try {
      const { error } = await supabase.from("kra_definitions").delete().eq("discipline", disc);
      if (error) throw error;

      toast({ title: "Deleted", description: `KRA data for "${disc}" removed.` });
      queryClient.invalidateQueries({ queryKey: ["kra-disciplines"] });
      queryClient.invalidateQueries({ queryKey: ["kra-summary"] });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background paper-texture">
      <div className="container max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={sidewaysLogo} alt="Sideways" className="h-12" />
              <div>
                <HandwrittenLabel as="h1" className="text-5xl">KRA Admin</HandwrittenLabel>
                <p className="text-sm text-muted-foreground">Upload & manage KRA definitions per discipline</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline" className="sketch-border-light gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
        </motion.header>

        {/* Upload Section */}
        <SketchCard className="mb-8" delay={0.1}>
          <div className="space-y-4">
            <HandwrittenLabel as="h3" className="text-3xl">Upload KRA Excel</HandwrittenLabel>
            <p className="text-xs text-muted-foreground">
              Excel must have columns: KRA, Sub-KRA, L1, L2, L3, L4, L5, L6 (and optionally L7) in the first sheet.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Discipline</Label>
                {showCustom ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. media-buying"
                      value={customDiscipline}
                      onChange={(e) => setCustomDiscipline(e.target.value)}
                      className="sketch-border-light bg-background"
                    />
                    <Button variant="ghost" size="sm" onClick={() => setShowCustom(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Select value={selectedDiscipline} onValueChange={setSelectedDiscipline}>
                      <SelectTrigger className="sketch-border-light bg-background">
                        <SelectValue placeholder="Select discipline…" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISCIPLINES.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => setShowCustom(true)} title="Add custom">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Excel File</Label>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="sketch-border-light bg-background"
                />
              </div>
            </div>

            <Button
              variant="circus"
              onClick={handleUpload}
              disabled={uploading || !discipline || !file}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploading ? "Uploading…" : "Upload & Replace"}
            </Button>
          </div>
        </SketchCard>

        {/* Existing Disciplines */}
        <SketchCard className="mb-8" delay={0.15}>
          <div className="space-y-4">
            <HandwrittenLabel as="h3" className="text-3xl">Uploaded Disciplines</HandwrittenLabel>

            {loadingDisciplines ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : !existingDisciplines?.length ? (
              <p className="text-sm text-muted-foreground">No KRA data uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {existingDisciplines.map((disc) => (
                  <div
                    key={disc}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-sm"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium capitalize">{disc.replace(/-/g, " / ")}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(disc)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SketchCard>

        {/* KRA Preview for selected discipline */}
        {discipline && kraSummary && kraSummary.length > 0 && (
          <SketchCard className="mb-8" delay={0.2}>
            <div className="space-y-3">
              <HandwrittenLabel as="h3" className="text-3xl">
                KRAs for "{discipline.replace(/-/g, " / ")}"
              </HandwrittenLabel>
              <div className="space-y-1">
                {kraSummary.map((kra, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm p-2 bg-muted/20 rounded-sm">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-ink/10 text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 font-medium">{kra.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {kra.levels.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SketchCard>
        )}
      </div>
    </div>
  );
};

export default KraAdmin;
