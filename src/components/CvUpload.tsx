import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CvUploadProps {
  candidateName: string;
  onUploadComplete: (filePath: string) => void;
  currentFilePath?: string;
}

const CvUpload = ({ candidateName, onUploadComplete, currentFilePath }: CvUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayName = fileName || currentFilePath?.split("/").pop();
  const hasFile = !!displayName;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a PDF or Word document.", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const safeName = candidateName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() || "candidate";
    const filePath = `${safeName}/${Date.now()}_${file.name}`;

    const { error } = await supabase.storage.from("cvs").upload(filePath, file);

    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      setFileName(file.name);
      onUploadComplete(filePath);
      toast({ title: "CV Uploaded", description: `${file.name} uploaded successfully.` });
    }
    setUploading(false);
  };

  const handleRemove = () => {
    setFileName(null);
    onUploadComplete("");
    if (inputRef.current) inputRef.current.value = "";
    toast({ title: "CV Removed", description: "You can now upload a new file." });
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Upload CV</Label>

      {hasFile ? (
        <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-3 py-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-sm">{displayName}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 shrink-0 p-0 text-muted-foreground hover:text-destructive"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center gap-2 border-dashed"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Choose File"}
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleUpload}
      />
      <p className="text-xs text-muted-foreground">PDF or Word, max 10MB</p>
    </div>
  );
};

export default CvUpload;
