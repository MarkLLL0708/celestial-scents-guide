import { en } from "@/i18n/en";
import { vi } from "@/i18n/vi";
import { perfumes, demoChart } from "./seed";
import type {
  Perfume,
  BirthProfile,
  Chart,
  Prefs,
  Recs,
  ChartResult,
  CartItem,
  Evidence,
  AstroAnswer,
  ChartRecord,
  Reading,
  Ritual,
  Theme,
  Today,
  Topic,
} from "./types";
import { answerFor, readingFor, ritualFor, ritualIds, todayFor, topics } from "./astro-mock";
export * from "./types";
const wait = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), 600));
let inventory = structuredClone(perfumes);
let items: CartItem[] = [];
let saved: ChartResult[] = [];
export async function getPerfumes(filters?: {
  family?: string;
  style?: string;
  maxPrice?: number;
}): Promise<Perfume[]> {
  return wait(
    inventory.filter(
      (p) =>
        (!filters?.family || p.scent_family === filters.family) &&
        (!filters?.style || p.style === filters.style) &&
        (!filters?.maxPrice || p.price <= filters.maxPrice),
    ),
  );
}
export async function getPerfume(id: string): Promise<Perfume | null> {
  return wait(inventory.find((p) => p.id === id) ?? null);
}
export async function computeChart(profile: BirthProfile): Promise<Chart> {
  return wait({ ...demoChart, rising: profile.hour === null ? null : demoChart.rising });
}
export async function getRecommendations(chart: Chart, prefs: Prefs): Promise<Recs> {
  const candidates = inventory.filter(
    (p) =>
      !p.sold_out &&
      (!prefs.style || prefs.style === "any" || p.style === prefs.style) &&
      !prefs.avoid.some((a) =>
        [p.name, p.scent_family, ...p.top_notes, ...p.heart_notes, ...p.base_notes]
          .join(" ")
          .toLowerCase()
          .includes(a.toLowerCase()),
      ) &&
      (prefs.budget === "any" ||
        (prefs.budget === "low"
          ? p.price <= 80
          : prefs.budget === "mid"
            ? p.price > 80 && p.price <= 150
            : p.price > 150)),
  );
  if (!candidates.length) throw new Error("NO_MATCHES");
  const scores = [94, 88, 84, 79, 73, 61];
  const reasons = [en.reason1, en.reason2, en.reason3, en.reason4, en.reason5, en.reason6];
  const evidence: Evidence[] = [
    { planet: "sun", sign: chart.sun, why: "why1" },
    { planet: "moon", sign: chart.moon, why: "why2" },
    { planet: "rising", sign: chart.rising ?? chart.sun, why: "why3" },
    { planet: "venus", sign: chart.venus, why: "why4" },
    { planet: "mars", sign: chart.mars, why: "why5" },
    { planet: "mercury", sign: chart.mercury, why: "why6" },
  ];
  if (!chart.rising) evidence[2] = { planet: "venus", sign: chart.venus, why: "why3" };
  const matches = Array.from({ length: 6 }, (_, i) => ({
    perfume: candidates[i % candidates.length],
    score: scores[i],
    reason: reasons[i],
    evidence: evidence[i],
  }));
  return wait({ signature: matches[0], others: matches.slice(1, 5), shadow: matches[5] });
}
export async function saveChart(result: ChartResult): Promise<{ id: string }> {
  saved = [result, ...saved.filter((r) => r.id !== result.id)];
  return wait({ id: result.id });
}
export async function listSavedCharts(): Promise<ChartResult[]> {
  return wait(saved);
}
export async function getCart(): Promise<CartItem[]> {
  return wait(items);
}
export async function addToCart(id: string): Promise<CartItem[]> {
  const p = inventory.find((p) => p.id === id);
  if (p && !p.sold_out) {
    const item = items.find((i) => i.perfume.id === id);
    if (item) item.quantity++;
    else items.push({ perfume: p, quantity: 1 });
  }
  return getCart();
}
export async function updateQty(id: string, n: number): Promise<CartItem[]> {
  items = items.map((i) =>
    i.perfume.id === id ? { ...i, quantity: Math.max(1, Math.floor(n)) } : i,
  );
  return getCart();
}
export async function removeFromCart(id: string): Promise<CartItem[]> {
  items = items.filter((i) => i.perfume.id !== id);
  return getCart();
}
export const cart = { getCart, addToCart, updateQty, removeFromCart };
export async function login(email: string): Promise<{ ok: boolean }> {
  return wait({ ok: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) });
}
// CSV parsing supports escaped quotes and quoted commas, without a server dependency.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  row.push(field);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}
export async function importPerfumesCsv(
  file: File,
): Promise<{ imported: number; errors: { row: number; message: string }[] }> {
  const rows = parseCsv(await file.text());
  const headers = rows.shift() ?? [];
  const errors: { row: number; message: string }[] = [];
  const imported: Perfume[] = [];
  rows.forEach((r, i) => {
    const o = Object.fromEntries(headers.map((h, j) => [h.trim(), r[j]?.trim() ?? ""]));
    if (
      !o.name ||
      !o.scent_family ||
      !Number.isFinite(Number(o.price)) ||
      Number(o.price) <= 0 ||
      !["feminine", "masculine", "unisex"].includes(o.style) ||
      ![50, 100].includes(Number(o.size_ml)) ||
      Number(o.intensity) < 1 ||
      Number(o.intensity) > 5
    ) {
      errors.push({ row: i + 2, message: "importError" });
      return;
    }
    imported.push({
      id: o.id || `import-${Date.now()}-${i}`,
      name: o.name,
      brand: o.brand || "Atelier Sample",
      price: Number(o.price),
      currency: o.currency || "USD",
      size_ml: Number(o.size_ml),
      scent_family: o.scent_family,
      style: o.style as Perfume["style"],
      intensity: Number(o.intensity),
      top_notes: (o.top_notes || "").split("|").filter(Boolean),
      heart_notes: (o.heart_notes || "").split("|").filter(Boolean),
      base_notes: (o.base_notes || "").split("|").filter(Boolean),
      mood_tags: (o.mood_tags || "").split("|").filter(Boolean),
      sold_out: o.sold_out === "true",
    });
  });
  inventory = [...inventory, ...imported];
  return wait({ imported: imported.length, errors });
}
export async function updatePerfume(p: Perfume): Promise<Perfume> {
  inventory = inventory.map((v) => (v.id === p.id ? p : v));
  return wait(p);
}

