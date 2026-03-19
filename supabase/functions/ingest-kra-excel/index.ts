import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { read, utils } from "npm:xlsx@0.20.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const discipline = formData.get("discipline") as string;

    if (!file || !discipline) {
      return new Response(
        JSON.stringify({ error: "file and discipline are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = read(new Uint8Array(buffer), { type: "array" });

    // Find the ratings sheet (first sheet or one containing "Ratings")
    let sheetName = workbook.SheetNames[0];
    for (const name of workbook.SheetNames) {
      if (name.toLowerCase().includes("rating")) {
        sheetName = name;
        break;
      }
    }

    const sheet = workbook.Sheets[sheetName];
    const data: (string | number | null)[][] = utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
    });

    const levels = ["L1", "L2", "L3", "L4", "L5", "L6"];
    const rows: {
      discipline: string;
      kra_number: number;
      kra_name: string;
      sub_kra_name: string;
      level: string;
      description: string | null;
    }[] = [];

    let currentKraNum: number | null = null;
    let currentKraName: string | null = null;
    let maxKraNum = 0;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row) continue;

      const col0 = row[0];
      const col1 = row[1] != null ? String(row[1]).trim() : null;
      const col2 = row[2] != null ? String(row[2]).trim() : null;

      if (col0 != null && !isNaN(Number(col0))) {
        currentKraNum = Number(col0);
        if (currentKraNum > maxKraNum) maxKraNum = currentKraNum;
        currentKraName = col1;
      } else if (col1 && col1.length > 0) {
        // New KRA group without a number (e.g., "Sideways Person")
        maxKraNum++;
        currentKraNum = maxKraNum;
        currentKraName = col1;
      }

      if (!col2 || col2.length === 0) continue;

      for (let li = 0; li < levels.length; li++) {
        const cellVal = row[3 + li];
        const desc =
          cellVal != null && String(cellVal).trim().length > 0 && String(cellVal).trim() !== "NIL"
            ? String(cellVal).trim()
            : null;

        rows.push({
          discipline,
          kra_number: currentKraNum!,
          kra_name: currentKraName!,
          sub_kra_name: col2,
          level: levels[li],
          description: desc,
        });
      }
    }

    // Delete existing data for this discipline
    await supabase.from("kra_definitions").delete().eq("discipline", discipline);

    // Insert in batches of 50
    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50);
      const { error } = await supabase.from("kra_definitions").insert(batch);
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        discipline,
        sheet: sheetName,
        kras_found: new Set(rows.map((r) => r.kra_name)).size,
        rows_inserted: rows.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error ingesting KRA Excel:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
