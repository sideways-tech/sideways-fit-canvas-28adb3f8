import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import HandwrittenLabel from "./HandwrittenLabel";
import FloatingHint from "./FloatingHint";
import { CheckCircle2, Coffee, HelpCircle, Lightbulb } from "lucide-react";

type DiagnosticLevel = "order-taker" | "clarifier" | "diagnostician";

interface DiagnosticSectionProps {
  value: DiagnosticLevel | "";
  onChange: (value: DiagnosticLevel) => void;
}

const options = [
  {
    value: "order-taker" as DiagnosticLevel,
    label: "Order Taker",
    description: "Asked about timeline/budget only",
    icon: Coffee,
    color: "text-reject",
  },
  {
    value: "clarifier" as DiagnosticLevel,
    label: "Clarifier",
    description: "Asked superficial process questions",
    icon: HelpCircle,
    color: "text-highlighter",
  },
  {
    value: "diagnostician" as DiagnosticLevel,
    label: "Diagnostician",
    description: "Challenged the premise / Asked 'Why'",
    icon: Lightbulb,
    color: "text-hire",
  },
];

const Confetti = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full"
        style={{
          backgroundColor: i % 3 === 0 ? "#FACC15" : i % 3 === 1 ? "#22C55E" : "#000",
          left: `${50 + (Math.random() - 0.5) * 60}%`,
          top: "50%",
        }}
        initial={{ scale: 0, y: 0, opacity: 1 }}
        animate={{
          scale: [0, 1, 1],
          y: [0, -80 - Math.random() * 40],
          x: [(Math.random() - 0.5) * 100],
          opacity: [1, 1, 0],
          rotate: [0, 360 + Math.random() * 360],
        }}
        transition={{
          duration: 0.8,
          delay: i * 0.05,
          ease: "easeOut",
        }}
      />
    ))}
  </div>
);

const DiagnosticSection = ({ value, onChange }: DiagnosticSectionProps) => {
  return (
    <div className="space-y-4 relative">
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as DiagnosticLevel)}
        className="space-y-3"
      >
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          
          return (
            <motion.div
              key={option.value}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Label
                htmlFor={option.value}
                className={`flex items-start gap-4 p-4 cursor-pointer sketch-border-light transition-all duration-200 ${
                  isSelected
                    ? "bg-muted shadow-[2px_2px_0px_0px_hsl(var(--ink))]"
                    : "bg-background hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${option.color}`} />
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <AnimatePresence>
                  {isSelected && option.value === "diagnostician" && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle2 className="w-6 h-6 text-hire" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Label>
            </motion.div>
          );
        })}
      </RadioGroup>

      <AnimatePresence>
        {value === "diagnostician" && <Confetti />}
      </AnimatePresence>
    </div>
  );
};

export default DiagnosticSection;
