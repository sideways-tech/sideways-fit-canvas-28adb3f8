import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import HandwrittenLabel from "./HandwrittenLabel";
import { Palette, Sparkles } from "lucide-react";

interface AestheticsSectionProps {
  interest: number;
  processNote: string;
  onInterestChange: (value: number) => void;
  onProcessNoteChange: (note: string) => void;
}

const AestheticsSection = ({
  interest,
  processNote,
  onInterestChange,
  onProcessNoteChange,
}: AestheticsSectionProps) => {
  return (
    <div className="space-y-6 p-4 bg-muted/20 rounded-lg sketch-border-light">
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-highlighter" />
        <Label className="text-sm font-medium">
          Interest in Art, Aesthetics & Design
        </Label>
      </div>

      {/* Interest Level */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <HandwrittenLabel className="text-2xl text-muted-foreground">
            Aesthetic sensibility
          </HandwrittenLabel>
          <span className="text-sm font-medium tabular-nums">{interest}%</span>
        </div>
        
        <Slider
          value={[interest]}
          onValueChange={([value]) => onInterestChange(value)}
          max={100}
          step={5}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>"I don't really think about design"</span>
          <span>"Beauty matters deeply to me"</span>
        </div>
      </div>

      {/* Visual indicator */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg sketch-border-light">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0.3 }}
              animate={{
                scale: interest > i * 20 ? 1 : 0.8,
                opacity: interest > i * 20 ? 1 : 0.3,
              }}
              transition={{ delay: i * 0.05 }}
            >
              <Palette
                className={`w-6 h-6 ${
                  interest > i * 20 ? "text-highlighter" : "text-muted-foreground/30"
                }`}
              />
            </motion.div>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {interest >= 80
            ? "Design sensibility detected!"
            : interest >= 50
            ? "Appreciates good design"
            : "Utilitarian mindset"}
        </span>
      </div>

      {/* Process of Creation */}
      <div className="space-y-3">
        <Label htmlFor="process-note" className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-highlighter" />
          Process of Design / Creation.
        </Label>
        <p className="text-xs text-muted-foreground">
          Did they show curiosity about how things are designed or cerated? Note any examples shared.
        </p>
        <Textarea
          id="process-note"
          placeholder="E.g., Asked about our design process, mentioned enjoying craftsmanship, shared a creative hobby..."
          value={processNote}
          onChange={(e) => onProcessNoteChange(e.target.value)}
          className="sketch-border-light bg-background min-h-[80px] resize-none"
        />
      </div>

      {/* Creative indicator */}
      {interest >= 60 && processNote.length > 20 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 p-3 bg-highlighter/10 rounded-lg sketch-border-light"
        >
          <Palette className="w-5 h-5 text-highlighter" />
          <HandwrittenLabel className="text-3xl text-foreground">
            Creative Soul Detected!
          </HandwrittenLabel>
        </motion.div>
      )}
    </div>
  );
};

export default AestheticsSection;
