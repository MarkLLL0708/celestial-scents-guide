import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { MAX_ATTEMPTS, validateReading, type WrittenReading } from "@/lib/reading/rules";

const input = z.object({
  placement: z.object({ planet: z.string().max(20), sign: z.string().max(20), house: z.number().int().min(1).max(12).nullable() }),
  language: z.enum(["en", "vi"]),
  perfume: z.object({ name: z.string().max(80), smell_words: z.array(z.string().max(40)).max(12), notes: z.array(z.string().max(40)).max(12) }),
}).strict();

/** Writes truth/cost/scent with the AI under prompts/reading.md; the perfume is already picked in code. */
export const writeReading = createServerFn({ method: "POST" })
  .inputValidator(input)
  .handler(async ({ data }): Promise<{ ok: true; reading: WrittenReading } | { ok: false }> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false };
    const { default: system } = await import("../../prompts/reading.md?raw");
    const { generateText } = await import("ai");
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { createLovableAiGatewayRunIdFetch } = await import("@/lib/ai/gateway-helpers.server");
    const openai = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: "unused",
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: createLovableAiGatewayRunIdFetch(undefined).fetch,
    });
    let feedback = "";
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const res = await generateText({
          model: openai.responses("openai/gpt-6-astra"),
          system,
          prompt: `${JSON.stringify(data)}\n\nReturn JSON only: {"truth":"","cost":"","scent":""}.${feedback}`,
          maxRetries: 0,
          providerOptions: { openai: { reasoningEffort: "low", store: false } },
        });
        const json = JSON.parse(res.text.trim().replace(/^```(?:json)?|```$/g, ""));
        const flags = validateReading(json);
        if (!flags.length) return { ok: true, reading: { truth: json.truth.trim(), cost: json.cost.trim(), scent: json.scent.trim() } };
        feedback = ` Your last answer broke these rules: ${flags.join(", ")}. Fix them.`;
      } catch {
        feedback = " Your last answer was not valid JSON.";
      }
    }
    return { ok: false };
  });
