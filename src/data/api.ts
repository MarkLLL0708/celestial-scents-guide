import { en } from "@/i18n/en";
import { vi } from "@/i18n/vi";
import {
  buildShelf,
  perfumeForRitual,
  ritualForPerfume,
  type MatchRitual,
  type Pick,
} from "@/lib/match/shelf";
import { describePick } from "@/lib/match/text";
import { parseCatalogue, type ImportError } from "@/lib/match/catalogue";
import { applyFilters } from "@/lib/match/filters";
import { scorePerfume, shadowChart } from "@/lib/match/score";
import { fallbackRitualId } from "@/config/scentMap";
import { DateTime } from "luxon";
import { perfumes, demoChart, cities } from "./seed";
import { buildChart, natalLongitudes, toTransit } from "@/lib/astro/to-chart";
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
  CartItem,
  AstroAnswer,
  ChartRecord,
  Reading,
  Ritual,
  RitualTheme,
  Shelf,
  Theme,
  Today,
  Topic,
  Transit,
} from "./types";
import { firstRitualOfTheme, readingFor, ritualFor, ritualIds, topics } from "./astro-mock";
export * from "./types";
const wait = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), 600));
let inventory = structuredClone(perfumes);
let items: CartItem[] = [];
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
export function storeChart(name: string, chart: Chart, prefs?: Prefs): ChartRecord {
  const record: ChartRecord = {
    id: `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    name,
    chart,
    prefs,
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
  (Number(date.replaceAll("-", "")) % 97);
const ritualForTheme = (theme: RitualTheme) => firstRitualOfTheme(theme);
export async function listSavedCharts(): Promise<
  { id: string; profile: BirthProfile; chart: Chart; date: string }[]
> {
  return wait([]);
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
/** Admin CSV import: validates against the controlled vocabularies, errors carry row numbers. */
export async function importPerfumesCsv(
  file: File,
): Promise<{ imported: number; errors: ImportError[] }> {
  const { perfumes: rows, errors } = parseCatalogue(await file.text());
  inventory = [...inventory.filter((p) => !rows.some((r) => r.id === p.id)), ...rows];
  return wait({ imported: rows.length, errors });
}
export async function updatePerfume(p: Perfume): Promise<Perfume> {
  inventory = inventory.map((v) => (v.id === p.id ? p : v));
  return wait(p);
}

export async function getChartById(id: string): Promise<ChartRecord> {
  return wait(loadChart(id));
}

export async function getReading(
  chartId: string,
  topic: Topic,
  lang: "en" | "vi",
): Promise<Reading> {
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
  const aspect = hit;
  const theme = aspect?.theme ?? category;
  const slot: BlockSlot = aspect?.kind === "hard" ? "pushing" : "working";
  const line = pickLine(lang, slot, theme, seedOf(chart, date) + question.trim().length);
  return wait({
    transit: aspect
      ? toTransit(aspect)
      : { transiting: "moon", aspect: "conjunct", natal: "sun", orb: 0, theme, strength: 1 },
    answer: line,
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
// ---------- scent matching (pure functions in src/lib/match) ----------
const dict = (lang: "en" | "vi") => (lang === "vi" ? vi : en);
/** Matching always reads the English note list, whatever the screen language. */
const matchRitual = (id: string, lang: "en" | "vi"): MatchRitual | null => {
  const en_ = ritualFor(id, "en");
  const shown = ritualFor(id, lang);
  return en_ && shown ? { id, title: shown.title, noteFamily: en_.noteFamily } : null;
};
const allMatchRituals = (lang: "en" | "vi") =>
  ritualIds.map((id) => matchRitual(id, lang)).filter((r): r is MatchRitual => r !== null);
function todayRitualId(chart: Chart): string {
  try {
    const plan = dayFor(natalLongitudes(chart), localNoon(todayDate()), skipFor(chart));
    return ritualForTheme(plan.ritualTheme);
  } catch {
    return fallbackRitualId;
  }
}
const toEntry = (pick: Pick | null, lang: "en" | "vi") => {
  if (!pick) return null;
  const { evidence, reason } = describePick(dict(lang), pick);
  const ritual =
    pick.kind === "week" ? pick.ritual : ritualForPerfume(pick.perfume, allMatchRituals(lang));
  return {
    perfume: pick.perfume,
    score: Math.round(pick.score * 10) / 10,
    reason,
    evidence,
    ritualId: ritual?.id ?? fallbackRitualId,
    ritualTitle: ritual?.title ?? "",
  };
};
export async function getShelf(
  chartId: string,
  lang: "en" | "vi",
  ritualId?: string,
): Promise<Shelf> {
  const { chart, prefs } = loadChart(chartId);
  const ritual =
    matchRitual(ritualId ?? todayRitualId(chart), lang) ?? matchRitual(fallbackRitualId, lang);
  if (!ritual) throw new Error("NO_RITUAL");
  const picks = buildShelf(inventory, chart, prefs, ritual);
  return wait({
    forChart: toEntry(picks.forChart, lang),
    forWeek: toEntry(picks.forWeek, lang),
    forShadow: toEntry(picks.forShadow, lang),
  });
}
/** The ritual page card. Without a chart of the visitor's own, ritual notes decide. */
export async function getPerfumeForRitual(ritualId: string, lang: "en" | "vi", chartId?: string) {
  const ritual = matchRitual(ritualId, lang);
  if (!ritual) throw new Error("NOT_FOUND");
  const record =
    chartId && chartId !== DEMO_ID
      ? (() => {
          try {
            return loadChart(chartId);
          } catch {
            return null;
          }
        })()
      : null;
  return wait(
    toEntry(perfumeForRitual(inventory, ritual, record?.chart ?? null, record?.prefs), lang),
  );
}
/** Everything the /dev/match page shows. */
export function getMatchDebug(chartId: string, ritualId: string, lang: "en" | "vi") {
  const { chart, prefs } = loadChart(chartId);
  const ritual = matchRitual(ritualId, lang) ?? matchRitual(fallbackRitualId, lang);
  if (!ritual) throw new Error("NO_RITUAL");
  const { excluded } = applyFilters(inventory, prefs);
  const shadow = shadowChart(chart);
  const picks = buildShelf(inventory, chart, prefs, ritual);
  return {
    chart,
    prefs,
    ritual,
    shadow,
    rows: inventory.map((p) => ({
      perfume: p,
      breakdown: scorePerfume(p, chart),
      shadowTotal: scorePerfume(p, shadow).total,
      excluded: excluded.find((x) => x.perfume.id === p.id)?.why ?? null,
    })),
    shelf: {
      forChart: toEntry(picks.forChart, lang),
      forWeek: toEntry(picks.forWeek, lang),
      forShadow: toEntry(picks.forShadow, lang),
    },
  };
}
let savedRituals: string[] = [];
export async function saveRitual(id: string): Promise<string[]> {
  if (!savedRituals.includes(id)) savedRituals = [...savedRituals, id];
  return wait(savedRituals);
}
export async function listSavedRituals(lang: "en" | "vi"): Promise<Ritual[]> {
  return wait(savedRituals.map((id) => ritualFor(id, lang)).filter((r): r is Ritual => r !== null));
}
