import {
  elementFamilies,
  fullMoodMatches,
  fullNoteMatches,
  intensityBonusMax,
  intensityTargets,
  placementWeights,
  shadowShift,
  signs,
  signScoreParts,
  SIGN_ORDER,
  type MatchPlacement,
  type ScentFamily,
  type SignName,
} from "@/config/scentMap";
import type { Perfume } from "@/data/types";

/** Placement → sign. Rising may be unknown; moon may be one of two signs. */
export interface MatchChart {
  sun: string;
  moon: string;
  rising: string | null;
  venus: string;
  mars: string;
  moonAlternatives?: [string, string];
}

const isSign = (s: string): s is SignName => (SIGN_ORDER as readonly string[]).includes(s);
const signOf = (s: string): SignName => {
  if (!isSign(s)) throw new Error(`UNKNOWN_SIGN:${s}`);
  return s;
};

export const notesText = (p: Perfume) =>
  [...p.top_notes, ...p.heart_notes, ...p.base_notes].join(" ").toLowerCase();

export interface SignParts {
  sign: SignName;
  familyScore: number;
  noteScore: number;
  moodScore: number;
  matchedNotes: string[];
  signScore: number;
}

export function signParts(p: Perfume, sign: string): SignParts {
  const s = signOf(sign);
  const def = signs[s];
  const familyScore = elementFamilies[def.element][p.scent_family as ScentFamily] ?? 0;
  const text = notesText(p);
  const matchedNotes = def.notes.filter((n) => text.includes(n.toLowerCase()));
  const noteScore = Math.min(1, matchedNotes.length / fullNoteMatches);
  const moods = def.moods.filter((m) => p.mood_tags.includes(m)).length;
  const moodScore = Math.min(1, moods / fullMoodMatches);
  const signScore =
    signScoreParts.family * familyScore +
    signScoreParts.notes * noteScore +
    signScoreParts.mood * moodScore;
  return { sign: s, familyScore, noteScore, moodScore, matchedNotes, signScore };
}
export const signScore = (p: Perfume, sign: string) => signParts(p, sign).signScore;

export interface PlacementParts {
  placement: MatchPlacement;
  weight: number;
  /** One entry, or two when the moon could be either sign. */
  signs: SignParts[];
  signScore: number;
  intensityTarget: number;
}
export interface ScoreBreakdown {
  perfumeId: string;
  placements: PlacementParts[];
  chartScore: number;
  intensityTarget: number;
  intensityBonus: number;
  total: number;
}

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

function placementSigns(chart: MatchChart): { placement: MatchPlacement; signs: string[] }[] {
  const out: { placement: MatchPlacement; signs: string[] }[] = [];
  (Object.keys(placementWeights) as MatchPlacement[]).forEach((pl) => {
    if (pl === "rising") {
      if (chart.rising) out.push({ placement: pl, signs: [chart.rising] });
    } else if (pl === "moon" && chart.moonAlternatives) {
      out.push({ placement: pl, signs: [...chart.moonAlternatives] });
    } else out.push({ placement: pl, signs: [chart[pl]] });
  });
  return out;
}

export function scorePerfume(p: Perfume, chart: MatchChart): ScoreBreakdown {
  const placements: PlacementParts[] = placementSigns(chart).map(({ placement, signs: ss }) => {
    const parts = ss.map((s) => signParts(p, s));
    return {
      placement,
      weight: placementWeights[placement],
      signs: parts,
      signScore: avg(parts.map((x) => x.signScore)),
      intensityTarget: avg(parts.map((x) => intensityTargets[signs[x.sign].element])),
    };
  });
  const totalWeight = placements.reduce((a, x) => a + x.weight, 0);
  const chartScore = (placements.reduce((a, x) => a + x.weight * x.signScore, 0) / totalWeight) * 100;
  const intensityTarget = placements.reduce((a, x) => a + x.weight * x.intensityTarget, 0) / totalWeight;
  const intensityBonus = intensityBonusMax * (1 - Math.abs(p.intensity - intensityTarget) / 4);
  return {
    perfumeId: p.id,
    placements,
    chartScore,
    intensityTarget,
    intensityBonus,
    total: Math.min(100, chartScore + intensityBonus),
  };
}

const shift = (s: string) => SIGN_ORDER[(SIGN_ORDER.indexOf(signOf(s)) + shadowShift) % 12];
/** Every placement moved six signs forward (Aries → Libra, and so on). */
export function shadowChart(c: MatchChart): MatchChart {
  return {
    sun: shift(c.sun),
    moon: shift(c.moon),
    rising: c.rising ? shift(c.rising) : null,
    venus: shift(c.venus),
    mars: shift(c.mars),
    moonAlternatives: c.moonAlternatives
      ? [shift(c.moonAlternatives[0]), shift(c.moonAlternatives[1])]
      : undefined,
  };
}

/** The placement (and sign) contributing most: largest weight × signScore. */
export function strongestPlacement(b: ScoreBreakdown): { placement: MatchPlacement; parts: SignParts } {
  let best = { placement: b.placements[0].placement, parts: b.placements[0].signs[0], v: -1 };
  for (const pl of b.placements)
    for (const s of pl.signs) {
      const v = pl.weight * s.signScore;
      if (v > best.v) best = { placement: pl.placement, parts: s, v };
    }
  return { placement: best.placement, parts: best.parts };
}
