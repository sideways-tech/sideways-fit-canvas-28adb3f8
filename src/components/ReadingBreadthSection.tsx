import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import HandwrittenLabel from "./HandwrittenLabel";
import { BookOpen, Users, Globe, TrendingUp, Lightbulb } from "lucide-react";

interface ReadingBreadthSectionProps {
  interestedInOthers: number;
  readsWidely: number;
  recentReadExample: string;
  underestimatedTrend: string;
  ideaSharedOften: string;
  onInterestedInOthersChange: (value: number) => void;
  onReadsWidelyChange: (value: number) => void;
  onRecentReadExampleChange: (value: string) => void;
  onUnderestimatedTrendChange: (value: string) => void;
  onIdeaSharedOftenChange: (value: string) => void;
}

const ReadingBreadthSection = ({
  interestedInOthers,
  readsWidely,
  recentReadExample,
  underestimatedTrend,
  ideaSharedOften,
  onInterestedInOthersChange,
  onReadsWidelyChange,
  onRecentReadExampleChange,
  onUnderestimatedTrendChange,
  onIdeaSharedOftenChange
}: ReadingBreadthSectionProps) => {
  const breadthScore = Math.round((interestedInOthers + readsWidely) / 2);

  return (
    <div className="space-y-6">
      {/* 1. Interested in Other People's Lives */}
      <div className="space-y-4 p-4 bg-muted/20 rounded-lg sketch-border-light">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-highlighter" />
          <Label className="text-sm font-medium">
            1. Interested in Other People's Lives
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Not living in a bubble — genuinely curious about others
        </p>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <HandwrittenLabel className="text-xl text-muted-foreground">
              Curiosity about others
            </HandwrittenLabel>
            <span className="text-sm font-medium tabular-nums">{interestedInOthers}%</span>
          </div>
          <Slider
            value={[interestedInOthers]}
            onValueChange={([value]) => onInterestedInOthersChange(value)}
            max={100}
            step={5}
            className="w-full" />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Self-focused</span>
            <span>Asks about everyone's story</span>
          </div>
        </div>
      </div>

      {/* 2. Reads Widely */}
      <div className="space-y-4 p-4 bg-muted/20 rounded-lg sketch-border-light">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-highlighter" />
          <Label className="text-sm font-medium">
            2. Reads Widely (Beyond Their Domain)
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Non-work reading — diverse intellectual diet
        </p>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <HandwrittenLabel className="text-xl text-muted-foreground">
              Reading breadth
            </HandwrittenLabel>
            <span className="text-sm font-medium tabular-nums">{readsWidely}%</span>
          </div>
          <Slider
            value={[readsWidely]}
            onValueChange={([value]) => onReadsWidelyChange(value)}
            max={100}
            step={5}
            className="w-full" />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Reads only work stuff</span>
            <span>Voracious & varied reader</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Label htmlFor="recent-read" className="text-xs text-muted-foreground">
            Recent non-work read mentioned?
          </Label>
          <Input
            id="recent-read"
            placeholder="E.g., 'Sapiens', a poetry collection, science magazine..."
            value={recentReadExample}
            onChange={(e) => onRecentReadExampleChange(e.target.value)}
            className="sketch-border-light bg-background text-sm" />
        </div>
      </div>

      {/* 3. Underestimated Trend */}
      <div className="space-y-4 p-4 bg-muted/20 rounded-lg sketch-border-light">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-highlighter" />
          <Label className="text-sm font-medium">
            3. What's a trend or shift happening in the world right now that you think most people are underestimating?
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Look for signals: do they notice patterns others miss? Can they connect dots between fields?
        </p>
        <Textarea
          id="underestimated-trend"
          placeholder="Capture their response and your observations here..."
          value={underestimatedTrend}
          onChange={(e) => onUnderestimatedTrendChange(e.target.value)}
          className="sketch-border-light bg-background text-sm min-h-[100px]"
        />
      </div>

      {/* 4. Idea Shared Often */}
      <div className="space-y-4 p-4 bg-muted/20 rounded-lg sketch-border-light">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-highlighter" />
          <Label className="text-sm font-medium">
            4. What's an idea or concept you've come across recently that you've found yourself sharing with others or thinking about often?
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Look for intellectual curiosity: do they chase interesting ideas down rabbit holes? Are they a carrier of new thinking?
        </p>
        <Textarea
          id="idea-shared"
          placeholder="Capture their response and your observations here..."
          value={ideaSharedOften}
          onChange={(e) => onIdeaSharedOftenChange(e.target.value)}
          className="sketch-border-light bg-background text-sm min-h-[100px]"
        />
      </div>

      {/* Combined Breadth Score */}
      <div className="flex items-center justify-between p-3 bg-highlighter/10 rounded-lg sketch-border-light">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-highlighter" />
          <span className="text-sm font-medium">Societal Awareness & Intellectual Habits Score

          </span>
        </div>
        <HandwrittenLabel className={`text-3xl ${breadthScore >= 70 ?
        "text-hire" :
        breadthScore >= 40 ?
        "text-highlighter" :
        "text-muted-foreground"}`
        }>
          
          {breadthScore}%
        </HandwrittenLabel>
      </div>
    </div>);

};

export default ReadingBreadthSection;