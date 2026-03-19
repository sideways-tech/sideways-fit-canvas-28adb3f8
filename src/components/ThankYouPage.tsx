import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LayoutDashboard, CheckCircle, Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import sidewaysLogo from "@/assets/sideways-logo.png";

interface ThankYouPageProps {
  candidateName: string;
  roundNumber: string;
  verdict: string;
  interviewerEmail: string;
  overallScore: number;
  onStartNew: () => void;
}

const verdictDisplay: Record<string, { label: string; emoji: string }> = {
  "strong-no": { label: "Strong No", emoji: "🔴" },
  "lean-no": { label: "Lean No", emoji: "🟠" },
  "lean-yes": { label: "Lean Yes", emoji: "🟢" },
  "strong-yes": { label: "Strong Yes", emoji: "✨" },
};

const ThankYouPage = ({
  candidateName,
  roundNumber,
  verdict,
  interviewerEmail,
  overallScore,
  onStartNew,
}: ThankYouPageProps) => {
  const v = verdictDisplay[verdict] || verdictDisplay["lean-no"];

  return (
    <div className="min-h-screen bg-background paper-texture flex items-center justify-center">
      <div className="container max-w-lg px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center space-y-8"
        >
          {/* Logo */}
          <motion.img
            src={sidewaysLogo}
            alt="Sideways"
            className="h-16 mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          />

          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
          >
            <CheckCircle className="w-20 h-20 mx-auto text-hire" strokeWidth={1.5} />
          </motion.div>

          {/* Main Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <h1 className="text-3xl font-bold text-foreground">Assessment Complete</h1>
            <p className="text-muted-foreground text-lg">
              {candidateName}'s Round {roundNumber} evaluation has been saved.
            </p>
          </motion.div>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-lg sketch-border bg-card p-6 space-y-4 text-left shadow-[4px_4px_0px_0px_hsl(var(--ink))]"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Candidate</span>
              <span className="font-semibold">{candidateName}</span>
            </div>
            <div className="border-t border-border" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Round</span>
              <span className="font-semibold">{roundNumber}</span>
            </div>
            <div className="border-t border-border" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Verdict</span>
              <span className="font-semibold">
                {v.emoji} {v.label}
              </span>
            </div>
            <div className="border-t border-border" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Overall Score</span>
              <span className="font-bold text-xl tabular-nums">{overallScore}</span>
            </div>
          </motion.div>

          {/* Email confirmation */}
          {interviewerEmail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg py-3 px-4"
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span>
                A detailed report has been sent to{" "}
                <span className="font-medium text-foreground">{interviewerEmail}</span>
              </span>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-3 pt-2"
          >
            <Button
              onClick={onStartNew}
              variant="outline"
              className="flex-1 sketch-border-light gap-2 h-12"
            >
              <RotateCcw className="w-4 h-4" />
              New Assessment
            </Button>
            <Link to="/dashboard" className="flex-1">
              <Button className="w-full gap-2 h-12 bg-ink text-background hover:bg-ink/90">
                <LayoutDashboard className="w-4 h-4" />
                View Dashboard
              </Button>
            </Link>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-xs text-muted-foreground/60 pt-4"
          >
            Sideways · Creative Problem Solving Outfit
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default ThankYouPage;
