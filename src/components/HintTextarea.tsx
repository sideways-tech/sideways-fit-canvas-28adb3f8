import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import FloatingHint from "./FloatingHint";
import { cn } from "@/lib/utils";

interface HintTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hint: string;
  hintPosition?: "right" | "top";
}

const HintTextarea = ({ hint, hintPosition = "left", className, ...props }: HintTextareaProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasContent, setHasContent] = useState(!!props.value);

  const showHint = isFocused && hasContent;

  return (
    <div className="relative">
      <Textarea
        {...props}
        className={cn(className)}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        onChange={(e) => {
          setHasContent(e.target.value.length > 0);
          props.onChange?.(e);
        }}
      />
      <FloatingHint hint={hint} isActive={showHint} position={hintPosition} />
    </div>
  );
};

export default HintTextarea;
