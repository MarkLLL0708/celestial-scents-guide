import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checkLimit, validateLiveAnswer } from "@/lib/ask/live";

const sign = z.string().max(20);
const askInput = z
  .object({
    question: z.string().trim().min(1).max(300),
    theme: z.enum(["self", "love", "work", "luck"]),
    lang: z.enum(["en", "vi"]),
    sun: sign,
    moon: sign,
    rising: sign.nullable(),
    transit: z.string().max(80),
    sky: z.enum(["easy", "hard", "intense", "quiet"]),
    ritual: z.string().max(80),
    perfume: z.string().max(80).nullable(),
    notes: z.string().max(120),
  })
  .strict();

async function subjectFor(): Promise<string> {
  const req = getRequest();
  const auth = req.headers.get("authorization") ?? "";
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const raw = auth.startsWith("Bearer ") && auth.length > 40 ? `u:${auth.slice(-40)}` : `ip:${ip}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

const SYSTEM =
  "You answer one personal question for Natal Notes, an astrology perfume house. Voice: dry, specific, warm but never cheerful, a little ceremonial. Second person. Start each sentence with a capital letter. 60 to 100 words, one paragraph. Ground the answer in the given placements and today's transit in plain words. Then suggest the named ritual as one small concrete action, and name the perfume once as something to wear while doing it. Use tends to, often, you may. Never predict events or promise outcomes. Never mention health, pregnancy, death, legal or money matters. No clichés like the universe, cosmic energy or destiny. No emojis, exclamation marks, lists, headings or links. If the question asks for medical, legal or financial advice, gently decline that part and answer only the emotional side. Vietnamese must be natural and address the reader as bạn. Output only the answer.";

export const liveAsk = createServerFn({ method: "POST" })
  .inputValidator(askInput)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const subject = await subjectFor();
    const now = Date.now();
    const since = (ms: number) => new Date(now - ms).toISOString();
    const count = async (from: string, own: boolean) => {
      let q = supabaseAdmin.from("ask_usage").select("id", { count: "exact", head: true }).gte("created_at", from).in("source", ["ai", "fallback"]);
      if (own) q = q.eq("subject", subject);
      const { count: n } = await q;
      return n ?? 0;
    };
    const [hour, day, global] = await Promise.all([count(since(3600e3), true), count(since(86400e3), true), count(since(86400e3), false)]);
    const limit = checkLimit(hour, day, global);
    const log = (source: string) => supabaseAdmin.from("ask_usage").insert({ subject, source, lang: data.lang });
    if (limit !== "ok") {
      await log("limited");
      return { ok: false as const, reason: "limited" as const };
    }
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false as const, reason: "unavailable" as const };
    const prompt = `Language: ${data.lang}. Category: ${data.theme === "luck" ? "mood" : data.theme}. Question: "${data.question.replace(/"/g, "'")}". Sun ${data.sun}, Moon ${data.moon}, Rising ${data.rising ?? "unknown"}. Today: ${data.transit} (${data.sky}). Ritual: ${data.ritual}. Perfume: ${data.perfume ?? "none"}${data.notes ? ` with notes ${data.notes}` : ""}.`;
    try {
      const { generateText } = await import("ai");
      const { createLovableAiGatewayProvider } = await import("@/lib/ai/gateway-helpers.server");
      const provider = createLovableAiGatewayProvider(apiKey, undefined, { baseURL: "https://ai.gateway.lovable.dev/v1" });
      const res = await generateText({ model: provider("google/gemini-3-flash-preview"), system: SYSTEM, prompt, maxRetries: 1, abortSignal: AbortSignal.timeout(20000) });
      const body = res.text.trim();
      if (!body || validateLiveAnswer(body).length) {
        await log("fallback");
        return { ok: false as const, reason: "invalid" as const };
      }
      await log("ai");
      return { ok: true as const, answer: body };
    } catch {
      await log("fallback");
      return { ok: false as const, reason: "unavailable" as const };
    }
  });

export const logLibraryAsk = createServerFn({ method: "POST" })
  .inputValidator(z.object({ lang: z.enum(["en", "vi"]) }).strict())
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("ask_usage").insert({ subject: await subjectFor(), source: "library", lang: data.lang });
    return { ok: true };
  });

export const askUsage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: admin } = await context.supabase.rpc("has_role", { user_id: context.userId, role: "admin" });
    if (!admin) throw new Error("Forbidden");
    const { data, error } = await context.supabase
      .from("ask_usage")
      .select("source,subject,created_at")
      .gte("created_at", new Date(Date.now() - 7 * 86400e3).toISOString())
      .limit(10000);
    if (error) throw new Error(error.message);
    const dayAgo = Date.now() - 86400e3;
    const tally = (rows: typeof data) =>
      Object.fromEntries(["ai", "library", "fallback", "limited"].map((s) => [s, rows.filter((r) => r.source === s).length]));
    return {
      day: tally(data.filter((r) => Date.parse(r.created_at) >= dayAgo)),
      week: tally(data),
      visitors: new Set(data.map((r) => r.subject)).size,
    };
  });
