import { SIGN_ORDER as SIGNS } from "@/config/scentMap";
import { liveAsk, backupAsk } from "./ask.functions";
import { normaliseQuestion } from "@/lib/ask/live";
import { en } from "@/i18n/en";
import { resolveTexts } from "@/lib/library/resolve";
import { sections as librarySections, aspectKind } from "@/lib/library/keys";
import { supabase } from "@/integrations/supabase/client";
import * as cloud from "./cloud.functions";
import { chartFromStorage, recordForStorage } from "./chart-privacy";
import { vi } from "@/i18n/vi";
import {
  buildShelf,
  buildCapsule,
  perfumeForRitual,
  ritualForPerfume,
  type MatchRitual,
  type Pick,
} from "@/lib/match/shelf";
import { describePick } from "@/lib/match/text";
import { type ImportError } from "@/lib/match/catalogue";
import { applyFilters } from "@/lib/match/filters";
import { scorePerfume, shadowChart } from "@/lib/match/score";
import { fallbackRitualId } from "@/config/scentMap";
import { DateTime } from "luxon";
import { demoChart, cities } from "./seed";
import { natalLongitudes, toTransit } from "@/lib/astro/light";
/** Star maths (astronomy-engine) loads only when a chart, day or week is actually computed. */
let enginePromise: Promise<typeof import("@/lib/astro/engine")> | null = null;
const engine = () => (enginePromise ??= import("@/lib/astro/engine"));
import { quietBank, summaryBank } from "@/lib/astro/text-bank";
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
import namedPerfumes from "./perfume-names.json";
import { rankForBalance, variedRitual } from "@/lib/reading/balance";
import { pickLip } from "@/lib/lips";
import type { Planet, VoiceReading } from "./types";
const wait = <T>(value: T): Promise<T> =>
  Promise.resolve(structuredClone(value));
let inventory: Perfume[] = [];
let items: CartItem[] = [];
export async function getPerfumes(filters?: {
  family?: string;
  style?: string;
  maxPrice?: number;
}): Promise<Perfume[]> {
  let rows: Awaited<ReturnType<typeof cloud.publicPerfumes>> = [];
  try {
    rows = await cloud.publicPerfumes();
  } catch {
    rows = [];
  }
  inventory = namedPerfumes.map((entry) => {
    const live = rows.find((r) => r.id === entry.id);
    return { ...entry, ...live, smell_words: live?.smell_words ?? [], name_vi: live?.name_vi ?? entry.name_vi, story_hook: live?.story_hook ?? entry.story_hook, story_vi: live?.story_vi ?? entry.story_vi, review_note: live?.review_note ?? entry.review_note ?? undefined, bestseller_rank: live?.bestseller_rank ?? entry.bestseller_rank ?? undefined, style: (live?.style ?? entry.style) as Perfume["style"], image_url: live?.image_url ?? undefined, sample_price: live?.sample_price ?? undefined };
  });
  inventory.sort((a,b) => (a.bestseller_rank ?? 99) - (b.bestseller_rank ?? 99) || a.id.localeCompare(b.id));
  return inventory.filter(
    (p) =>
      (!filters?.family || p.scent_family === filters.family) &&
        (!filters?.style || p.details_pending || p.style === filters.style) &&
        (!filters?.maxPrice || p.details_pending || p.price <= filters.maxPrice),
  );
}
export async function getPerfume(id: string): Promise<Perfume | null> {
  return (await getPerfumes()).find((p) => p.id === id) ?? null;
}
// ---------- real astrology engine (runs in the browser; birth details never leave it) ----------
const CHART_KEY = "natal-notes:chart";
/** Storage that never throws: session → local → in-memory (private mode, blocked storage). */
const memoryStore = new Map<string, string>();
export let storageEngine: "session" | "local" | "memory" = "session";
export function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  for (const s of ["sessionStorage", "localStorage"] as const) {
    try { const v = window[s].getItem(key); if (v !== null) return v; } catch { /* blocked */ }
  }
  return memoryStore.get(key) ?? null;
}
export function safeSet(key: string, value: string): void {
  memoryStore.set(key, value);
  if (typeof window === "undefined") return;
  try { window.sessionStorage.setItem(key, value); storageEngine = "session"; return; } catch { /* blocked */ }
  try { window.localStorage.setItem(key, value); storageEngine = "local"; return; } catch { /* blocked */ }
  storageEngine = "memory";
}
export function safeRemove(key: string): void {
  memoryStore.delete(key);
  if (typeof window === "undefined") return;
  for (const s of ["sessionStorage", "localStorage"] as const) {
    try { window[s].removeItem(key); } catch { /* blocked */ }
  }
}
export const debugLog: { at: string; msg: string }[] = [];
export function logDebug(msg: string) {
  debugLog.unshift({ at: new Date().toISOString().slice(11, 19), msg });
  debugLog.length = Math.min(debugLog.length, 8);
}
export const DEMO_ID = "demo";

