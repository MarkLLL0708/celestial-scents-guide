import { en } from "@/i18n/en";
import { vi } from "@/i18n/vi";
import { DateTime } from "luxon";
import { perfumes, demoChart, cities } from "./seed";
import { buildChart, natalLongitudes, toTransit } from "@/lib/astro/to-chart";
import { aspectsBetween } from "@/lib/astro/aspects";
import { bodyLongitudes } from "@/lib/astro/placements";
import { dayFor, localNoon, weekFor } from "@/lib/astro/today";
import { pickLine, quietBank, summaryBank, type BlockSlot } from "@/lib/astro/text-bank";
import type {
  Perfume,
  BirthProfile,
  Chart,
  CityHit,
  Prefs,
  Body,
  Block,
  WeekEntry,
  Recs,
  ChartResult,
  CartItem,
  Evidence,
  AstroAnswer,
  ChartRecord,
  Reading,
  Ritual,
  RitualTheme,
  Shelf,
  ShelfEntry,
  Theme,
  Today,
  Topic,
} from "./types";
import {
  firstRitualOfTheme,
  readingFor,
  ritualFor,
  ritualIds,
  shelfPlan,
  shelfReason,
  todayFor,
  topics,
} from "./astro-mock";
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
// ---------- real astrology engine (runs in the browser; birth details never leave it) ----------
const CHART_KEY = "natal-notes:chart";
export const DEMO_ID = "demo";

export async function searchCities(query: string, lang: "en" | "vi"): Promise<CityHit[]> {
  const q = query.trim();
  if (!q) return [];
  const fallback = () =>
    cities.filter((c) => c.city.toLowerCase().includes(q.toLowerCase())).slice(0, 5);
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=${lang}&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("GEOCODE_FAILED");
    const json = (await res.json()) as {
      results?: {
        name: string;
        admin1?: string;
        country?: string;
        latitude: number;
        longitude: number;
        timezone?: string;
      }[];
    };
    const hits = (json.results ?? [])
      .filter((r) => r.timezone)
      .map((r) => ({
        city: r.name,
        region: r.admin1 ?? "",
        country: r.country ?? "",
        lat: r.latitude,
        lon: r.longitude,
        timezone: r.timezone ?? "UTC",
      }));
    return hits.length ? hits : fallback();
  } catch {
    return fallback();
  }
}

export async function computeChart(profile: BirthProfile): Promise<Chart> {
  const c =
    profile.lat !== undefined && profile.lon !== undefined && profile.timezone
      ? { lat: profile.lat, lon: profile.lon, timezone: profile.timezone }
      : cities.find((x) => x.city === profile.city);
  if (!c) throw new Error("NO_PLACE");
  return buildChart({
    year: profile.year,
    month: profile.month,
    day: profile.day,
    hour: profile.hour,
    minute: profile.minute,
    lat: c.lat,
    lon: c.lon,
    timezone: c.timezone,
  });
}

