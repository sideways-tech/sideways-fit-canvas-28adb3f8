import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Trash2, FileSpreadsheet, CheckCircle } from "lucide-react";
import HandwrittenLabel from "@/components/HandwrittenLabel";
import sidewaysLogo from "@/assets/sideways-logo.png";

const DISCIPLINES = [
  "Client Servicing",
  "Strategy",
  "Creative",
  "Copy",
  "Tech / UX",
  "Product Design",
];

const KraAdmin = () => {
  const [selectedDiscipline, setSelectedDiscipline] = useState("");
  const [customDiscipline, setCustomDiscipline] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: existingDisciplines, refetch } = useQuery({
    queryKey: ["kra-disciplines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kra_definitions")
        .select("discipline")
        .order("discipline");
      if (error) throw error;
      const unique = [...new Set(data.map((d) => d.discipline))];
      return unique;
    },
  });

  const discipline = selectedDiscipline === "__custom" ? customDiscipline.trim() : selectedDiscipline;

  const handleUpload = async () => {
    if (!file || !discipline) {
      toast({ title: "Missing fields", description: "Please select a discipline and file", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("discipline", discipline);

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/ingest-kra-excel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      toast({
        title: "KRA data ingested!",
        description: `${result.kras_found} KRAs, ${result.rows_inserted} rows for ${discipline} (sheet: ${result.sheet})`,
      });

      setFile(null);
      setSelectedDiscipline("");
      setCustomDiscipline("");
      refetch();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (disc: string) => {
    const { error } = await supabase.from("kra_definitions").delete().eq("discipline", disc);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: `Removed all KRA data for ${disc}` });
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <img src={sidewaysLogo} alt="Sideways" className="h-6 opacity-80" />
          </div>
        </div>

        <HandwrittenLabel as="h1" className="text-5xl mb-2">
          KRA Admin
        </HandwrittenLabel>
        <p className="text-muted-foreground mb-8">
          Upload discipline KRA Excel files to populate interview reference data.
        </p>

        {/* Upload Section */}
        <div className="border border-border rounded-xl p-6 mb-8 space-y-4 bg-card">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload KRA Excel
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Discipline</Label>
              <Select value={selectedDiscipline} onValueChange={setSelectedDiscipline}>
                <SelectTrigger>
                  <SelectValue placeholder="Select discipline..." />
                </SelectTrigger>
                <SelectContent>
                  {DISCIPLINES.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                  <SelectItem value="__custom">+ Add new discipline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedDiscipline === "__custom" && (
              <div className="space-y-1.5">
                <Label>Custom Discipline Name</Label>
                <Input
                  placeholder="e.g. Motion Design"
                  value={customDiscipline}
                  onChange={(e) => setCustomDiscipline(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Excel File</Label>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Must have a "Ratings" sheet with columns: KRA, Sub-KRA, L1–L6
              </p>
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={isUploading || !file || !discipline}
            className="w-full sm:w-auto"
          >
            {isUploading ? "Processing..." : "Upload & Ingest"}
          </Button>
        </div>

        {/* Existing Disciplines */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" /> Loaded Disciplines
          </h2>

          {existingDisciplines && existingDisciplines.length > 0 ? (
            <div className="space-y-2">
              {existingDisciplines.map((disc) => (
                <div
                  key={disc}
                  className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-sm">{disc}</span>
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
          ) : (
            <p className="text-sm text-muted-foreground italic">No discipline KRAs loaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KraAdmin;
