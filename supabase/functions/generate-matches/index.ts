import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Helpers ────────────────────────────────────────────────────────
function buildProfileText(p: any): string {
  const parts = [
    `Name: ${p.full_name || "Unknown"}`,
    `Title: ${p.job_title || "N/A"} at ${p.company || "N/A"}`,
    `Primary Interest: ${p.primary_interest || "N/A"}`,
    `Strategic Outcomes: ${(p.strategic_outcomes || []).join(", ") || "N/A"}`,
    `Asymmetric Opportunity Thesis: ${p.asymmetric_opportunity || "N/A"}`,
    `Capital Leverage: ${(p.capital_leverage || []).join(", ") || "N/A"}`,
    `Desired Counterparties: ${(p.counterparty_types || []).join(", ") || "N/A"}`,
    `Adjacent Domains: ${(p.adjacent_domains || []).join(", ") || "N/A"}`,
    `Counterparty Stage: ${p.counterparty_stage || "N/A"}`,
    `Hard Constraints: ${p.hard_constraints || "None"}`,
  ];
  return parts.join("\n");
}

function jaccardSimilarity(a: string[], b: string[]): number {
  if (!a?.length || !b?.length) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

// ── Rule-Based Scoring ────────────────────────────────────────────
function computeStrategicAlignment(a: any, b: any): number {
  let score = 0;
  // Strategic outcome overlap
  score += jaccardSimilarity(a.strategic_outcomes, b.strategic_outcomes) * 30;
  // Primary interest match
  if (a.primary_interest && b.primary_interest && a.primary_interest === b.primary_interest) score += 15;
  // Adjacent domain overlap
  score += jaccardSimilarity(a.adjacent_domains, b.adjacent_domains) * 25;
  // Counterparty stage compatibility
  if (a.counterparty_stage && b.counterparty_stage && a.counterparty_stage === b.counterparty_stage) score += 10;
  // Both have asymmetric opportunity thesis
  if (a.asymmetric_opportunity && b.asymmetric_opportunity) score += 20;
  return Math.min(score, 100);
}

function computeComplementarity(a: any, b: any): number {
  let score = 0;
  // Counterparty type match: does A want what B is?
  const aWants = new Set(a.counterparty_types || []);
  const bWants = new Set(b.counterparty_types || []);
  const aLeverage = new Set(a.capital_leverage || []);
  const bLeverage = new Set(b.capital_leverage || []);

  // Cross-leverage: A has what B seeks and vice versa (collaborative filtering signal)
  const aHasBNeeds = [...bWants].some((w) => {
    if (w === "Institutional allocator" && aLeverage.has("Deployable financial capital")) return true;
    if (w === "Infrastructure provider" && aLeverage.has("Technical infrastructure")) return true;
    if (w === "Early-stage builder" && aLeverage.has("Developer ecosystem")) return true;
    if (w === "Regulatory stakeholder" && aLeverage.has("Regulatory access / policy influence")) return true;
    if (w === "Global brand / distribution partner" && aLeverage.has("Distribution channels (enterprise / retail)")) return true;
    return false;
  });
  if (aHasBNeeds) score += 35;

  const bHasANeeds = [...aWants].some((w) => {
    if (w === "Institutional allocator" && bLeverage.has("Deployable financial capital")) return true;
    if (w === "Infrastructure provider" && bLeverage.has("Technical infrastructure")) return true;
    if (w === "Early-stage builder" && bLeverage.has("Developer ecosystem")) return true;
    if (w === "Regulatory stakeholder" && bLeverage.has("Regulatory access / policy influence")) return true;
    if (w === "Global brand / distribution partner" && bLeverage.has("Distribution channels (enterprise / retail)")) return true;
    return false;
  });
  if (bHasANeeds) score += 35;

  // Leverage diversity: different leverage = more complementary
  const leverageDiff = 1 - jaccardSimilarity(a.capital_leverage, b.capital_leverage);
  score += leverageDiff * 30;

  return Math.min(score, 100);
}

function computeMeetingValue(a: any, b: any, strategicScore: number, complementarityScore: number): number {
  let score = 0;
  // Base from other scores
  score += strategicScore * 0.3 + complementarityScore * 0.4;
  // Both have completed detailed profiles
  if (a.asymmetric_opportunity && b.asymmetric_opportunity) score += 15;
  if ((a.capital_leverage?.length || 0) > 0 && (b.capital_leverage?.length || 0) > 0) score += 15;
  return Math.min(score, 100);
}

// ── AI Content Extraction & Summary ──────────────────────────────
async function callAI(messages: any[]): Promise<string> {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages,
      stream: false,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("AI gateway error:", resp.status, text);
    throw new Error(`AI gateway error: ${resp.status}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "";
}

async function extractProfileIntent(profile: any): Promise<{ intent_vector: any; content_tags: string[]; power_map: any; trend_alignment: string; execution_compatibility: string }> {
  const profileText = buildProfileText(profile);

  const systemPrompt = `You are a strategic intelligence analyst. Given a participant profile, extract structured signals. Return a valid JSON object with these exact keys:
- intent_vector: object with keys "primary_intent" (string), "time_horizon" (string), "urgency" (string: low/medium/high)
- content_tags: array of 5-8 keyword tags capturing the person's core focus areas
- power_map: object with keys "controls" (array of strings) and "seeks" (array of strings)
- trend_alignment: one sentence summarizing their market thesis
- execution_compatibility: one sentence on what stage/type of partners they work best with

Return ONLY valid JSON, no markdown.`;

  const result = await callAI([
    { role: "system", content: systemPrompt },
    { role: "user", content: profileText },
  ]);

  try {
    const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse AI extraction:", result);
    return {
      intent_vector: { primary_intent: profile.primary_interest || "Unknown", time_horizon: "12-18 months", urgency: "medium" },
      content_tags: [...(profile.strategic_outcomes || []), ...(profile.adjacent_domains || [])].slice(0, 8),
      power_map: { controls: profile.capital_leverage || [], seeks: profile.counterparty_types || [] },
      trend_alignment: profile.asymmetric_opportunity || "Not specified",
      execution_compatibility: profile.counterparty_stage || "Not specified",
    };
  }
}

async function generateMatchSummary(profileA: any, profileB: any, scores: { strategic: number; meeting: number; complementarity: number }): Promise<string> {
  const prompt = `You are a high-end matchmaking analyst for a closed-door strategic event. Given two participant profiles and their compatibility scores, write a 2-3 sentence executive summary of WHY these two should meet. Be specific about the strategic value and complementarity. Do not use generic language.

Profile A:
${buildProfileText(profileA)}

Profile B:
${buildProfileText(profileB)}

Scores:
- Strategic Alignment: ${scores.strategic.toFixed(1)}/100
- Meeting Value: ${scores.meeting.toFixed(1)}/100
- Complementarity: ${scores.complementarity.toFixed(1)}/100

Write a concise, high-signal summary.`;

  return await callAI([
    { role: "system", content: "You are a strategic matchmaking analyst. Write concise, high-value match summaries." },
    { role: "user", content: prompt },
  ]);
}

// ── Main Handler ─────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authenticated client to get user
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader! } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role client for writes
    const adminClient = createClient(supabaseUrl, serviceKey);

    // 1. Fetch all completed profiles
    const { data: profiles, error: profilesError } = await adminClient
      .from("profiles")
      .select("*")
      .eq("onboarding_complete", true);

    if (profilesError) throw profilesError;
    if (!profiles || profiles.length < 2) {
      return new Response(JSON.stringify({ message: "Not enough profiles for matching", matches: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const currentProfile = profiles.find((p: any) => p.user_id === user.id);
    if (!currentProfile) {
      return new Response(JSON.stringify({ error: "Complete onboarding first" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. AI Intent Extraction for current user (if not already done)
    const { data: existingAnalysis } = await adminClient
      .from("profile_analyses")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!existingAnalysis) {
      console.log("Extracting intent for user:", user.id);
      const extraction = await extractProfileIntent(currentProfile);
      await adminClient.from("profile_analyses").upsert({
        user_id: user.id,
        intent_vector: extraction.intent_vector,
        content_tags: extraction.content_tags,
        power_map: extraction.power_map,
        trend_alignment: extraction.trend_alignment,
        execution_compatibility: extraction.execution_compatibility,
        embedding_text: buildProfileText(currentProfile),
      });
    }

    // 3. Compute matches with all other profiles
    const otherProfiles = profiles.filter((p: any) => p.user_id !== user.id);
    const matchResults = [];

    for (const other of otherProfiles) {
      // Rule-based scores
      const strategicScore = computeStrategicAlignment(currentProfile, other);
      const complementarityScore = computeComplementarity(currentProfile, other);
      const meetingScore = computeMeetingValue(currentProfile, other, strategicScore, complementarityScore);

      // Content-based: tag overlap from AI extraction (if available)
      let contentBoost = 0;
      const { data: otherAnalysis } = await adminClient
        .from("profile_analyses")
        .select("content_tags")
        .eq("user_id", other.user_id)
        .single();

      if (otherAnalysis?.content_tags && existingAnalysis?.content_tags) {
        contentBoost = jaccardSimilarity(existingAnalysis.content_tags, otherAnalysis.content_tags) * 15;
      }

      const overall = (strategicScore * 0.35 + meetingScore * 0.30 + complementarityScore * 0.35 + contentBoost);

      // Only keep meaningful matches (>20 overall)
      if (overall > 20) {
        matchResults.push({
          profile: other,
          scores: { strategic: strategicScore, meeting: meetingScore, complementarity: complementarityScore },
          overall,
        });
      }
    }

    // 4. Sort by overall score and take top 10
    matchResults.sort((a, b) => b.overall - a.overall);
    const topMatches = matchResults.slice(0, 10);

    // 5. Generate AI summaries for top 5 matches
    const matchesToSave = [];
    for (let i = 0; i < topMatches.length; i++) {
      const m = topMatches[i];
      let aiSummary = "";
      if (i < 5) {
        try {
          aiSummary = await generateMatchSummary(currentProfile, m.profile, m.scores);
        } catch (e) {
          console.error("Summary generation failed:", e);
          aiSummary = `Strong match based on shared interest in ${currentProfile.primary_interest || "strategic alignment"} with complementary capabilities.`;
        }
      }

      matchesToSave.push({
        user_id: user.id,
        matched_user_id: m.profile.user_id,
        strategic_alignment_score: Math.round(m.scores.strategic * 100) / 100,
        meeting_value_score: Math.round(m.scores.meeting * 100) / 100,
        complementarity_score: Math.round(m.scores.complementarity * 100) / 100,
        overall_score: Math.round(m.overall * 100) / 100,
        ai_summary: aiSummary,
        match_reasons: {
          strategic_outcomes_overlap: jaccardSimilarity(currentProfile.strategic_outcomes, m.profile.strategic_outcomes),
          domain_overlap: jaccardSimilarity(currentProfile.adjacent_domains, m.profile.adjacent_domains),
          leverage_complementarity: 1 - jaccardSimilarity(currentProfile.capital_leverage, m.profile.capital_leverage),
        },
      });
    }

    // 6. Upsert matches (delete old ones first)
    await adminClient.from("matches").delete().eq("user_id", user.id);
    if (matchesToSave.length > 0) {
      const { error: insertError } = await adminClient.from("matches").insert(matchesToSave);
      if (insertError) console.error("Match insert error:", insertError);
    }

    // 7. Return matches with profile info
    const response = matchesToSave.map((m, i) => ({
      ...m,
      matched_profile: {
        full_name: topMatches[i].profile.full_name,
        job_title: topMatches[i].profile.job_title,
        company: topMatches[i].profile.company,
        primary_interest: topMatches[i].profile.primary_interest,
        strategic_outcomes: topMatches[i].profile.strategic_outcomes,
        adjacent_domains: topMatches[i].profile.adjacent_domains,
      },
    }));

    return new Response(JSON.stringify({ matches: response }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-matches error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
