import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, ChevronRight } from "lucide-react";
import HandwrittenLabel from "./HandwrittenLabel";
import { getStoredKraDefinitions, type KraDefinition, withTimeout } from "@/lib/kraLocalStore";

interface KraReferenceBlockProps {
  department: string;
  hiringLevel: string;
}

interface GroupedKra {
  kra_name: string;
  kra_order: number;
  subKras: { sub_kra_name: string; sub_kra_order: number; description: string }[];
}

const disciplineAliases: Record<string, string[]> = {
  strategy: ["strategy", "brand strategy", "strategic planning"],
  creative: ["creative"],
  copy: ["copy", "copywriting"],
  "tech-ux": ["tech-ux", "tech / ux", "tech/ux", "ux", "technology", "tech"],
  "product-design": ["product-design", "product design", "design"],
  servicing: ["servicing", "client servicing", "account management"],
};

const normalizeText = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const matchesDiscipline = (rowDiscipline: string, selectedDepartment: string) => {
  const normalizedRow = normalizeText(rowDiscipline);
  const aliases = disciplineAliases[selectedDepartment] || [selectedDepartment];
  return aliases.some((alias) => normalizedRow === normalizeText(alias));
};

const KraReferenceBlock = ({ department, hiringLevel }: KraReferenceBlockProps) => {
  const { data: allRows, isPending } = useQuery({
    queryKey: ["kra-definitions", department, hiringLevel],
    queryFn: async () => {
      try {
        const { data, error } = (await withTimeout(
          (supabase as any)
            .from("kra_definitions")
            .select("*")
            .eq("level", hiringLevel)
            .order("kra_order", { ascending: true })
            .order("sub_kra_order", { ascending: true }),
          4000,
          "Backend unavailable"
        )) as { data: KraDefinition[] | null; error: any };

        if (error) throw error;
        return (data || []) as KraDefinition[];
      } catch {
        return getStoredKraDefinitions().filter((row) => row.level === hiringLevel);
      }
    },
    enabled: !!department && !!hiringLevel,
    retry: 0,
    staleTime: 5 * 60 * 1000,
  });

  if (!department || !hiringLevel) return null;
  if (isPending) {
    return (
      <div className="mb-8 rounded-sm border border-border bg-card px-6 py-5">
        <p className="text-sm text-muted-foreground">Loading KRAs…</p>
      </div>
    );
  }

  const matchingDisciplineRows = (allRows || []).filter((row) => matchesDiscipline(row.discipline, department));
  const sidewaysRows = (allRows || []).filter((row) => normalizeText(row.discipline) === normalizeText("_sideways_person"));
  const combinedRows = [...matchingDisciplineRows, ...sidewaysRows];

  if (combinedRows.length === 0) return null;

  const grouped: GroupedKra[] = [];
  const seen = new Map<string, number>();

  for (const row of combinedRows) {
    if (!seen.has(row.kra_name)) {
      seen.set(row.kra_name, grouped.length);
      grouped.push({
        kra_name: row.kra_name,
        kra_order: row.kra_order,
        subKras: [],
      });
    }

    const idx = seen.get(row.kra_name)!;
    grouped[idx].subKras.push({
      sub_kra_name: row.sub_kra_name,
      sub_kra_order: row.sub_kra_order,
      description: row.description,
    });
  }

  const departmentLabel = department.replace(/-/g, " / ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8 rounded-sm border border-border bg-card px-6 py-5 shadow-[4px_4px_0px_0px_hsl(var(--ink))]">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <HandwrittenLabel as="h3" className="text-3xl">
                KRA Reference — {departmentLabel} · {hiringLevel}
              </HandwrittenLabel>
            </div>
            <p className="text-xs italic text-muted-foreground">
              These are the Key Result Areas expected for this discipline & level. Use as a reference during evaluation.
            </p>

            <Accordion type="multiple" className="w-full">
              {grouped.map((kra, i) => (
                <AccordionItem key={`${kra.kra_name}-${i}`} value={`kra-${i}`} className="border-ink/10">
                  <AccordionTrigger className="py-3 text-left text-sm font-semibold hover:no-underline">
                    <span className="flex items-center gap-2 text-left">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink/10 text-xs font-bold">
                        {i + 1}
                      </span>
                      {kra.kra_name}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="ml-8 space-y-2">
                      {kra.subKras.map((sub, j) => (
                        <div key={`${sub.sub_kra_name}-${j}`} className="flex gap-2 text-sm">
                          <ChevronRight className="mt-1.5 h-3 w-3 shrink-0 text-muted-foreground" />
                          <div>
                            <span className="font-medium">{sub.sub_kra_name}</span>
                            {sub.description && sub.description !== "NIL" && (
                              <p className="mt-0.5 whitespace-pre-line text-xs text-muted-foreground">
                                {sub.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default KraReferenceBlock;