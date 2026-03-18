import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X } from "lucide-react";
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

  return (
    <div className="space-y-2 text-right">
      <Label>Upload CV</Label>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="sketch-border-light gap-2"
          disabled={uploading}
          onClick={() => document.getElementById("cv-upload-input")?.click()}
        >
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading..." : "Choose File"}
        </Button>
        {(fileName || currentFilePath) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>{fileName || currentFilePath?.split("/").pop()}</span>
          </div>
        )}
      </div>
      <input
        id="cv-upload-input"
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
