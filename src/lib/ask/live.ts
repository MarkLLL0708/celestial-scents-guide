/** Pure rules for live Ask, shared by browser and server. */
export const ASK_LIMITS = { perHour: 8, perDay: 20, globalPerDay: 2000 } as const;

export type LimitResult = "ok" | "hour" | "day" | "global";
export function checkLimit(hourCount: number, dayCount: number, globalCount: number): LimitResult {
  if (globalCount >= ASK_LIMITS.globalPerDay) return "global";
  if (dayCount >= ASK_LIMITS.perDay) return "day";
  if (hourCount >= ASK_LIMITS.perHour) return "hour";
  return "ok";
}

/** Live answers may name the ritual and perfume, but never promise outcomes. */
export function validateLiveAnswer(body: string): string[] {
  const flags: string[] = [];
  const words = body.trim().split(/\s+/u).filter(Boolean).length;
  if (words < 35 || words > 130) flags.push("word_count");
  if (/[!！]/u.test(body)) flags.push("exclamation");
  if (/\p{Extended_Pictographic}/u.test(body)) flags.push("emoji");
  if (
    /\b(pregnan\w*|death|die|cure|disease|diagnos\w*|lawsuit|lottery|guarantee\w*|destiny|cosmic|universe)\b/iu.test(body) ||
    /(^|[^\p{L}])(mang thai|chết|chữa bệnh|bệnh|xổ số|đảm bảo|định mệnh|vũ trụ)(?=$|[^\p{L}])/iu.test(body)
  )
    flags.push("banned_word");
  if (/https?:\/\//iu.test(body)) flags.push("link");
  return flags;
}

export const normaliseQuestion = (q: string) =>
  q.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
