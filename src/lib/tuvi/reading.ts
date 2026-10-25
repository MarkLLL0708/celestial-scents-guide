/** Pure composer: picks keyed blocks from a computed chart. No AI, no randomness. */
import type { ElementCounts } from "@/lib/reading/balance";
import { BRANCH_VI, BRIGHT_VI, GLOSSARY, LINES, LUCKY, MUTAGEN_VI, PALACE, RULES, SHA, STARS, STAR_VI, STEM_VI, type Bucket } from "./blocks";
import type { TuviChart, TuviPalace, TuviStar } from "./types";

export const TOPICS = [
  { key: "overview", palace: "命宫", label: "Tổng quan" },
  { key: "wealth", palace: "财帛", label: "Tài vận" },
  { key: "career", palace: "官禄", label: "Sự nghiệp" },
  { key: "love", palace: "夫妻", label: "Tình cảm" },
  { key: "personality", palace: "命宫", label: "Tính cách" },
  { key: "health", palace: "疾厄", label: "Sức khỏe" },
  { key: "siblings", palace: "兄弟", label: "Anh em, hùn hạp" },
  { key: "children", palace: "子女", label: "Con cái" },
  { key: "travel", palace: "迁移", label: "Đi xa" },
  { key: "friends", palace: "仆役", label: "Bạn bè, quý nhân" },
  { key: "property", palace: "田宅", label: "Nhà đất" },
  { key: "fortune", palace: "福德", label: "Phúc đức" },
  { key: "parents", palace: "父母", label: "Cha mẹ, cấp trên" },
] as const;
export type TopicKey = (typeof TOPICS)[number]["key"];

const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const isBright = (b: string) => ["庙", "旺", "得"].includes(b);
const isDim = (b: string) => ["不", "陷"].includes(b);
const viStar = (s: TuviStar) => STAR_VI[s.name] ?? s.name;

export const palaceOf = (c: TuviChart, name: string) => c.palaces.find((p) => p.name === name)!;
export const opposite = (c: TuviChart, p: TuviPalace) => c.palaces.find((q) => q.branch === BRANCHES[(BRANCHES.indexOf(p.branch) + 6) % 12])!;
/** Major stars that rule a palace; empty palaces borrow from the opposite palace. */
export function rulers(c: TuviChart, p: TuviPalace) {
  return p.major.length ? { stars: p.major, borrowed: false } : { stars: opposite(c, p).major, borrowed: true };
}
export const nominalAge = (c: TuviChart, year: number) => year - c.birthYear + 1;
export const yearGanZhi = (year: number) => `${STEM_VI[STEMS[(year - 4) % 10]]} ${BRANCH_VI[BRANCHES[(year - 4) % 12]]}`;

export interface Reading {
  keys: string[];
  diagHead: string;
  diag: string;
  adviceHead: string;
  advice: string;
  verdict: string;
  core: string[];
  rules: string[];
  glossary: [string, string][];
}

function field(palace: string, topic: TopicKey) {
  if (topic === "personality") return "flaw" as const;
  return ({ 命宫: "self", 夫妻: "partner", 官禄: "work", 财帛: "money", 疾厄: "health" } as const)[palace as "命宫"] ?? ("people" as const);
}

