import { DateTime } from "luxon";
import { aspectsBetween, type AspectHit, type AspectTheme } from "./aspects";
import { bodyLongitudes, type Body, type Longitudes } from "./placements";

export interface DayPlan {
  aspects: AspectHit[];
  working: AspectHit | null;
  pushing: AspectHit | null;
  protect: AspectHit | null;
  tone: Record<AspectTheme, number>;
  ritualTheme: "calm" | AspectTheme;
}
const TIE_ORDER: AspectTheme[] = ["luck", "love", "work", "self"];

/** Noon on the visitor's local calendar day (browser zone), so the reading holds all day. */
export function localNoon(date?: string): Date {
  const base = date ? DateTime.fromISO(date) : DateTime.local();
  return base.set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toJSDate();
}

export function topThemeOf(tone: Record<AspectTheme, number>): AspectTheme {
  return TIE_ORDER.reduce((best, th) => (tone[th] > tone[best] ? th : best), TIE_ORDER[0]);
}

export function planDay(aspects: AspectHit[]): DayPlan {
  const working = aspects.find((a) => a.kind === "easy") ?? null;
  const pushing = aspects.find((a) => a.kind === "hard") ?? null;
  const rest = aspects.filter((a) => a !== working && a !== pushing);
  const lights = rest.filter((a) => a.natal === "sun" || a.natal === "moon");
  const protect =
    lights.find((a) => a.kind === "hard") ?? lights[0] ?? rest[0] ?? null;
  const tone = { self: 0, love: 0, work: 0, luck: 0 } as Record<AspectTheme, number>;
  for (const th of TIE_ORDER) {
    const sum = aspects.filter((a) => a.theme === th).reduce((s, a) => s + a.strength, 0);
    tone[th] = Math.min(5, 1 + Math.ceil(sum / 3));
  }
  const ritualTheme = pushing && pushing.strength >= 4 ? "calm" : topThemeOf(tone);
  return { aspects, working, pushing, protect, tone, ritualTheme };
}

export function dayFor(
  natal: Partial<Longitudes>,
  instant: Date,
  skipNatal: Body[] = [],
): DayPlan {
  return planDay(aspectsBetween(bodyLongitudes(instant), natal, { skipNatal }));
}

export interface WeekDay {
  date: string;
  aspect: AspectHit | null;
}
/** Next 7 days at local noon: the strongest luck or love aspect each day. */
export function weekFor(
  natal: Partial<Longitudes>,
  skipNatal: Body[] = [],
  from = DateTime.local(),
): WeekDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = from.plus({ days: i }).set({ hour: 12, minute: 0, second: 0, millisecond: 0 });
    const aspects = aspectsBetween(bodyLongitudes(d.toJSDate()), natal, { skipNatal });
    return {
      date: d.toISODate() ?? "",
      aspect: aspects.find((a) => a.theme === "luck" || a.theme === "love") ?? null,
    };
  });
}
