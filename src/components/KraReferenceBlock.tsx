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
  subKras: { sub_kra_name: string; description: string }[];
}

const disciplineAliases: Record<string, string[]> = {
  "creative-copy-art": ["creative-copy-art", "creative", "copy", "copywriting", "art"],
  "creative-design": ["creative-design", "creative design", "product-design", "product design", "design"],
  "account-management": ["account-management", "account management", "servicing", "client servicing"],
  strategy: ["strategy", "brand strategy", "strategic planning"],
  "tech-ux": ["tech-ux", "tech / ux", "tech/ux", "ux", "technology", "tech"],
};

const normalizeText = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const matchesDiscipline = (rowDiscipline: string, selectedDepartment: string) => {
  const normalizedRow = normalizeText(rowDiscipline);
  const aliases = disciplineAliases[selectedDepartment] || [selectedDepartment];
  return aliases.some((alias) => normalizedRow === normalizeText(alias));
};

const sortKraRows = (rows: KraDefinition[]) =>
  [...rows].sort((a, b) => {
    const kraCompare = a.kra_name.localeCompare(b.kra_name);
    if (kraCompare !== 0) return kraCompare;
    return a.sub_kra_name.localeCompare(b.sub_kra_name);
  });

const KraReferenceBlock = ({ department, hiringLevel }: KraReferenceBlockProps) => {
  const { data: allRows, isPending } = useQuery({
    queryKey: ["kra-definitions", department, hiringLevel],
    queryFn: async () => {
      try {
        const { data, error } = (await withTimeout(
          (supabase as any)
            .from("kra_definitions")
            .select("discipline, kra_name, sub_kra_name, level, description")
            .eq("level", hiringLevel),
          4000,
          "Backend unavailable"
        )) as { data: KraDefinition[] | null; error: any };

        if (error) throw error;
        return sortKraRows((data || []) as KraDefinition[]);
      } catch {
        return sortKraRows(getStoredKraDefinitions().filter((row) => row.level === hiringLevel));
      }
    },
    enabled: !!department && !!hiringLevel,
    retry: 0,
    staleTime: 5 * 60 * 1000,
  });

  if (!department || !hiringLevel) return null;
  if (isPending) {
    return (
      <div className="mb-8 flex items-center gap-3 rounded-sm border border-border bg-card px-6 py-5">
        <svg className="h-5 w-5 animate-spin text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-muted-foreground">Fetching KRA reference…</p>
      </div>
    );
  }

  const matchingDisciplineRows = (allRows || []).filter((row) => matchesDiscipline(row.discipline, department));
  const sidewaysRows = (allRows || []).filter((row) => normalizeText(row.discipline) === normalizeText("_sideways_person"));
  const combinedRows = sortKraRows([...matchingDisciplineRows, ...sidewaysRows]);

  const departmentDisplayNames: Record<string, string> = {
    "creative-copy-art": "Creative (Copy & Art)",
    "creative-design": "Creative Design",
    "account-management": "Account Management",
    strategy: "Strategy",
    "tech-ux": "Tech / UX",
  };
  const departmentLabel = departmentDisplayNames[department] || department.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (combinedRows.length === 0) {
    return (
      <div className="mb-8 rounded-sm border border-dashed border-border bg-card px-6 py-5">
        <p className="text-sm italic text-muted-foreground">
          No KRA definitions found for <span className="font-medium">{departmentLabel}</span> at level <span className="font-medium">{hiringLevel}</span>. You can upload them via the <a href="/kra-admin" className="underline hover:text-foreground">KRA Admin</a> page.
        </p>
      </div>
    );
  }

  const grouped: GroupedKra[] = [];
  const seen = new Map<string, number>();

  for (const row of combinedRows) {
    if (!seen.has(row.kra_name)) {
      seen.set(row.kra_name, grouped.length);
      grouped.push({
        kra_name: row.kra_name,
        subKras: [],
      });
    }

    const idx = seen.get(row.kra_name)!;
    grouped[idx].subKras.push({
      sub_kra_name: row.sub_kra_name,
      description: row.description,
    });
  }


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
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400/30 text-xs font-bold">
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