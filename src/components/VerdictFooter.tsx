import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import HandwrittenLabel from "./HandwrittenLabel";
import { Archive, Sparkles, AlertTriangle, Award, UserX } from "lucide-react";

type Archetype = "vendor" | "birbal" | "work-in-progress";

interface VerdictFooterProps {
  archetype: Archetype;
  onArchive: () => void;
  onInvite: () => void;
}

const archetypeConfig = {
  vendor: {
    label: "The Vendor",
    sublabel: "Not a culture fit",
    icon: UserX,
    bgColor: "bg-reject/10",
    textColor: "text-reject",
    description: "Order-taker mentality or lacks honest feedback capacity. May be a great vendor, but not a Sideways team member.",
  },
  "work-in-progress": {
    label: "Work in Progress",
    sublabel: "Potential, but needs more signal",
    icon: AlertTriangle,
    bgColor: "bg-highlighter/10",
    textColor: "text-foreground",
    description: "Shows some T-shaped qualities but missing key elements. Consider a follow-up conversation.",
  },
  birbal: {
    label: "The Birbal",
    sublabel: "Trusted Advisor Material",
    icon: Award,
    bgColor: "bg-hire/10",
    textColor: "text-hire",
    description: "Diagnostic mindset, T-shaped curiosity, and speaks truth to power. Ready for the Circus!",
  },
};

const VerdictFooter = ({ archetype, onArchive, onInvite }: VerdictFooterProps) => {
  const config = archetypeConfig[archetype];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-6"
    >
      {/* Archetype Card */}
      <div className={`p-6 rounded-lg sketch-border ${config.bgColor}`}>
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
          >
            <Icon className={`w-12 h-12 ${config.textColor}`} />
          </motion.div>
          <div className="flex-1 space-y-2">
            <div>
              <HandwrittenLabel className={`text-5xl ${config.textColor}`}>
                {config.label}
              </HandwrittenLabel>
              <p className="text-sm text-muted-foreground">{config.sublabel}</p>
            </div>
            <p className="text-sm">{config.description}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={onArchive}
          className="flex-1 sketch-border-light gap-2 h-12"
        >
          <Archive className="w-4 h-4" />
          Send to Archive
        </Button>
        <Button
          onClick={onInvite}
          disabled={archetype === "vendor"}
          className={`flex-1 h-12 gap-2 sketch-border ${
            archetype === "birbal"
              ? "bg-ink text-highlighter hover:bg-ink/90"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Invite to the Circus
        </Button>
      </div>
    </motion.div>
  );
};

export default VerdictFooter;