/** Folds diacritics so "Hồ Chí Minh" matches "ho chi minh" and "Hà Nội" matches "ha noi". */
const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

/** Common typed aliases → the name used in the fallback city list. */
const CITY_ALIASES: Record<string, string> = {
  saigon: "ho chi minh",
  hcmc: "ho chi minh",
  hcm: "ho chi minh",
  "tp hcm": "ho chi minh",
  hk: "hong kong",
};

export async function searchCities(query: string, lang: "en" | "vi"): Promise<CityHit[]> {
  const q = query.trim();
  if (!q) return [];
  const fallback = () => {
    const needle = CITY_ALIASES[fold(q)] ?? fold(q);
    return cities
      .filter((c) => fold(`${c.city} ${c.region} ${c.country}`).includes(needle))
      .slice(0, 5);
  };
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
  const ok = (n: number, m: number) => Number.isFinite(n) && Math.abs(n) <= m;
  if (!ok(c.lat, 90) || !ok(c.lon, 180)) throw new Error("BAD_PLACE");
  let tz = c.timezone;
  try { new Intl.DateTimeFormat("en", { timeZone: tz }); } catch { tz = "UTC"; }
  const { buildChart } = await engine();
  return buildChart({
    year: profile.year,
    month: profile.month,
    day: profile.day,
    hour: profile.hour,
    minute: profile.minute,
    lat: c.lat,
    lon: c.lon,
    timezone: tz,
  });
}

/** Keeps one chart in sessionStorage so a reload keeps it. Nothing else is stored. */
export function storeChart(name: string, chart: Chart, prefs?: Prefs, birthProfile?: BirthProfile): ChartRecord {
  const record: ChartRecord = {
    id: `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    name,
    chart,
    prefs,
  };
  safeSet(CHART_KEY, JSON.stringify({ ...record, birthProfile }));
  return record;
}
function readStored(): ChartRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = safeGet(CHART_KEY);
    return raw ? (JSON.parse(raw) as ChartRecord) : null;
  } catch {
    return null;
  }
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
  safeRemove(CHART_KEY);
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
export async function listSavedCharts() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  return (await cloud.savedCharts()).map((r) => ({
    id: r.id,
    name: r.nickname,
    chart: chartFromStorage(r.chart),
    prefs: r.prefs,
    date: r.created_at.slice(0, 10),
  }));
}
export async function saveChart(id: string) {
  const record = await getChartById(id);
  return cloud.saveChartRecord({ data: recordForStorage(record) });
}
export async function getCart(): Promise<CartItem[]> {
  return wait(items);
}
export async function addToCart(id: string): Promise<CartItem[]> {
  const p = await getPerfume(id);
  if (p && !p.sold_out && !p.details_pending) {
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
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/login` },
  });
  return { ok: !error };
}
/** Admin CSV import: validates against the controlled vocabularies, errors carry row numbers. */
export async function importPerfumesCsv(
  file: File,
): Promise<{ imported: number; errors: ImportError[] }> {
  return cloud.importCatalogue({ data: { csv: await file.text() } });
}
export async function updatePerfume(p: Perfume): Promise<Perfume> {
  const { error } = await supabase.from("perfumes").update(p).eq("id", p.id);
  if (error) throw new Error(error.message);
  return p;
}

export async function getChartById(id: string): Promise<ChartRecord> {
  try {
    return loadChart(id);
  } catch {
    let rows: Awaited<ReturnType<typeof cloud.savedCharts>> = [];
    try { rows = await cloud.savedCharts(); } catch { rows = []; }
    const row = rows.find((r) => r.id === id);
    if (!row) throw new Error("NOT_FOUND");
    return {
      id: row.id,
      name: row.nickname,
      chart: chartFromStorage(row.chart),
      prefs: JSON.parse(JSON.stringify(row.prefs)),
    };
  }
}