export function composeReading(c: TuviChart, topic: TopicKey, year: number): Reading {
  const t = TOPICS.find((x) => x.key === topic)!;
  const p = palaceOf(c, t.palace);
  const info = PALACE[p.name];
  const { stars, borrowed } = rulers(c, p);
  const keys: string[] = [`PALACE_${p.name}`];
  const rules: string[] = [];
  const terms = new Set<string>(["Chính tinh"]);
  const main = stars[0];
  const block = main ? STARS[main.name] : undefined;
  const diag: string[] = [];

  if (borrowed) {
    keys.push("VCD_BORROW");
    rules.push(RULES.VCD);
    terms.add("Vô chính diệu");
    diag.push(LINES.vcd(stars.map(viStar).join(" + ") || "sao cung đối"));
  }
  if (block && main) {
    const f = field(p.name, topic);
    keys.push(`STAR_${main.name}_${f}`);
    if (topic === "personality") diag.push(block.self.split(". ")[0] + ".", block.flaw);
    else diag.push(f === "people" ? block.people.replace(/^Ở chỗ này/, `Chuyện ${info.domain}`) : block[f]);
    if (isBright(main.brightness)) { keys.push(`BRIGHT_${main.name}`); rules.push(RULES.BRIGHT); terms.add("Miếu / Vượng / Đắc"); diag.push(LINES.bright(viStar(main), BRIGHT_VI[main.brightness])); }
    else if (isDim(main.brightness)) { keys.push(`DIM_${main.name}`); rules.push(RULES.DIM); terms.add("Bất / Hãm"); diag.push(LINES.dim(viStar(main), BRIGHT_VI[main.brightness])); }
    const second = stars[1];
    if (second && STARS[second.name]) { keys.push(`PAIR_${second.name}`); rules.push(RULES.PAIR); diag.push(LINES.second(viStar(second), STARS[second.name].core)); }
  }
  const lucky = p.minor.filter((s) => LUCKY.includes(s.name));
  const sha = p.minor.filter((s) => SHA.includes(s.name));
  if (lucky.length) { keys.push("LUCKY"); rules.push(RULES.LUCKY); diag.push(LINES.lucky(lucky.map(viStar).join(", "))); }
  if (sha.length) { keys.push("SHA"); rules.push(RULES.SHA); terms.add("Tứ Sát"); if (sha.some((s) => s.name === "地空" || s.name === "地劫")) terms.add("Không Kiếp"); diag.push(LINES.sha(sha.map(viStar).join(", "))); }
  else { keys.push("NO_SHA"); rules.push(RULES.NO_SHA); }
  const muts = [...p.major, ...p.minor].filter((s) => s.mutagen);
  for (const s of muts) { keys.push(`MUT_${s.mutagen}`); rules.push(RULES[`M_${s.mutagen}`]); terms.add("Tứ Hóa"); diag.push(LINES.mutagen[s.mutagen](viStar(s), info.domain)); }

  if (topic === "overview") {
    const age = nominalAge(c, year);
    const cur = c.palaces.find((q) => age >= q.decade[0] && age <= q.decade[1]);
    if (cur) {
      keys.push(`DECADE_${cur.name}`);
      terms.add("Đại hạn");
      diag.push(`Đang đi đại hạn ${cur.decade[0]}–${cur.decade[1]} tuổi ở cung ${PALACE[cur.name].vi}, mười năm này trọng tâm là ${PALACE[cur.name].domain}.`);
    }
    const yp = c.palaces.find((q) => q.branch === BRANCHES[(year - 4) % 12])!;
    keys.push(`YEAR_${yp.name}`);
    terms.add("Lưu niên");
    diag.push(`Năm ${year} rơi vào cung ${PALACE[yp.name].vi}, chuyện ${PALACE[yp.name].domain} nóng nhất năm.`);
  }

  const advice = [block?.advice, info.advice, muts.some((s) => s.mutagen === "忌") ? LINES.kyAdvice : undefined].filter(Boolean) as string[];
  const dim = main ? isDim(main.brightness) : false;
  const core = [
    `Cung ${info.vi} tại ${BRANCH_VI[p.branch]} (${STEM_VI[p.stem]} ${BRANCH_VI[p.branch]})`,
    `Chính tinh: ${p.major.length ? p.major.map((s) => `${viStar(s)}${s.brightness ? ` (${BRIGHT_VI[s.brightness]})` : ""}`).join(" + ") : `vô chính diệu, mượn ${stars.map(viStar).join(" + ")}`}`,
    `Cát tinh: ${lucky.length ? lucky.map(viStar).join(", ") : "không có"}`,
    `Sát tinh: ${sha.length ? sha.map(viStar).join(", ") : "không gặp Tứ Sát"}`,
    `Tứ Hóa: ${muts.length ? muts.map((s) => `${viStar(s)} ${MUTAGEN_VI[s.mutagen]}`).join(", ") : "không có"}`,
    `Đại hạn của cung: ${p.decade[0]}–${p.decade[1]} tuổi`,
  ];
  return {
    keys,
    diagHead: p.name === "命宫" && block ? block.core : `Cung ${info.vi}${stars.length ? ` có ${stars.map(viStar).join(", ")}` : " trống sao"}`,
    diag: diag.join(" "),
    adviceHead: "Lời khuyên thẳng",
    advice: advice.join(" "),
    verdict: block ? (dim ? block.verdictDim : block.verdict) : "Cung trống thì tự mình lấp, không ai lấp hộ.",
    core,
    rules: [...new Set(rules)],
    glossary: [...terms].map((k) => [k, GLOSSARY[k]] as [string, string]),
  };
}

