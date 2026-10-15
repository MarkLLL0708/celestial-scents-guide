import { streamText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai/gateway-helpers.server";
import { planets, aspects, signFacts, roles } from "@/config/astroFacts";
import type { LibraryKind } from "./keys";
import { en } from "@/i18n/en";
import { vi } from "@/i18n/vi";
export const LIBRARY_MODEL = "google/gemini-3.1-flash-lite";
const system =
  "You write short astrology texts for Natal Notes. Voice: dry, specific, brief, a little ceremonial, never cheerful. Second person. Lowercase sentences. Describe a tendency in plain words, then one concrete observation or small action. Use tends to, often, you may. Short declarative sentences. Everyday details rather than abstract words. Never insult. Never use mystical clichés (the universe, cosmic energy, destiny, journey, manifest). Never promise or predict events, mention money, health, pregnancy, death, legal matters or exact dates. Never mention perfume, fragrance, scent, shopping, products or prices. Original writing only, never imitate another app or book. No emojis, exclamation marks, lists, headings or quotation marks. Vietnamese must be natural, address the reader as bạn. Output only the text.";
export function promptFor(kind: LibraryKind, key: string, lang: "en" | "vi") {
  const p = key.split(".");
  const language = `Language: ${lang}. `;
  if (kind === "trait_line")
    return (
      language +
      `Write one phrase of 3 to 6 words describing someone with ${p[0]} (${planets[p[0]]}) in ${p[1]} (${signFacts[p[1]]}). Plain observation, not advice, no full stop.`
    );
  if (kind === "reading_section")
    return (
      language +
      `Write 55 to 65 words for '${p[1].replaceAll("_", " ")}' of '${p[0]}'. Placement ${p[2]} (${planets[p[2]]}) in ${p[3]} (${signFacts[p[3]]}). Describe how it shows up in this section.`
    );
  if (kind === "today_block")
    return (
      language +
      `Write 30 to 38 words for '${roles[p[0]]}'. Transiting ${p[1]} (${planets[p[1]]}) ${p[2]} (${aspects[p[2]]}) natal ${p[3]} (${planets[p[3]]}). One observation and small concrete action. No signs.`
    );
  if (kind === "day_summary")
    return (
      language +
      `Write one sentence of 8 to 14 words for ${p[0] === "quiet" ? "a quiet day with nothing strong moving" : `${p[0]} energy is ${p[1]}`}.`
    );
  const [theme, num] = p[0].split("-");
  const n = Number(num);
  const name =
    `q${theme[0].toUpperCase() + theme.slice(1)}${theme === "work" && n <= 4 ? `${n}b` : n}` as keyof typeof en;
  const question = (lang === "vi" ? vi : en)[name];
  return (
    language +
    `Reader asks: '${question}'. Sky is ${p[1]} (easy: flowing opening; hard: friction needing patience; intense: concentrated; quiet: own tendencies). Write 45 to 60 words: honest observation, then one concrete action. Do not mention signs, planets, aspects or predict events.`
  );
}
export async function generateText(
  apiKey: string,
  kind: LibraryKind,
  key: string,
  lang: "en" | "vi",
  signal?: AbortSignal,
) {
  const provider = createLovableAiGatewayProvider(apiKey, undefined, {
    baseURL: "https://ai.gateway.lovable.dev/v1",
  });
  const result = streamText({
    model: provider(LIBRARY_MODEL),
    system,
    prompt: promptFor(kind, key, lang),
    maxRetries: 0,
    abortSignal: signal,
  });
  const body = (await result.text).trim();
  const reason = await result.finishReason;
  if (reason === "content-filter" || !body) throw new Error("The provider declined this request.");
  return body;
}
