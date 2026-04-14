import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import HandwrittenLabel from "./HandwrittenLabel";
import { Smile, Meh, Shield } from "lucide-react";

type HonestyLevel = "flattery" | "diplomatic" | "honest";

interface HonestyMeterProps {
  value: HonestyLevel | "";
  onChange: (value: HonestyLevel) => void;
}

const options = [
  {
    value: "flattery" as HonestyLevel,
    label: "Flattery",
    description: "Only positive things, avoided critique",
    icon: Smile,
    bgColor: "bg-reject/10",
    borderColor: "border-reject/30",
    textColor: "text-reject",
    meterPosition: "5%",
  },
  {
    value: "diplomatic" as HonestyLevel,
    label: "Diplomatic",
    description: "Balanced but guarded feedback",
    icon: Meh,
    bgColor: "bg-highlighter/10",
    borderColor: "border-highlighter/30",
    textColor: "text-foreground",
    meterPosition: "50%",
  },
  {
    value: "honest" as HonestyLevel,
    label: "Constructive Critique",
    description: "The Birbal Standard - Truth to power",
    icon: Shield,
    bgColor: "bg-hire/10",
    borderColor: "border-hire/30",
    textColor: "text-hire",
    meterPosition: "95%",
  },
];

const HonestyMeter = ({ value, onChange }: HonestyMeterProps) => {
  const selectedOption = options.find(o => o.value === value);
  const meterPosition = selectedOption?.meterPosition || "50%";

  return (
    <div className="space-y-6">
      {/* Options */}
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as HonestyLevel)}
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          
          return (
            <motion.div
              key={option.value}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Label
                htmlFor={`honesty-${option.value}`}
                className={`flex flex-col items-center gap-2 p-4 cursor-pointer rounded-lg border-2 transition-all duration-200 text-center h-full ${
                  isSelected
                    ? `${option.bgColor} ${option.borderColor} shadow-[2px_2px_0px_0px_hsl(var(--ink))]`
                    : "bg-background border-border/30 hover:border-border"
                }`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={`honesty-${option.value}`}
                  className="sr-only"
                />
                <Icon className={`w-8 h-8 ${isSelected ? option.textColor : "text-muted-foreground"}`} />
                <span className={`font-medium ${isSelected ? option.textColor : ""}`}>
                  {option.label}
                </span>
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              </Label>
            </motion.div>
          );
        })}
      </RadioGroup>

    </div>
  );
};

export default HonestyMeter;
