import { fullRitualMatches, weekMix } from "@/config/scentMap";
import type { Perfume, Prefs } from "@/data/types";
import { applyFilters } from "./filters";
import {
  notesText,
  scorePerfume,
  shadowChart,
  strongestPlacement,
  type MatchChart,
  type ScoreBreakdown,
} from "./score";

/** Ritual fields the matcher reads. noteFamily is always the English list. */
export interface MatchRitual {
  id: string;
  title: string;
  noteFamily: string;
}

const terms = (noteFamily: string) =>
  noteFamily
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

export function ritualNotes(p: Perfume, r: MatchRitual): { matched: string[]; score: number } {
  const text = notesText(p);
  const matched = terms(r.noteFamily).filter((n) => text.includes(n));
  return { matched, score: Math.min(1, matched.length / fullRitualMatches) * 100 };
}

export const weekScore = (total: number, ritualScore: number) =>
  weekMix.ritual * ritualScore + weekMix.total * total;

export type Pick =
  | { kind: "chart"; perfume: Perfume; score: number; breakdown: ScoreBreakdown }
  | {
      kind: "week";
      perfume: Perfume;
      score: number;
      breakdown: ScoreBreakdown;
      ritual: MatchRitual;
      matched: string[];
    }
  | { kind: "shadow"; perfume: Perfume; score: number; breakdown: ScoreBreakdown };

export interface ShelfPicks {
  forChart: Pick | null;
  forWeek: Pick | null;
  forShadow: Pick | null;
}

const best = <T extends { perfume: Perfume; v: number }>(xs: T[]): T | undefined =>
  [...xs].sort((a, b) => b.v - a.v || a.perfume.id.localeCompare(b.perfume.id))[0];

export function buildShelf(
  catalogue: Perfume[],
  chart: MatchChart,
  prefs: Prefs | undefined,
  ritual: MatchRitual,
): ShelfPicks {
  const { eligible } = applyFilters(catalogue, prefs);
  const scored = eligible.map((p) => {
    const breakdown = scorePerfume(p, chart);
    return { perfume: p, breakdown, v: breakdown.total };
  });
  const top = best(scored);
  const forChart: Pick | null = top
    ? { kind: "chart", perfume: top.perfume, score: top.v, breakdown: top.breakdown }
    : null;

  const rest1 = scored.filter((x) => x.perfume.id !== top?.perfume.id);
  const week = best(
    rest1.map((x) => {
      const rn = ritualNotes(x.perfume, ritual);
      return { ...x, matched: rn.matched, v: weekScore(x.breakdown.total, rn.score) };
    }),
  );
  const forWeek: Pick | null = week
    ? {
        kind: "week",
        perfume: week.perfume,
        score: week.v,
        breakdown: week.breakdown,
        ritual,
        matched: week.matched,
      }
    : null;

  const shadow = shadowChart(chart);
  const rest2 = rest1.filter((x) => x.perfume.id !== week?.perfume.id);
  const sh = best(
    rest2.map((x) => {
      const breakdown = scorePerfume(x.perfume, shadow);
      return { perfume: x.perfume, breakdown, v: breakdown.total };
    }),
  );
  const forShadow: Pick | null = sh
    ? { kind: "shadow", perfume: sh.perfume, score: sh.v, breakdown: sh.breakdown }
    : null;
  return { forChart, forWeek, forShadow };
}

/** The ritual card perfume: forWeek rule with a chart, else best ritual notes (ties by id). */
export function perfumeForRitual(
  catalogue: Perfume[],
  ritual: MatchRitual,
  chart: MatchChart | null,
  prefs?: Prefs,
): Pick | null {
  const { eligible } = applyFilters(catalogue, chart ? prefs : undefined);
  const rows = eligible.map((p) => {
    const rn = ritualNotes(p, ritual);
    const breakdown = chart ? scorePerfume(p, chart) : null;
    return {
      perfume: p,
      matched: rn.matched,
      breakdown,
      v: breakdown ? weekScore(breakdown.total, rn.score) : rn.score,
    };
  });
  const top = best(rows);
  if (!top) return null;
  return {
    kind: "week",
    perfume: top.perfume,
    score: top.v,
    breakdown: top.breakdown ?? scorePerfumeEmpty(top.perfume),
    ritual,
    matched: top.matched,
  };
}

const scorePerfumeEmpty = (p: Perfume): ScoreBreakdown => ({
  perfumeId: p.id,
  placements: [],
  chartScore: 0,
  intensityTarget: 0,
  intensityBonus: 0,
  total: 0,
});

/** Best ritual for a perfume by ritual-note score; ties keep list order. */
export function ritualForPerfume(p: Perfume, rituals: MatchRitual[]): MatchRitual | undefined {
  let pick: MatchRitual | undefined;
  let v = -1;
  for (const r of rituals) {
    const s = ritualNotes(p, r).score;
    if (s > v) {
      v = s;
      pick = r;
    }
  }
  return pick;
}

export { strongestPlacement };
