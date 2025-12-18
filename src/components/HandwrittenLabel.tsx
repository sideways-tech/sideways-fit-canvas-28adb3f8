import { cn } from "@/lib/utils";

interface HandwrittenLabelProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "span" | "p";
  highlight?: boolean;
}

const HandwrittenLabel = ({
  children,
  className,
  as: Component = "span",
  highlight = false,
}: HandwrittenLabelProps) => {
  return (
    <Component
      className={cn(
        "font-handwritten tracking-wide",
        highlight && "highlight-yellow",
        className
      )}
    >
      {children}
    </Component>
  );
};

export default HandwrittenLabel;