export async function getReading(
  chartId: string,
  topic: Topic,
  lang: "en" | "vi",
): Promise<Reading> {
  if (!topics.includes(topic)) throw new Error("NOT_FOUND");
  const { chart } = await getChartById(chartId);
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
  const sectionKeys = librarySections[topic].map(([section, planet]) => {
    const body = planet === "rising" && !chart.rising ? "mercury" : planet;
    const detail = body === "rising" ? d.rising : d[body];
    return {
      key: `${topic}.${section}.${body}.${detail?.sign}`,
      placement: detail
        ? { body, sign: detail.sign, degree: Math.floor(detail.degree) }
        : undefined,
    };
  });
  const lead = { you: "sun", love: "venus", work: "mercury", luck: "jupiter" } as const;
  const voice = await requestVoice(chart, lead[topic], lang, `${topic}`, {
    sections: sectionKeys.map((section, i) => ({ ...placementPacket(chart, section.placement?.body ?? "sun"), angle: librarySections[topic][i][0] })),
  });
  reading.voice = voice;
  reading.sections = sectionKeys.map((section, i) => ({
    title: [dict(lang).chapterOrigin, dict(lang).chapterRelationship, dict(lang).chapterTrouble, dict(lang).chapterNeeds, dict(lang).chapterMission][i],
    placement: section.placement,
    body: voice.sections[i] ?? "",
  }));
  if (topic === "luck") {
    const best = (await getWeekSync(chart))
      .filter((w): w is WeekEntry & { transit: Transit } => w.transit !== null)
      .sort((a, b) => b.transit.strength - a.transit.strength || a.transit.orb - b.transit.orb)[0];
    reading.week = best ? { transit: best.transit, date: best.date } : null;
  }
  return wait(reading);
}

async function getWeekSync(chart: Chart): Promise<WeekEntry[]> {
  const { weekFor } = await engine();
  return weekFor(natalLongitudes(chart), skipFor(chart)).map((w) => ({
    date: w.date,
    transit: w.aspect ? toTransit(w.aspect) : null,
  }));
}
export async function getWeek(chartId: string): Promise<WeekEntry[]> {
  return wait(await getWeekSync((await getChartById(chartId)).chart));
}

/** date is the visitor's local calendar day (YYYY-MM-DD); the instant used is local noon. */
export async function getToday(chartId: string, date: string, lang: "en" | "vi"): Promise<Today> {
  const { chart } = await getChartById(chartId);
  const { dayFor, localNoon } = await engine();
  const plan = dayFor(natalLongitudes(chart), localNoon(date), skipFor(chart));
  const aspects = [plan.working, plan.pushing, plan.protect].filter((a): a is NonNullable<typeof a> => !!a);
  const voice = await requestVoice(chart, "sun", lang, `daily:${date}`, { surface: "daily", blocks: aspects.map((a) => ({ transiting: a.transiting, natal: a.natal, aspect: a.aspect, kind: a.kind })) });
  const block = (a: typeof plan.working): Block | null => a ? { transit: toTransit(a), text: voice.blocks[aspects.indexOf(a)] ?? "" } : null;
  return { date, summary: voice.summary, tone: plan.tone, working: block(plan.working), pushing: block(plan.pushing), protect: block(plan.protect), quiet: plan.aspects.length ? undefined : voice.truth, ritualId: voice.ritualId, voice };

}
export const todayDate = () => DateTime.local().toISODate() ?? "";
const initialCapital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export async function getRevealTraits(chart: Chart, lang: "en" | "vi") {
  const keys = [
    `sun.${chart.sun}`,
    `moon.${chart.moon}`,
    chart.rising ? `rising.${chart.rising}` : `venus.${chart.venus}`,
  ];
  // Older library trait lines use the retired voice, so reveal traits come from the friend-voice sign lines.
  const { signLine } = await import("@/lib/reading/fallback");
  return keys.map((key, i) => ({ text: signLine(lang, key.split(".")[1], i as 0 | 1 | 2), fromLibrary: false }));
}

