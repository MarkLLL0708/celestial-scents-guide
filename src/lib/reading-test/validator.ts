const SIGNS = [["Aries","Bạch Dương"],["Taurus","Kim Ngưu"],["Gemini","Song Tử"],["Cancer","Cự Giải"],["Leo","Sư Tử"],["Virgo","Xử Nữ"],["Libra","Thiên Bình"],["Scorpio","Bọ Cạp"],["Sagittarius","Nhân Mã"],["Capricorn","Ma Kết"],["Aquarius","Bảo Bình"],["Pisces","Song Ngư"]];
const JARGON = ["sextile","trine","square","opposition","conjunction","natal","transit","ruling","enveloping","tender notes","leans toward","sits in","resonates","journey","energy","essence","vibration","aura","cosmic","universe","tam hợp","đối xung","vuông góc","năng lượng","hành trình","vũ trụ","rung động","tâm thế","nội tại"];
const FORMAL_EN = ["you are allowed","you're allowed","it is important","it's important","consider ","notice ","you may find","tends to","perhaps","however","therefore","moreover","remember that","it is okay","it's okay to","seek ","require","individual","appear to","indicates"];
const FORMAL_VI = ["tuy nhiên","do đó","vì vậy","mang lại","thể hiện","cho thấy","nhìn chung","đồng thời","hãy "];
const AI_TELLS_VI = ["một cách","điều này","nhằm","cũng như","không chỉ","bên cạnh đó","đóng vai trò","có xu hướng","thật sự là một","—"," – "];
const COLLOQ_VI = ["thôi","chứ","luôn","nha","nhé","đấy","đâu","cứ","kiểu","lố","ra hồn","hẵng","đi ","nhỉ","á ","thì "];
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const sents = (s: string) => s.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);

function partsOf(out: any, surface: string): string[] {
  return surface === "hook" ? out?.lines ?? [] : surface === "chartLine" ? [out?.text] : [out?.headline, out?.body, out?.perfume, out?.ritual];
}

export function validate(out: any, surface: string, lang: "en" | "vi", allowedSigns: string[]): string | null {
  const parts = partsOf(out, surface);
  if (parts.some((p) => typeof p !== "string" || !p.trim())) return "missing field";
  const text = parts.join(" ").toLowerCase();
  const bad = [...JARGON, ...(lang === "en" ? FORMAL_EN : FORMAL_VI)].find((w) => text.includes(w));
  if (bad) return "banned or too formal: " + bad.trim();
  for (const [en, vi] of SIGNS) {
    const mentioned = text.includes(en.toLowerCase()) || text.includes(vi.toLowerCase());
    if (mentioned && (surface === "hook" || surface === "answer" || !allowedSigns.includes(en))) return "wrong or unwanted sign: " + en;
  }
  const max = lang === "vi" ? 24 : 18;
  for (const p of parts) for (const s of sents(p)) if (words(s) > max) return "sentence too long: " + s;
  if (surface === "hook" && (parts.length !== 3 || parts.some((p) => words(p) > (lang === "vi" ? 10 : 8)))) return "hook shape";
  if (surface === "chartLine" && (sents(parts[0]).length > 2 || words(parts[0]) > 40)) return "chartLine too long";
  if (surface === "answer") {
    const n = sents(out.body).length;
    if (n < 4 || n > 6) return "body must be 4 to 6 sentences";
    if (words(out.headline) > 9) return "headline too long";
    if (lang === "en" && !/\b\w+'(s|re|t|ll|d|ve|m)\b/i.test(out.body)) return "sounds formal: use contractions";
  }
  return null;
}

export function naturalVI(out: any, surface: string): string | null {
  const text = partsOf(out, surface).join(" ").toLowerCase();
  const tell = AI_TELLS_VI.find((w) => text.includes(w));
  if (tell) return "AI-sounding phrase: " + tell.trim();
  if (/(?<!thật)\ssự\s/.test(" " + text + " ")) return "noun-heavy: sự";
  if (/không phải .+ mà là/.test(text)) return "AI contrast pattern";
  const ban = (text.match(/bạn/g) || []).length;
  if (ban > 1) return "too many 'bạn' (" + ban + "): drop the pronoun";
  if (surface === "answer") {
    const hits = COLLOQ_VI.reduce((n, w) => n + (out.body.toLowerCase().split(w).length - 1), 0);
    if (hits < 3) return "not conversational enough";
    if (/\bhãy\b/.test(text)) return "too formal: hãy";
  }
  return null;
}

export const check = (out: any, surface: string, lang: "en" | "vi", allowedSigns: string[]) =>
  validate(out, surface, lang, allowedSigns) || (lang === "vi" ? naturalVI(out, surface) : null);
