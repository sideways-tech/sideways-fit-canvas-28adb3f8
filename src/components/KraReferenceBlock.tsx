import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, ChevronRight } from "lucide-react";
import SketchCard from "./SketchCard";
import HandwrittenLabel from "./HandwrittenLabel";

interface KraDefinition {
  id: string;
  discipline: string;
  kra_name: string;
  kra_order: number;
  sub_kra_name: string;
  sub_kra_order: number;
  level: string;
  description: string;
}

interface KraReferenceBlockProps {
  department: string;
  hiringLevel: string;
}

interface GroupedKra {
  kra_name: string;
  kra_order: number;
  subKras: { sub_kra_name: string; sub_kra_order: number; description: string }[];
}

const KraReferenceBlock = ({ department, hiringLevel }: KraReferenceBlockProps) => {
  const { data: kraData, isLoading } = useQuery({
    queryKey: ["kra-definitions", department, hiringLevel],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kra_definitions")
        .select("*")
        .eq("discipline", department)
        .eq("level", hiringLevel)
        .order("kra_order", { ascending: true })
        .order("sub_kra_order", { ascending: true });

      if (error) throw error;
      return data as KraDefinition[];
    },
    enabled: !!department && !!hiringLevel,
  });

  // Also fetch Sideways Person traits (universal)
  const { data: sidewaysData } = useQuery({
    queryKey: ["kra-definitions", "_sideways_person", hiringLevel],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kra_definitions")
        .select("*")
        .eq("discipline", "_sideways_person")
        .eq("level", hiringLevel)
        .order("kra_order", { ascending: true })
        .order("sub_kra_order", { ascending: true });

      if (error) throw error;
      return data as KraDefinition[];
    },
    enabled: !!hiringLevel,
  });

  if (!department || !hiringLevel) return null;

  const allData = [...(kraData || []), ...(sidewaysData || [])];

  if (!isLoading && allData.length === 0) return null;

  // Group by KRA name
  const grouped: GroupedKra[] = [];
  const seen = new Map<string, number>();

  for (const row of allData) {
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
        <SketchCard className="mb-8 bg-highlighter/5 border-highlighter/40" delay={0.12}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              <HandwrittenLabel as="h3" className="text-3xl">
                KRA Reference — {departmentLabel} · {hiringLevel}
              </HandwrittenLabel>
            </div>
            <p className="text-xs text-muted-foreground italic">
              These are the Key Result Areas expected for this discipline & level. Use as a reference during evaluation.
            </p>

            {isLoading ? (
              <p className="text-sm text-muted-foreground py-4">Loading KRAs…</p>
            ) : (
              <Accordion type="multiple" className="w-full">
                {grouped.map((kra, i) => (
                  <AccordionItem key={i} value={`kra-${i}`} className="border-ink/10">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                      <span className="flex items-center gap-2 text-left">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-ink/10 text-xs font-bold shrink-0">
                          {i + 1}
                        </span>
                        {kra.kra_name}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 ml-8">
                        {kra.subKras.map((sub, j) => (
                          <div key={j} className="flex gap-2 text-sm">
                            <ChevronRight className="w-3 h-3 mt-1.5 shrink-0 text-muted-foreground" />
                            <div>
                              <span className="font-medium">{sub.sub_kra_name}</span>
                              {sub.description && sub.description !== "NIL" && (
                                <p className="text-muted-foreground text-xs mt-0.5 whitespace-pre-line">
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
            )}
          </div>
        </SketchCard>
      </motion.div>
    </AnimatePresence>
  );
};

export default KraReferenceBlock;