export interface Hooks {
  decade: { age: number; year: number; palace: string; domain: string; past: boolean };
  contradiction: string;
  yearPalace: { year: number; ganZhi: string; palace: string; domain: string };
  keys: string[];
}
export function composeHooks(c: TuviChart, year: number): Hooks {
  const age = nominalAge(c, year);
  const sorted = [...c.palaces].sort((a, b) => a.decade[0] - b.decade[0]);
  const cur = sorted.find((q) => age >= q.decade[0] && age <= q.decade[1]) ?? sorted[0];
  const past = age >= cur.decade[0];
  const menh = rulers(c, palaceOf(c, "命宫")).stars[0];
  const phu = rulers(c, palaceOf(c, "夫妻")).stars[0];
  const mb = menh && STARS[menh.name];
  const pb = phu && STARS[phu.name];
  const contradiction = mb && pb
    ? `Bản thân thì ${mb.core.charAt(0).toLowerCase()}${mb.core.slice(1)} (${viStar(menh)}), mà người mình chọn lại là ${pb.mate} (${viStar(phu)}).`
    : "Mệnh và Phu Thê đi theo hoàn cảnh, ai đến đúng lúc thì ở lại.";
  const yp = c.palaces.find((q) => q.branch === BRANCHES[(year - 4) % 12])!;
  return {
    decade: { age: cur.decade[0], year: c.birthYear + cur.decade[0] - 1, palace: PALACE[cur.name].vi, domain: PALACE[cur.name].domain, past },
    contradiction,
    yearPalace: { year, ganZhi: yearGanZhi(year), palace: PALACE[yp.name].vi, domain: PALACE[yp.name].domain },
    keys: [`HOOK_DECADE_${cur.name}`, `HOOK_PAIR_${menh?.name ?? "none"}_${phu?.name ?? "none"}`, `HOOK_YEAR_${yp.name}`],
  };
}

const BUREAU_BUCKET: Record<string, Bucket> = { 水二局: "water", 木三局: "air", 金四局: "air", 土五局: "earth", 火六局: "fire" };
const STEM_BUCKET: Record<string, Bucket> = { 甲: "air", 乙: "air", 丙: "fire", 丁: "fire", 戊: "earth", 己: "earth", 庚: "air", 辛: "air", 壬: "water", 癸: "water" };
/** Element weight: bureau ×2, year stem ×1, rulers of Mệnh and its three linked palaces ×1 each. */
export function tuviElements(c: TuviChart): ElementCounts {
  const n: ElementCounts = { fire: 0, earth: 0, air: 0, water: 0 };
  const b = BUREAU_BUCKET[c.bureau];
  if (b) n[b] += 2;
  const s = STEM_BUCKET[c.pillars.charAt(0)];
  if (s) n[s] += 1;
  const menh = palaceOf(c, "命宫");
  const linked = [menh, palaceOf(c, "财帛"), palaceOf(c, "官禄"), opposite(c, menh)];
  for (const p of linked) for (const st of rulers(c, p).stars) { const k = STARS[st.name]?.bucket; if (k) n[k] += 1; }
  return n;
}