export async function askNotes(
  question: string,
  category: Theme,
  chartId: string,
  lang: "en" | "vi",
): Promise<AstroAnswer> {
  if (!question.trim()) throw new Error("EMPTY_QUESTION");
  const { chart } = await getChartById(chartId);
  const date = todayDate();
  const { dayFor, localNoon } = await engine();
  const plan = dayFor(natalLongitudes(chart), localNoon(date), skipFor(chart));
  const hit = plan.aspects.find((a) => a.theme === category) ?? plan.aspects[0];
  const aspect = hit;
  const theme = aspect?.theme ?? category;
  const transit: Transit = aspect
    ? toTransit(aspect)
    : { transiting: "moon", aspect: "conjunct", natal: "sun", orb: 0, theme, strength: 1 };
  const selectedRitual = variedRitual(question.trim(), lang);
  const ritualId = selectedRitual.id;
  const sky = aspect ? aspectKind(transit) : "quiet";
  // Both live and backup prose are server-owned; only calculated context leaves the browser.
  const t = dict(lang);
  const capsule = await getCapsule(chartId, lang, ritualId).catch(() => []);
  // Rotate among the best few balance matches so different questions don't all name the same bottle.
  const ranked = rankForBalance(capsule.map((p) => p.perfume), chart.elements);
  const spread = [...question.trim().toLowerCase()].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 0);
  const pick = ranked[spread % Math.max(1, Math.min(3, ranked.length))];
  const data = {
    question: question.trim().slice(0, 300), theme: category, lang,
    sun: chart.sun, moon: chart.moon, rising: chart.rising,
    transit: transitLabel(t, transit), sky, ritual: selectedRitual.action,
    elements: chart.elements, smell_words: pick?.smell_words ?? [],
    perfume: pick ? (lang === "vi" && pick.name_vi ? pick.name_vi : pick.name) : null,
    notes: pick ? [...pick.top_notes, ...pick.heart_notes].slice(0, 2).join(", ") : "",
  };
  const lipId = pickLip(chart.elements, data.question).id;
  try {
    const res = await liveAsk({ data });
    if (res.ok) return { transit, answer: res.answer, ritualId, perfumeId: pick?.id, lipId, source: "ai" };
    return { transit, answer: res.answer, ritualId: res.ritualId, perfumeId: pick?.id, lipId, source: res.reason === "limited" ? "limited" : "fallback" };
  } catch {
    const backup = await backupAsk({ data });
    return { transit, ...backup, perfumeId: pick?.id, lipId, source: "fallback" };
  }
}
function transitLabel(t: ReturnType<typeof dict>, tr: Transit) {
  const w = t as unknown as Record<string, string>;
  return `${w[tr.transiting] ?? tr.transiting} ${tr.aspect} natal ${w[tr.natal] ?? tr.natal}`.slice(0, 80);
}
/** Which suggested question (1–16) this is, if any. */
export function suggestionNumber(question: string, theme: Theme, lang: "en" | "vi"): number | null {
  const d = dict(lang) as unknown as Record<string, string>;
  const q = normaliseQuestion(question);
  const cap = theme[0].toUpperCase() + theme.slice(1);
  for (let i = 1; i <= 16; i++) {
    const names = [`q${cap}${theme === "work" && i <= 4 ? `${i}b` : i}`, ...(theme === "luck" ? [`qMood${i}`] : [])];
    if (names.some((name) => d[name] && normaliseQuestion(d[name]) === q)) return i;
  }
  return null;
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
async function todayRitualId(chart: Chart): Promise<string> {
  try {
    const { dayFor, localNoon } = await engine();
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
  const { chart, prefs } = await getChartById(chartId);
  await getPerfumes();
  const ritual =
    matchRitual(ritualId ?? (await todayRitualId(chart)), lang) ?? matchRitual(fallbackRitualId, lang);
  if (!ritual) throw new Error("NO_RITUAL");
  const picks = buildShelf(inventory, chart, prefs, ritual);
  return wait({
    forChart: toEntry(picks.forChart, lang),
    forWeek: toEntry(picks.forWeek, lang),
    forShadow: toEntry(picks.forShadow, lang),
  });
}
/** 3–5 perfumes for a chart, each paired with a ritual. */
export async function getCapsule(chartId: string, lang: "en" | "vi", ritualId?: string) {
  const { chart, prefs } = await getChartById(chartId);
  await getPerfumes();
  const ritual =
    matchRitual(ritualId ?? (await todayRitualId(chart)), lang) ?? matchRitual(fallbackRitualId, lang);
  if (!ritual) throw new Error("NO_RITUAL");
  return wait(
    rankForBalance(buildCapsule(inventory, chart, prefs, ritual).map((p) => ({ ...p, id: p.perfume.id, smell_words: p.perfume.smell_words })), chart.elements)
      .map((p, i) => { const entry = toEntry(p, lang); const action = variedRitual(chart.sun + chart.moon, lang, i); return entry ? { ...entry, ritualId: action.id, ritualTitle: ritualFor(action.id, lang)?.title ?? "" } : null; })
      .filter((e): e is NonNullable<typeof e> => e !== null),
  );
}
/** The ritual page card. Without a chart of the visitor's own, ritual notes decide. */
export async function getPerfumeForRitual(ritualId: string, lang: "en" | "vi", chartId?: string) {
  const ritual = matchRitual(ritualId, lang);
  if (!ritual) throw new Error("NOT_FOUND");
  const record =
    chartId && chartId !== DEMO_ID
      ? await (async () => {
          try {
            return await getChartById(chartId);
          } catch {
            return null;
          }
        })()
      : null;
  await getPerfumes();
  return wait(
    toEntry(perfumeForRitual(inventory, ritual, record?.chart ?? null, record?.prefs), lang),
  );
}
/** Everything the /dev/match page shows. */
export async function getMatchDebug(chartId: string, ritualId: string, lang: "en" | "vi") {
  const { chart, prefs } = await getChartById(chartId);
  await getPerfumes();
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
export async function saveRitual(id: string): Promise<string[]> {
  await cloud.saveRitualRecord({ data: { id } });
  return cloud.savedRitualIds();
}
export async function listSavedRituals(lang: "en" | "vi"): Promise<(Ritual & { completedSteps: number })[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const ids = await cloud.savedRitualIds();
  return Promise.all(ids.map(async (id) => { const r = ritualFor(id, lang); return r ? { ...r, completedSteps: await ritualProgress(id) } : null; })).then((rows) => rows.filter((r): r is Ritual & { completedSteps: number } => r !== null));
}
export async function loadSamplePerfumes() {
  return getPerfumes();
}
export async function inspectPlacement(chart: Chart, body: Planet, lang: "en" | "vi") {
  return requestVoice(chart, body, lang, `placement:${body}`, { surface: "placement" });
}

export async function saveScentCapsule(chartId: string, ritualId: string, ids: string[]) {
  await saveChart(chartId);
  return cloud.saveCapsuleRecord({ data: { chartId, ritualId, perfumeIds: ids } });
}
export async function listSavedCapsules(lang: "en" | "vi") {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const [saved, catalogue] = await Promise.all([cloud.savedCapsuleRecords(), getPerfumes()]);
  return saved.map((r) => ({ ...r, ritual: ritualFor(r.ritual_id, lang), perfumes: r.perfume_ids.map((id) => catalogue.find((p) => p.id === id)).filter((p): p is Perfume => !!p) }));
}
export async function ritualProgress(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  return cloud.getRitualProgress({ data: { id } });
}
export async function setRitualProgress(id: string, completed: number) {
  return cloud.setRitualProgress({ data: { id, completed } });
}
export async function submitFeedback(
  kind: "reading" | "today" | "ask" | "match",
  ref: string,
  rating: -1 | 1,
  lang: "en" | "vi",
) {
  const { error } = await supabase.from("feedback").insert({ kind, ref, rating, lang });
  if (error) throw new Error(error.message);
}

export function currentBirthProfile(): BirthProfile | null {
  try { const raw = safeGet(CHART_KEY); return raw ? (JSON.parse(raw).birthProfile ?? null) : null; } catch { return null; }
}

/** Only calculated placements and balance leave the browser, never birth inputs. */
function placementPacket(chart: Chart, body: Planet) {
  const detail = chart.details[body];
  if (!detail) throw new Error("NO_PLACEMENT");
  const sign = detail.sign;
  const house = chart.rising ? ((SIGNS.indexOf(sign as (typeof SIGNS)[number]) - SIGNS.indexOf(chart.rising as (typeof SIGNS)[number]) + 12) % 12) + 1 : null;
  return { planet: body, sign, house };
}
async function requestVoice(chart: Chart, body: Planet, lang: "en" | "vi", context: string, extra: Record<string, unknown> = {}): Promise<VoiceReading> {
  const res = await fetch("/api/public/write-reading", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...placementPacket(chart, body), language: lang, elements: chart.elements, context, ...extra }) });
  if (!res.ok) throw new Error("READING_UNAVAILABLE");
  return await res.json() as VoiceReading;
}
export async function getPersonalReading(chartId: string, topic: Topic, lang: "en" | "vi") {
  const { chart } = await getChartById(chartId);
  return requestVoice(chart, { you: "sun", love: "venus", work: "mercury", luck: "jupiter" }[topic] as Planet, lang, topic);
}