/** Keeps one chart in sessionStorage so a reload keeps it. Nothing else is stored. */
export function storeChart(name: string, chart: Chart): ChartRecord {
  const record: ChartRecord = {
    id: `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    name,
    chart,
  };
  sessionStorage.setItem(CHART_KEY, JSON.stringify(record));
  return record;
}
function readStored(): ChartRecord | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(CHART_KEY);
  return raw ? (JSON.parse(raw) as ChartRecord) : null;
}
/** Current chart id: the stored one if present, else the demo chart. */
export function currentChartId(): string {
  try {
    return readStored()?.id ?? DEMO_ID;
  } catch {
    return DEMO_ID;
  }
}
export function clearChart(): void {
  try {
    sessionStorage.removeItem(CHART_KEY);
  } catch {
    /* storage unavailable: nothing to clear */
  }
}
const demoRecord = (): ChartRecord => ({ id: DEMO_ID, name: "An", chart: demoChart });
function loadChart(id: string): ChartRecord {
  if (id === DEMO_ID) return demoRecord();
  const r = readStored();
  if (!r || r.id !== id) throw new Error("NOT_FOUND");
  return r;
}
const skipFor = (c: Chart): Body[] => (c.birthTimeKnown ? [] : ["moon"]);
const seedOf = (c: Chart, date: string) =>
  Math.floor(c.details.sun.longitude * 7 + c.details.moon.longitude * 3) +
  Number(date.replaceAll("-", "")) % 97;
const ritualForTheme = (theme: RitualTheme) => firstRitualOfTheme(theme);
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
  return wait(loadChart(id));
}

export async function getReading(chartId: string, topic: Topic, lang: "en" | "vi"): Promise<Reading> {
  if (!topics.includes(topic)) throw new Error("NOT_FOUND");
  const { chart } = loadChart(chartId);
  const d = chart.details;
  const pick = (body: Body | "rising") => {
    const p = body === "rising" ? d.rising : d[body];
    return p ? [{ body, sign: p.sign, degree: Math.floor(p.degree) }] : [];
  };
  const by: Record<Topic, (Body | "rising")[]> = {
    you: ["sun", "moon", "rising"],
    love: ["venus", "moon"],
    work: ["mercury", "saturn", "mars"],
    luck: ["jupiter"],
  };
  const reading: Reading = { ...readingFor(topic, lang), placements: by[topic].flatMap(pick) };
  if (topic === "luck") {
    const best = getWeekSync(chart)
      .filter((w): w is WeekEntry & { transit: Transit } => w.transit !== null)
      .sort((a, b) => b.transit.strength - a.transit.strength || a.transit.orb - b.transit.orb)[0];
    reading.week = best ? { transit: best.transit, date: best.date } : null;
  }
  return wait(reading);
}

function getWeekSync(chart: Chart): WeekEntry[] {
  return weekFor(natalLongitudes(chart), skipFor(chart)).map((w) => ({
    date: w.date,
    transit: w.aspect ? toTransit(w.aspect) : null,
  }));
}
export async function getWeek(chartId: string): Promise<WeekEntry[]> {
  return wait(getWeekSync(loadChart(chartId).chart));
}

/** date is the visitor's local calendar day (YYYY-MM-DD); the instant used is local noon. */
export async function getToday(chartId: string, date: string, lang: "en" | "vi"): Promise<Today> {
  const { chart } = loadChart(chartId);
  const plan = dayFor(natalLongitudes(chart), localNoon(date), skipFor(chart));
  const seed = seedOf(chart, date);
  const block = (slot: BlockSlot, a: typeof plan.working): Block | null =>
    a ? { transit: toTransit(a), text: pickLine(lang, slot, a.theme, seed) } : null;
  const lead = plan.working ?? plan.pushing ?? plan.protect;
  return wait({
    date,
    summary: lead ? summaryBank[lang][lead.theme] : quietBank[lang],
    tone: plan.tone,
    working: block("working", plan.working),
    pushing: block("pushing", plan.pushing),
    protect: block("protect", plan.protect),
    quiet: plan.aspects.length ? undefined : quietBank[lang],
    ritualId: ritualForTheme(plan.ritualTheme),
  });
}
export const todayDate = () => DateTime.local().toISODate() ?? "";

export async function askNotes(
  question: string,
  category: Theme,
  chartId: string,
  lang: "en" | "vi",
): Promise<AstroAnswer> {
  if (!question.trim()) throw new Error("EMPTY_QUESTION");
  const { chart } = loadChart(chartId);
  const date = todayDate();
  const plan = dayFor(natalLongitudes(chart), localNoon(date), skipFor(chart));
  const hit = plan.aspects.find((a) => a.theme === category) ?? plan.aspects[0];
  // Fallback when the sky is empty against this chart: use the strongest aspect over the week.
  const aspect =
    hit ??
    aspectsBetween(bodyLongitudes(localNoon(date)), natalLongitudes(chart), {
      skipNatal: skipFor(chart),
    })[0];
  const theme = aspect?.theme ?? category;
  const slot: BlockSlot = aspect?.kind === "hard" ? "pushing" : "working";
  const line = pickLine(lang, slot, theme, seedOf(chart, date) + question.trim().length);
  return wait({
    transit: aspect
      ? toTransit(aspect)
      : { transiting: "moon", aspect: "conjunct", natal: "sun", orb: 0, theme, strength: 1 },
    answer: `“${question.trim()}” — ${line}`,
    ritualId: ritualForTheme(plan.ritualTheme === "calm" ? "calm" : theme),
  });
}
export async function listRituals(lang: "en" | "vi", theme?: RitualTheme): Promise<Ritual[]> {
  const all = ritualIds.map((id) => ritualFor(id, lang)).filter((r): r is Ritual => r !== null);
  return wait(theme ? all.filter((r) => r.theme === theme) : all);
}
export async function getRitual(id: string, lang: "en" | "vi"): Promise<Ritual> {
  const r = ritualFor(id, lang);
  if (!r) throw new Error("NOT_FOUND");
  return wait(r);
}
export async function getShelf(chartId: string, lang: "en" | "vi"): Promise<Shelf> {
  void chartId;
  const reasons = shelfReason(lang);
  const entry = (k: keyof typeof shelfPlan, reason: string): ShelfEntry | null => {
    const plan = shelfPlan[k];
    const perfume = inventory.find((p) => p.id === plan.perfumeId);
    const ritual = ritualFor(plan.ritualId, lang);
    if (!perfume || !ritual) return null;
    return {
      perfume,
      score: 0,
      reason,
      evidence: { planet: plan.planet, sign: plan.sign, why: reason },
      ritualId: ritual.id,
      ritualTitle: ritual.title,
    };
  };
  return wait({
    forChart: entry("forChart", reasons.chart),
    forWeek: entry("forWeek", reasons.week),
    forShadow: entry("forShadow", reasons.shadow),
  });
}
let savedRituals: string[] = [];
export async function saveRitual(id: string): Promise<string[]> {
  if (!savedRituals.includes(id)) savedRituals = [...savedRituals, id];
  return wait(savedRituals);
}
export async function listSavedRituals(lang: "en" | "vi"): Promise<Ritual[]> {
  return wait(savedRituals.map((id) => ritualFor(id, lang)).filter((r): r is Ritual => r !== null));
}
