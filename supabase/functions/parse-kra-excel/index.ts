import { createClient } from "npm:@supabase/supabase-js@2";
import * as XLSX from "npm:xlsx@0.18.5";

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
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return new Response(JSON.stringify({ error: "Missing content type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const discipline = (formData.get("discipline") as string)?.trim().toLowerCase();

    if (!file || !discipline) {
      return new Response(JSON.stringify({ error: "Missing file or discipline" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });

    // Use first sheet (usually "Ratings")
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: (string | number | null)[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      blankrows: true,
    });

    if (rows.length < 2) {
      return new Response(JSON.stringify({ error: "Sheet appears empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find header row: look for row containing "KRA" and "Sub-KRA"
    let headerIdx = -1;
    for (let i = 0; i < Math.min(5, rows.length); i++) {
      const rowStr = rows[i].map((c) => String(c).trim().toLowerCase());
      if (rowStr.includes("kra") && rowStr.includes("sub-kra")) {
        headerIdx = i;
        break;
      }
    }

    if (headerIdx === -1) {
      return new Response(
        JSON.stringify({ error: "Could not find header row with 'KRA' and 'Sub-KRA' columns" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const header = rows[headerIdx].map((c) => String(c).trim());

    // Find column indices
    const kraCol = header.findIndex((h) => h.toLowerCase() === "kra");
    const subKraCol = header.findIndex((h) => h.toLowerCase() === "sub-kra");

    // Find level columns (L1 through L7)
    const levelCols: { level: string; col: number }[] = [];
    for (let c = 0; c < header.length; c++) {
      const match = header[c].match(/^L(\d)$/i);
      if (match) {
        levelCols.push({ level: `L${match[1]}`, col: c });
      }
    }

    if (kraCol === -1 || subKraCol === -1 || levelCols.length === 0) {
      return new Response(
        JSON.stringify({ error: "Could not find required columns (KRA, Sub-KRA, L1-L6/L7)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse data rows
    interface KraRow {
      discipline: string;
      kra_name: string;
      kra_order: number;
      sub_kra_name: string;
      sub_kra_order: number;
      level: string;
      description: string;
    }

    const records: KraRow[] = [];
    let currentKra = "";
    let kraOrder = 0;
    let subKraOrder = 0;

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      const kraVal = String(row[kraCol] ?? "").trim();
      const subKraVal = String(row[subKraCol] ?? "").trim();

      // New KRA category
      if (kraVal && kraVal !== currentKra) {
        currentKra = kraVal;
        kraOrder++;
        subKraOrder = 0;
      }

      // Skip rows with no sub-KRA
      if (!subKraVal || !currentKra) continue;

      subKraOrder++;

      for (const { level, col } of levelCols) {
        const desc = String(row[col] ?? "").trim();
        records.push({
          discipline,
          kra_name: currentKra,
          kra_order: kraOrder,
          sub_kra_name: subKraVal,
          sub_kra_order: subKraOrder,
          level,
          description: desc || "NIL",
        });
      }
    }

    if (records.length === 0) {
      return new Response(JSON.stringify({ error: "No KRA data parsed from sheet" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Connect to Supabase with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Delete existing data for this discipline
    const { error: delErr } = await supabase
      .from("kra_definitions")
      .delete()
      .eq("discipline", discipline);

    if (delErr) throw delErr;

    // Insert in batches of 500
    const batchSize = 500;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const { error: insErr } = await supabase.from("kra_definitions").insert(batch);
      if (insErr) throw insErr;
    }

    return new Response(
      JSON.stringify({
        success: true,
        discipline,
        kra_count: kraOrder,
        records_inserted: records.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
