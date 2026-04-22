// Pull recent Deepgram request logs for diagnostics.
// Restricted to super-admins.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEEPGRAM_USAGE_API_KEY = Deno.env.get("DEEPGRAM_USAGE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!DEEPGRAM_USAGE_API_KEY) {
      return json({ error: "DEEPGRAM_USAGE_API_KEY not configured" }, 500);
    }

    // Auth check: must be a super admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing auth" }, 401);
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email;
    if (!email) return json({ error: "Not authenticated" }, 401);
    const { data: isAdmin } = await supabase.rpc("is_super_admin", { check_email: email });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    // Get the Deepgram project id
    const projRes = await fetch("https://api.deepgram.com/v1/projects", {
      headers: { Authorization: `Token ${DEEPGRAM_USAGE_API_KEY}` },
    });
    const projJson = await projRes.json();
    if (!projRes.ok) return json({ step: "projects", status: projRes.status, body: projJson }, 500);
    const projectId = projJson.projects?.[0]?.project_id;
    if (!projectId) return json({ error: "No Deepgram project found", body: projJson }, 500);

    // Query string for the requests endpoint
    const url = new URL(req.url);
    const limit = url.searchParams.get("limit") || "20";
    const start = url.searchParams.get("start") ||
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const end = url.searchParams.get("end") || new Date().toISOString();

    const reqUrl = new URL(`https://api.deepgram.com/v1/projects/${projectId}/requests`);
    reqUrl.searchParams.set("start", start);
    reqUrl.searchParams.set("end", end);
    reqUrl.searchParams.set("limit", limit);

    const reqRes = await fetch(reqUrl.toString(), {
      headers: { Authorization: `Token ${DEEPGRAM_USAGE_API_KEY}` },
    });
    const reqJson = await reqRes.json();
    if (!reqRes.ok) return json({ step: "requests", status: reqRes.status, body: reqJson }, 500);

    // Compact summary
    const summary = (reqJson.requests || []).map((r: Record<string, unknown>) => ({
      request_id: r.request_id,
      created: r.created,
      path: r.path,
      api_key_id: r.api_key_id,
      response_code: (r as { response?: { code?: number } }).response?.code,
      details: (r as { response?: { details?: unknown } }).response?.details,
      duration: (r as { response?: { details?: { duration?: number } } }).response?.details?.duration,
      callback: r.callback,
    }));

    return json({
      project_id: projectId,
      window: { start, end },
      total: reqJson.requests?.length ?? 0,
      requests: summary,
    }, 200);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
