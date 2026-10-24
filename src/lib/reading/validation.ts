const sentences = (s: string) => s.split(/(?<=[.!?])\s+/u).filter(Boolean);
export function voiceIssue(parts: string[], lang: string): string | null {
  const all = parts.join(" ").toLowerCase();
  const banned = ["enveloping", "tender notes", "leans toward", "resonate", "embrace", "journey", "energy", "essence", "vibration", "aura", "cosmic", "universe", "stupid", "pathetic", "worthless", ...(lang === "vi" ? ["hành trình", "bao bọc", "vũ trụ", "rung động", "mày", "hãy", "có xu hướng", "tuy nhiên", "vì vậy", "mang lại", "nhằm"] : [])];
  const hit = banned.find((w) => new RegExp(`(?:^|[^\\p{L}])${w}(?=$|[^\\p{L}])`, "iu").test(all));
  if (hit) return `banned word: ${hit}`;
  if (/[!！]|\p{Extended_Pictographic}/u.test(all)) return "decoration";
  for (const part of parts) for (const s of sentences(part)) if (s.trim().split(/\s+/u).length > (lang === "vi" ? 30 : 22)) return "sentence too long";
  if (lang === "vi" && (all.match(/(?:^|[^\p{L}])bạn(?=$|[^\p{L}])/gu) ?? []).length > 1) return "repeated pronoun";
  return null;
}
export function validate(r: { truth: string; cost: string; scent: string; ritual?: string; sections?: string[]; blocks?: string[]; summary?: string }, lang: string): string | null {
  if (!r || typeof r.truth !== "string" || typeof r.cost !== "string" || typeof r.scent !== "string") return "bad shape";
  const issue = voiceIssue([r.truth, r.cost, r.scent, r.ritual ?? "", ...(r.sections ?? []), ...(r.blocks ?? []), r.summary ?? ""], lang);
  if (issue) return issue;
  if (sentences(r.truth).length < 2 || sentences(r.truth).length > 4 || sentences(r.cost).length !== 1 || sentences(r.scent).length < 2 || sentences(r.scent).length > 3) return "wrong sentence count";
  return null;
}