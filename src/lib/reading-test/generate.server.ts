import { streamText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai/gateway-helpers.server";
import { SYSTEM_PROMPT, HUMANIZE_VI_PROMPT } from "./prompt.server";
import { check } from "./validator";
import { fixtures, type ReadingOutput, type Language, type Surface } from "./fixtures";

const signNames = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
export function allowedSigns(packet: unknown): string[] {
  const found = new Set<string>();
  function visit(value: unknown) {
    if (typeof value === "string") {
      for (const sign of signNames) if (new RegExp(`\\b${sign}\\b`, "i").test(value)) found.add(sign);
    } else if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") Object.values(value).forEach(visit);
  }
  visit(packet);
  return [...found];
}
export type TestResult = { output: ReadingOutput | null; tries: number; model: string; humanized: boolean; reason: string | null };
type Call = (system: string, user: string) => Promise<string>;
function parse(text: string): ReadingOutput { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
export async function generateTestReading(surface: Surface, language: Language, packet: Record<string, unknown>, model: string, call: Call): Promise<TestResult> {
  const signs = allowedSigns(packet);
  let output: ReadingOutput | null = null, reason: string | null = null, tries = 0;
  for (let i = 0; i < 3; i++) {
    tries++;
    const text = await call(SYSTEM_PROMPT, JSON.stringify({ surface, language, ...packet }) + (reason ? `\n\nYour previous answer was rejected: ${reason}. Fix it, JSON only.` : ""));
    try { output = parse(text); reason = check(output, surface, language, signs); }
    catch { output = null; reason = "invalid JSON"; }
    if (!reason) break;
  }
  let humanized = false;
  if (language === "vi" && output && !reason) {
    const secondText = await call(HUMANIZE_VI_PROMPT, JSON.stringify(output));
    try {
      const second = parse(secondText);
      if (!check(second, surface, language, signs)) { output = second; humanized = true; }
    } catch { /* Keep the validated first pass. */ }
  }
  return { output, tries, model, humanized, reason };
}
export async function runFixture(fixtureId: number, language: Language, model: string) {
  const fixture = fixtures.find((f) => f.id === fixtureId);
  if (!fixture) throw new Error("Unknown fixture");
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Lovable AI is not configured");
  const provider = createLovableAiGatewayProvider(key, undefined, { baseURL: "https://ai.gateway.lovable.dev/v1" });
  return generateTestReading(fixture.surface, language, fixture.packet, model, async (system, user) => {
    const result = streamText({ model: provider(model), system, messages: [{ role: "user", content: user }], maxRetries: 0 });
    return await result.text;
  });
}