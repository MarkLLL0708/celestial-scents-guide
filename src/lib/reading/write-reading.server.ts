// @ts-nocheck -- kept as written in the original function
import { SYSTEM_PROMPT } from "../../../prompts/reading";

/** Port of the write-reading function: same logic and text, run as an app server route. */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "content-type": "application/json" } });

const PLANETS = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn"];
const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const SMELL: Record<string, string[]> = {
  Aries:["spicy kitchen","orange peel"], Taurus:["warm blanket","warm bread"],
  Gemini:["cut grass","cold air"], Cancer:["warm blanket","your skin but better"],
  Leo:["orange peel","garden"], Virgo:["clean laundry","bitter"],
  Libra:["garden","clean laundry"], Scorpio:["smoke","bitter"],
  Sagittarius:["cut grass","spicy kitchen"], Capricorn:["old library","bitter"],
  Aquarius:["cold air","wet pavement"], Pisces:["warm blanket","sea"],
};
const BANNED_EN = ["enveloping","tender notes","leans toward","sits in","resonate","embrace","journey","energy","essence","vibration","aura","cosmic","universe"];
const BANNED_VI = ["năng lượng vũ trụ","hành trình","bao bọc","vũ trụ","rung động"];

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const sentences = (s: string) => s.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);

export function validate(r: any, lang: string): string | null {
  if (!r || typeof r.truth !== "string" || typeof r.cost !== "string" || typeof r.scent !== "string") return "bad shape";
  const all = [r.truth, r.cost, r.scent].join(" ").toLowerCase();
  const hit = [...BANNED_EN, ...(lang === "vi" ? BANNED_VI : [])].find((w) => all.includes(w));
  if (hit) return "banned word: " + hit;
  const max = lang === "vi" ? 30 : 22;
  for (const part of [r.truth, r.cost, r.scent])
    for (const s of sentences(part)) if (words(s) > max) return "sentence too long: " + s;
  const nt = sentences(r.truth).length, nc = sentences(r.cost).length, ns = sentences(r.scent).length;
  if (nt < 2 || nt > 4 || nc !== 1 || ns !== 2) return `wrong sentence count ${nt}/${nc}/${ns}`;
  if (/(mars|venus|moon|sun|mercury|jupiter|saturn)\s+in\s+/i.test(sentences(r.truth)[0])) return "opens with the placement";
  return null;
}

async function pickPerfume(sb: any, sign: string, house: number) {
  const { data: rows, error } = await sb.from("perfumes").select("id,name,top_notes,heart_notes,base_notes,smell_words");
  const data = rows?.map((p: any) => ({ ...p, notes: [...(p.top_notes || []), ...(p.heart_notes || []), ...(p.base_notes || [])] }));
  if (error || !data?.length) throw new Error("no perfumes found");
  const want = SMELL[sign];
  const scored = data.map((p: any) => ({ p, s: (p.smell_words || []).filter((w: string) => want.includes(w)).length }));
  const best = Math.max(...scored.map((x: any) => x.s));
  const pool = scored.filter((x: any) => x.s === best).map((x: any) => x.p)
    .sort((a: any, b: any) => String(a.id).localeCompare(String(b.id)));
  return pool[(house - 1) % pool.length];
}

async function callModel(input: unknown, feedback?: string) {
  // Lovable AI (Claude through the built-in gateway) instead of a private Anthropic key; prompt, limit and retry message unchanged.
  const model = process.env["READING_MODEL"] || "anthropic/claude-haiku-4-5";
  const { streamText } = await import("ai");
  const { createAnthropic } = await import("@ai-sdk/anthropic");
  const { createLovableAiGatewayRunIdFetch } = await import("@/lib/ai/gateway-helpers.server");
  const anthropic = createAnthropic({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: process.env["LOVABLE_API_KEY"]!,
    headers: { "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: createLovableAiGatewayRunIdFetch(undefined).fetch,
  });
  const res = streamText({
    model: anthropic(model), maxOutputTokens: 500, maxRetries: 0, system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: JSON.stringify(input) + (feedback ? `\n\nYour previous answer was rejected: ${feedback}. Fix it and answer with JSON only.` : "") }],
  });
  const t = (await res.text) || "";
  return { r: JSON.parse(t.replace(/```json|```/g, "").trim()), model };
}

export async function handleWriteReading(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { planet, sign, house, language } = await req.json();
    if (!PLANETS.includes(planet) || !SIGNS.includes(sign) || !Number.isInteger(house) || house < 1 || house > 12 || !["en","vi"].includes(language))
      return json({ error: "invalid input" }, 400);

    const { supabaseAdmin: sb } = await import("@/integrations/supabase/client.server");
    const perfume = await pickPerfume(sb, sign, house);
    const pf = { id: perfume.id, name: perfume.name };

    const { data: hit } = await sb.from("readings").select("truth,cost,scent")
      .eq("planet", planet).eq("sign", sign).eq("house", house).eq("language", language)
      .eq("perfume_id", String(perfume.id)).maybeSingle();
    if (hit) return json({ ...hit, perfume: pf });

    const notes = (Array.isArray(perfume.notes) ? perfume.notes : String(perfume.notes || "").split(/[,;]/))
      .map((s: string) => s.trim()).filter(Boolean).slice(0, 2);
    const input = { placement: { planet, sign, house }, language, perfume: { name: perfume.name, smell_words: perfume.smell_words || [], notes } };

    let result: any = null, usedModel = "", fb: string | undefined;
    for (let i = 0; i < 3; i++) {
      try {
        const { r, model } = await callModel(input, fb);
        const bad = validate(r, language);
        if (!bad) { result = r; usedModel = model; break; }
        fb = bad;
      } catch (_e) { fb = "invalid JSON"; }
    }
    if (!result) return json({ error: "could not write a valid reading" }, 502);

    await sb.from("readings").upsert(
      { planet, sign, house, language, perfume_id: String(perfume.id), truth: result.truth, cost: result.cost, scent: result.scent, model: usedModel },
      { onConflict: "planet,sign,house,language,perfume_id" },
    );
    return json({ truth: result.truth, cost: result.cost, scent: result.scent, perfume: pf });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
}
