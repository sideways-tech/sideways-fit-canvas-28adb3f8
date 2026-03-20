import { motion } from "framer-motion";
import { Star, Trash2 } from "lucide-react";
import HandwrittenLabel from "./HandwrittenLabel";

interface ResilienceRatingProps {
  value: number;
  onChange: (value: number) => void;
}

const ResilienceRating = ({ value, onChange }: ResilienceRatingProps) => {
  return (
    <div className="space-y-6">
      {/* Instruction Card */}
      <div className="p-4 bg-highlighter/10 sketch-border-light">
        <div className="flex items-start gap-3">
          <Trash2 className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <p className="text-sm font-medium">
              "The Scrap It" Test
            </p>
            <p className="text-sm text-muted-foreground">Ask them about a time they had to scrap an idea they loved. How did they handle it? Did they fight too hard? Let go too easily? Or did they iterate gracefully? Talk about it.



            </p>
          </div>
        </div>
      </div>

      {/* Star Rating */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <HandwrittenLabel className="text-2xl text-muted-foreground">
            Resilience Score
          </HandwrittenLabel>
          <span className="text-sm text-muted-foreground">
            {value === 0 ? "Not rated" : `${value}/5`}
          </span>
        </div>

        <div className="flex gap-2 justify-center py-4">
          {[1, 2, 3, 4, 5].map((star) =>
          <motion.button
            key={star}
            type="button"
            onClick={() => onChange(star === value ? 0 : star)}
            whileHover={{ scale: 1.15, rotate: star % 2 === 0 ? 5 : -5 }}
            whileTap={{ scale: 0.9 }}
            className="focus:outline-none focus:ring-2 focus:ring-highlighter rounded">
            
              <Star
              className={`w-10 h-10 transition-colors duration-200 ${
              star <= value ?
              "fill-highlighter text-highlighter" :
              "text-muted-foreground/30 hover:text-muted-foreground/50"}`
              } />
            
            </motion.button>
          )}
        </div>

        {/* Rating Description */}
        <div className="text-center text-sm text-muted-foreground min-h-[2.5rem]">
          {value === 0 && "Click stars to rate"}
          {value === 1 && "Got defensive — struggled to separate self from work"}
          {value === 2 && "Took it hard, but eventually found a way forward"}
          {value === 3 && "Handled it professionally — no drama, moved on"}
          {value === 4 && "Embraced the feedback and came back stronger"}
          {value === 5 && "Thrives on iteration — treats every critique as fuel"}
        </div>
      </div>

      {/* Circus Fit Indicator */}
      {value >= 4 &&
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-3 bg-hire/10 rounded-lg text-center sketch-border-light">
        
          <HandwrittenLabel className="text-3xl text-hire">
            Ready for the Circus! 🎪
          </HandwrittenLabel>
        </motion.div>
      }
    </div>);

};

export default ResilienceRating;