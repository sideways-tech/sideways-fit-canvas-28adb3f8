import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import HandwrittenLabel from "./HandwrittenLabel";
import HintTextarea from "./HintTextarea";
import { Palette, Sparkles } from "lucide-react";
import { getDisciplineConfig } from "@/lib/disciplineConfig";

interface AestheticsSectionProps {
  interest: number;
  processNote: string;
  department?: string;
  onInterestChange: (value: number) => void;
  onProcessNoteChange: (note: string) => void;
}

const AestheticsSection = ({
  interest,
  processNote,
  department,
  onInterestChange,
  onProcessNoteChange,
}: AestheticsSectionProps) => {
  const config = getDisciplineConfig(department);

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
            {config.aestheticsSensibility.sliderLabel}
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
          <span>{config.aestheticsSensibility.low}</span>
          <span>{config.aestheticsSensibility.high}</span>
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
            ? config.aestheticsSensibility.tiers.high
            : interest >= 50
            ? config.aestheticsSensibility.tiers.mid
            : config.aestheticsSensibility.tiers.low}
        </span>
      </div>

      {/* Process of Creation */}
      <div className="space-y-3">
        <Label htmlFor="process-note" className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-highlighter" />
          {config.aestheticsProcess.title}
        </Label>
        <HintTextarea
          id="process-note"
          hint={config.aestheticsProcess.hint}
          placeholder={config.aestheticsProcess.placeholder}
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
