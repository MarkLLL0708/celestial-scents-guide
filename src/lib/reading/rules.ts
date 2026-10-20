import type { Perfume } from "@/data/types";

/** Shared, pure rules for written readings and code-only perfume picking. */
export interface WrittenReading { truth: string; cost: string; scent: string }
export const MAX_SENTENCE_WORDS = 22;
export const MAX_ATTEMPTS = 3; // first try plus 2 retries
export const BANNED = ["enveloping", "tender notes", "leans toward", "sits in", "resonates", "embrace", "journey", "energy", "essence", "vibrations", "aura", "cosmic", "universe"];

export function validateReading(r: unknown): string[] {
  const flags: string[] = [];
  const o = r as Partial<WrittenReading> | null;
  if (!o || [o.truth, o.cost, o.scent].some((v) => typeof v !== "string" || !v.trim())) return ["shape"];
  const all = `${o.truth} ${o.cost} ${o.scent}`;
  const lower = all.toLowerCase();
  for (const w of BANNED) if (new RegExp(`(^|[^\\p{L}])${w}(?=$|[^\\p{L}])`, "u").test(lower)) flags.push(`banned:${w}`);
  for (const s of all.split(/(?<=[.?!…])\s+/u)) if (s.trim().split(/\s+/u).filter(Boolean).length > MAX_SENTENCE_WORDS) flags.push("long_sentence");
  return flags;
}

/** Everyday smell words for a perfume, from its family and its own notes only. */
const familyWords: Record<string, string[]> = {
  Citrus: ["orange peel", "bright"], Floral: ["fresh flowers", "soft"], Woody: ["pencil shavings", "dry wood"],
  Oriental: ["warm spice", "smoke"], Fresh: ["clean laundry", "cool air"], Gourmand: ["bakery", "warm blanket"],
  Aromatic: ["crushed herbs", "cool air"], Musk: ["warm skin", "clean laundry"], Leather: ["old jacket", "smoke"],
  Green: ["cut grass", "wet pavement"],
};
const noteWords: Record<string, string> = {
  bergamot: "orange peel", lemon: "orange peel", orange: "orange peel", mint: "cool air", tea: "dry wood", lavender: "crushed herbs",
  rose: "fresh flowers", jasmine: "fresh flowers", vanilla: "bakery", amber: "warm blanket", oud: "smoke", incense: "smoke",
  cedar: "pencil shavings", sandalwood: "dry wood", vetiver: "wet pavement", musk: "warm skin", leather: "old jacket",
  "sea salt": "cool air", pepper: "warm spice", cardamom: "warm spice", saffron: "warm spice", tobacco: "smoke",
};
export function smellWords(p: Perfume): string[] {
  const notes = [...p.top_notes, ...p.heart_notes, ...p.base_notes].map((n) => noteWords[n.toLowerCase()]).filter(Boolean);
  return [...new Set([...(familyWords[p.scent_family] ?? []), ...notes])];
}
/** What each sign's behaviour smells like, as the same tags. */
export const signSmellWords: Record<string, string[]> = {
  Aries: ["warm spice", "bright", "smoke"], Taurus: ["bakery", "fresh flowers", "dry wood"], Gemini: ["orange peel", "crushed herbs", "cool air"],
  Cancer: ["warm skin", "warm blanket", "clean laundry"], Leo: ["warm spice", "bright", "warm blanket"], Virgo: ["clean laundry", "crushed herbs", "pencil shavings"],
  Libra: ["fresh flowers", "soft", "clean laundry"], Scorpio: ["smoke", "old jacket", "warm skin"], Sagittarius: ["warm spice", "dry wood", "orange peel"],
  Capricorn: ["pencil shavings", "dry wood", "old jacket"], Aquarius: ["cool air", "wet pavement", "orange peel"], Pisces: ["soft", "fresh flowers", "wet pavement"],
};
export function pickBySmell(sign: string, perfumes: Perfume[]): Perfume | null {
  const want = signSmellWords[sign] ?? [];
  let best: Perfume | null = null, score = -1;
  for (const p of perfumes) {
    const s = smellWords(p).filter((w) => want.includes(w)).length;
    if (s > score) { best = p; score = s; }
  }
  return best;
}
