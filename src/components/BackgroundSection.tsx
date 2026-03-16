import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BackgroundSectionProps {
  grewUp: string;
  education: string;
  family: string;
  currentCity: string;
  weekendActivities: string;
  onGrewUpChange: (value: string) => void;
  onEducationChange: (value: string) => void;
  onFamilyChange: (value: string) => void;
  onCurrentCityChange: (value: string) => void;
  onWeekendActivitiesChange: (value: string) => void;
}

const BackgroundSection = ({
  grewUp,
  education,
  family,
  currentCity,
  weekendActivities,
  onGrewUpChange,
  onEducationChange,
  onFamilyChange,
  onCurrentCityChange,
  onWeekendActivitiesChange,
}: BackgroundSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Where they grew up</Label>
          <Input
            placeholder="City, town, or region..."
            value={grewUp}
            onChange={(e) => onGrewUpChange(e.target.value)}
            className="sketch-border-light bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label>Current city</Label>
          <Input
            placeholder="Where they live now..."
            value={currentCity}
            onChange={(e) => onCurrentCityChange(e.target.value)}
            className="sketch-border-light bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label>Education</Label>
          <Input
            placeholder="Degree, institution, field of study..."
            value={education}
            onChange={(e) => onEducationChange(e.target.value)}
            className="sketch-border-light bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label>Family</Label>
          <Input
            placeholder="Brief family context..."
            value={family}
            onChange={(e) => onFamilyChange(e.target.value)}
            className="sketch-border-light bg-background"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>What they do on weekends</Label>
        <Textarea
          placeholder="Hobbies, routines, interests outside work..."
          value={weekendActivities}
          onChange={(e) => onWeekendActivitiesChange(e.target.value)}
          className="sketch-border-light bg-background min-h-[80px]"
        />
      </div>
    </div>
  );
};

export default BackgroundSection;
