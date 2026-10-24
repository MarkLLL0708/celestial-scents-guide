import { z } from "zod";
import { publicPerfumes } from "@/data/cloud.functions";
import { chartBalance, rankForBalance, variedRitual } from "./balance";
import { LIVE_READING_PROMPT } from "./voice.server";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "content-type": "application/json" } });
const placement = z.object({ planet: z.string().max(20), sign: z.enum(["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]), house: z.number().int().min(1).max(12).nullable() });
const inputSchema = placement.extend({ language: z.enum(["en", "vi"]), surface: z.enum(["reading", "placement", "daily"]).default("reading"), elements: z.object({ fire: z.number().min(0).max(100), earth: z.number().min(0).max(100), air: z.number().min(0).max(100), water: z.number().min(0).max(100) }), sections: z.array(placement.extend({ angle: z.string().max(60) })).max(5).optional(), blocks: z.array(z.object({ transiting: z.string().max(20), natal: z.string().max(20), aspect: z.string().max(20), kind: z.string().max(20).optional() })).max(3).optional(), context: z.string().max(120).default(""), allowedPerfumeIds: z.array(z.string().max(60)).min(1).max(40).optional() }).strict();
export type VoiceInput = z.infer<typeof inputSchema>;
export interface VoiceReading { truth: string; cost: string; scent: string; ritual: string; sections: string[]; blocks: string[]; summary: string; perfume: { id: string; name: string }; ritualId: string }
const output = z.object({ truth: z.string(), cost: z.string(), scent: z.string(), ritual: z.string().default(""), sections: z.array(z.string()).default([]), blocks: z.array(z.string()).default([]), summary: z.string().default("") });
const sentences = (s: string) => s.split(/(?<=[.!?])\s+/u).filter(Boolean);
export function validate(r: { truth: string; cost: string; scent: string; ritual?: string; sections?: string[]; blocks?: string[]; summary?: string }, lang: string): string | null {
  if (!r || typeof r.truth !== "string" || typeof r.cost !== "string" || typeof r.scent !== "string") return "bad shape";
  const parts = [r.truth, r.cost, r.scent, r.ritual ?? "", ...(r.sections ?? []), ...(r.blocks ?? []), r.summary ?? ""];
  const all = parts.join(" ").toLowerCase();
  const banned = ["enveloping", "tender notes", "leans toward", "resonate", "embrace", "journey", "energy", "essence", "vibration", "aura", "cosmic", "universe", "stupid", "pathetic", "worthless", ...(lang === "vi" ? ["năng lượng vũ trụ", "hành trình", "bao bọc", "vũ trụ", "rung động", "mày"] : [])];
  const hit = banned.find((w) => new RegExp(`(?:^|[^\\p{L}])${w}(?=$|[^\\p{L}])`, "iu").test(all));
  if (hit) return `banned word: ${hit}`;
  for (const part of parts) for (const s of sentences(part)) if (s.trim().split(/\s+/u).length > (lang === "vi" ? 30 : 22)) return "sentence too long";
  if (sentences(r.truth).length < 2 || sentences(r.truth).length > 4 || sentences(r.cost).length !== 1 || sentences(r.scent).length < 2 || sentences(r.scent).length > 3) return "wrong sentence count";
  if (lang === "vi" && (all.match(/\bbạn\b/gu) ?? []).length > 1) return "repeated pronoun";
  return null;
}
const cache = new Map<string, VoiceReading>();
const pending = new Map<string, Promise<VoiceReading>>();
async function generate(data: VoiceInput, signal: AbortSignal): Promise<VoiceReading> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Reading service is not configured.");
  const rows = await publicPerfumes();
  const eligible = rows.filter((p) => !data.allowedPerfumeIds || data.allowedPerfumeIds.includes(p.id));
  const ranked = rankForBalance(eligible, data.elements);
  const perfume = ranked[0];
  if (!perfume) throw new Error("No matching perfume is available.");
  const ritual = variedRitual(data.context || `${data.planet}.${data.sign}`, data.language);
  const packet = { surface: data.surface, placement: { planet: data.planet, sign: data.sign, house: data.house }, language: data.language, balance: chartBalance(data.elements), perfume: { name: data.language === "vi" ? perfume.name_vi ?? perfume.name : perfume.name, smell_words: perfume.smell_words ?? [], notes: [...perfume.top_notes, ...perfume.heart_notes, ...perfume.base_notes].slice(0, 2) }, ritual: ritual.action, blocks: data.blocks };
  const { streamText } = await import("ai");
  const { createAnthropic } = await import("@ai-sdk/anthropic");
  const { createLovableAiGatewayRunIdFetch } = await import("@/lib/ai/gateway-helpers.server");
  const gateway = createLovableAiGatewayRunIdFetch(undefined);
  const anthropic = createAnthropic({ baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, headers: { "X-Lovable-AIG-SDK": "vercel-ai-sdk" }, fetch: gateway.fetch });
  const model = process.env["READING_MODEL"] || "anthropic/claude-haiku-4-5";
  async function call(prompt: string) {
    const res = streamText({ model: anthropic(model), maxOutputTokens: 500, maxRetries: 0, abortSignal: signal, system: LIVE_READING_PROMPT, prompt });
    const text = await res.text;
    if (await res.finishReason === "content-filter" || !text.trim()) throw new Error("The provider declined this request.");
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  }
  let feedback = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    // Only malformed/invalid generated content gets a fresh validation attempt. Provider errors terminate immediately.
    const raw = await call(JSON.stringify(packet) + (feedback ? `\nCorrect the invalid output: ${feedback}` : ""));
    const parsed = output.safeParse(raw);
    if (!parsed.success) { feedback = "Return the required JSON fields."; continue; }
    const bad = validate(parsed.data, data.language);
    if (bad) { feedback = bad; continue; }
    let sections: string[] = [];
    if (data.sections?.length) {
      const result = await call(JSON.stringify({ language: data.language, surface: "chapters", sections: data.sections }) + '\nFor this call return only {"sections":[five strings in order]}. Each string is one or two short sentences about its exact supplied placement and angle. No scent or ritual.');
      sections = z.array(z.string()).length(5).parse(result.sections);
    }
    return { ...parsed.data, sections, perfume: { id: perfume.id, name: packet.perfume.name }, ritualId: ritual.id };
  }
  throw new Error("We couldn't write a valid reading. Please try again.");
}
export async function handleWriteReading(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const parsed = inputSchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Invalid reading input." }, 400);
    const key = JSON.stringify(parsed.data);
    const cached = cache.get(key);
    if (cached) return json(cached);
    let work = pending.get(key);
    if (!work) { work = generate(parsed.data, req.signal); pending.set(key, work); }
    try { const reading = await work; if (cache.size >= 150) cache.clear(); cache.set(key, reading); return json(reading); }
    finally { pending.delete(key); }
  } catch (error) {
    const status = error && typeof error === "object" && "statusCode" in error && typeof error.statusCode === "number" ? error.statusCode : 502;
    return json({ error: error instanceof Error ? error.message : "Reading unavailable." }, req.signal.aborted ? 499 : status);
  }
}
