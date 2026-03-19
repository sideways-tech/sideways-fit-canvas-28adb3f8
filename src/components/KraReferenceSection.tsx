import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import HandwrittenLabel from "./HandwrittenLabel";
import SketchCard from "./SketchCard";

interface KraReferenceSectionProps {
  department: string;
  hiringLevel: string;
}

const DISCIPLINE_MAP: Record<string, string> = {
  servicing: "Client Servicing",
  strategy: "Strategy",
  creative: "Creative",
  copy: "Copy",
  "tech-ux": "Tech / UX",
  "product-design": "Product Design",
};

interface KraGroup {
  kra_number: number;
  kra_name: string;
  sub_kras: { sub_kra_name: string; description: string | null }[];
}

const KRA_QUERY_TIMEOUT_MS = 8000;

const KraReferenceSection = ({ department, hiringLevel }: KraReferenceSectionProps) => {
  const discipline = DISCIPLINE_MAP[department] || department;
  const [expandedKras, setExpandedKras] = useState<Set<number>>(new Set());

  const { data: kraData, isLoading, isError, error } = useQuery({
    queryKey: ["kra-definitions", discipline, hiringLevel],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = globalThis.setTimeout(() => controller.abort(), KRA_QUERY_TIMEOUT_MS);

      try {
        const { data, error } = await supabase
          .from("kra_definitions")
          .select("kra_number, kra_name, sub_kra_name, description")
          .eq("discipline", discipline)
          .eq("level", hiringLevel)
          .order("kra_number")
          .abortSignal(controller.signal);

        if (error) throw error;
        return data ?? [];
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          throw new Error("KRA lookup timed out");
        }
        throw err;
      } finally {
        globalThis.clearTimeout(timeoutId);
      }
    },
    enabled: !!department && !!hiringLevel,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  if (!department || !hiringLevel) {
    return (
      <SketchCard className="mb-8" delay={0.12}>
        <div className="flex items-center gap-3 text-muted-foreground py-6 justify-center">
          <BookOpen className="w-5 h-5" />
          <p className="text-sm italic">Select a department and hiring level above to see KRA expectations</p>
        </div>
      </SketchCard>
    );
  }

  // Group by KRA
  const kraGroups: KraGroup[] = [];
  if (kraData) {
    const groupMap = new Map<number, KraGroup>();
    for (const row of kraData) {
      if (!groupMap.has(row.kra_number)) {
        groupMap.set(row.kra_number, {
          kra_number: row.kra_number,
          kra_name: row.kra_name,
          sub_kras: [],
        });
      }
      groupMap.get(row.kra_number)!.sub_kras.push({
        sub_kra_name: row.sub_kra_name,
        description: row.description,
      });
    }
    kraGroups.push(...groupMap.values());
  }

  const toggleKra = (num: number) => {
    setExpandedKras((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedKras(new Set(kraGroups.map((g) => g.kra_number)));
  };

  const collapseAll = () => {
    setExpandedKras(new Set());
  };

  if (isLoading) {
    return (
      <SketchCard className="mb-8" delay={0.12}>
        <div className="space-y-3 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </SketchCard>
    );
  }

  if (isError) {
    const message = error instanceof Error && error.message === "KRA lookup timed out"
      ? `KRA data took too long to load for ${discipline} at ${hiringLevel}. This usually means the backend query is stuck, not that data exists.`
      : `Could not load KRA data for ${discipline} at ${hiringLevel}.`;

    return (
      <SketchCard className="mb-8" delay={0.12}>
        <div className="flex items-center gap-3 text-destructive py-6 justify-center">
          <BookOpen className="w-5 h-5" />
          <p className="text-sm italic">{message}</p>
        </div>
      </SketchCard>
    );
  }

  if (kraGroups.length === 0) {
    return (
      <SketchCard className="mb-8" delay={0.12}>
        <div className="flex items-center gap-3 text-muted-foreground py-6 justify-center">
          <BookOpen className="w-5 h-5" />
          <p className="text-sm italic">
            No KRA data available for {discipline} at {hiringLevel}. Upload via the admin page.
          </p>
        </div>
      </SketchCard>
    );
  }

  return (
    <SketchCard className="mb-8" delay={0.12}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <HandwrittenLabel as="h3" className="text-4xl">
              KRA Reference
            </HandwrittenLabel>
            <p className="text-sm text-muted-foreground">
              Expected KRAs for <span className="font-semibold text-foreground">{discipline}</span> at{" "}
              <span className="font-semibold text-foreground">{hiringLevel}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Expand all
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              onClick={collapseAll}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Collapse
            </button>
          </div>
        </div>

        <div className="space-y-1">
          {kraGroups.map((group) => {
            const isExpanded = expandedKras.has(group.kra_number);
            return (
              <div key={group.kra_number} className="border border-border/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleKra(group.kra_number)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-xs font-mono text-muted-foreground w-6">
                    {group.kra_number}.
                  </span>
                  <span className="text-sm font-medium">{group.kra_name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {group.sub_kras.length} sub-KRAs
                  </span>
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 pt-3 space-y-0 border-t border-border/30">
                        {group.sub_kras.map((sub, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "grid grid-cols-[160px_1fr] gap-4 py-3",
                              idx !== group.sub_kras.length - 1 && "border-b border-border/15"
                            )}
                          >
                            <div className="flex items-start">
                              <span className="inline-block text-xs font-semibold tracking-wide uppercase text-accent-foreground bg-accent/20 px-2 py-1 rounded-sm leading-tight">
                                {sub.sub_kra_name}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/85 leading-relaxed">
                              {sub.description || (
                                <span className="italic text-muted-foreground text-xs">
                                  Not applicable at this level
                                </span>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </SketchCard>
  );
};

export default KraReferenceSection;
