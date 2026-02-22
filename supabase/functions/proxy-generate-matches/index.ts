import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Target is the Supabase project you *can't* change (your friend's)
const TARGET_URL =
  Deno.env.get("TARGET_GENERATE_MATCHES_URL") ??
  "https://nwesagjtzdwcqqlmsuhr.supabase.co/functions/v1/generate-matches";

const TARGET_ANON_KEY = Deno.env.get("TARGET_SUPABASE_ANON_KEY") ?? "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authorization = req.headers.get("authorization") ?? "";
  // This is the apikey used to call the *target* (friend) project.
  // The browser will call *this* proxy using the proxy project's anon key.
  const targetApikey = TARGET_ANON_KEY || (req.headers.get("x-target-apikey") ?? req.headers.get("apikey") ?? "");

  try {
    const upstreamRes = await fetch(TARGET_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
        ...(targetApikey ? { apikey: targetApikey } : {}),
      },
      body: await req.text(),
    });

    const body = await upstreamRes.text();
    return new Response(body, {
      status: upstreamRes.status,
      headers: {
        ...corsHeaders,
        "Content-Type": upstreamRes.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (e) {
    console.error("proxy-generate-matches error:", e);
    return new Response(JSON.stringify({ error: "Upstream fetch failed" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
