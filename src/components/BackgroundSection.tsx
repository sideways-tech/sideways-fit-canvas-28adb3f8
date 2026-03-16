import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BackgroundSectionProps {
  backgroundNotes: string;
  onBackgroundNotesChange: (value: string) => void;
}

const BackgroundSection = ({
  backgroundNotes,
  onBackgroundNotesChange,
}: BackgroundSectionProps) => {
  return (
    <div className="space-y-2">
      <Label>The human behind the résumé — their roots, education, family, city and what their Sundays look like.</Label>
      <Textarea
        placeholder="Capture their story — background, upbringing, education, family, where they live, weekend routines, interests..."
        value={backgroundNotes}
        onChange={(e) => onBackgroundNotesChange(e.target.value)}
        className="sketch-border-light bg-background min-h-[120px]"
      />
    </div>
  );
};

export default BackgroundSection;