export async function getChartById(id: string): Promise<ChartRecord> {
  if (id !== "demo" && !saved.some((r) => r.id === id)) throw new Error("NOT_FOUND");
  const r = saved.find((x) => x.id === id);
  return wait({ id, name: r?.profile.name || "An", chart: r?.chart ?? demoChart });
}
export async function getReading(
  chartId: string,
  topic: Topic,
  lang: "en" | "vi",
): Promise<Reading> {
  void chartId;
  if (!topics.includes(topic)) throw new Error("NOT_FOUND");
  return wait(readingFor(topic, lang));
}
export async function getToday(chartId: string, date: string, lang: "en" | "vi"): Promise<Today> {
  void chartId;
  return wait(todayFor(date, lang));
}
export async function askNotes(
  question: string,
  category: Theme,
  chartId: string,
  lang: "en" | "vi",
): Promise<AstroAnswer> {
  void chartId;
  if (!question.trim()) throw new Error("EMPTY_QUESTION");
  return wait(answerFor(question, category, lang));
}
export async function listRituals(lang: "en" | "vi"): Promise<Ritual[]> {
  return wait(ritualIds.map((id) => ritualFor(id, lang)).filter((r): r is Ritual => r !== null));
}
export async function getRitual(id: string, lang: "en" | "vi"): Promise<Ritual> {
  const r = ritualFor(id, lang);
  if (!r) throw new Error("NOT_FOUND");
  return wait(r);
}
