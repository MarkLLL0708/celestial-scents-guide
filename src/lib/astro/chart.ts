import { DateTime } from "luxon";
import { ascendant, bodyLongitudes, signOf, type Body, type Longitudes, type Sign } from "./placements";
import { ELEMENT_OF, MODALITY_OF, PLACEMENT_WEIGHTS, type WeightedPlacement } from "./config";

export interface NatalInput {
  year: number;
  month: number;
  day: number;
  hour: number | null;
  minute: number | null;
  lat: number;
  lon: number;
  timezone: string;
}
export interface Placement {
  sign: Sign;
  degree: number;
  longitude: number;
}
export interface NatalResult {
  utc: Date;
  longitudes: Longitudes;
  ascendant: number | null;
  details: Record<Body, Placement> & { rising: Placement | null };
  moonAlternatives?: [Sign, Sign];
  birthTimeKnown: boolean;
  elements: { fire: number; earth: number; air: number; water: number };
  modalities: { cardinal: number; fixed: number; mutable: number };
}

/** Local birth time in its own IANA zone to UTC. Never uses the browser zone. */
export function localToUtc(
  p: Pick<NatalInput, "year" | "month" | "day" | "timezone"> & { hour: number; minute: number },
): Date {
  const dt = DateTime.fromObject(
    { year: p.year, month: p.month, day: p.day, hour: p.hour, minute: p.minute },
    { zone: p.timezone },
  );
  if (!dt.isValid) throw new Error("INVALID_TIME");
  return dt.toUTC().toJSDate();
}

const place = (lon: number): Placement => ({ ...signOf(lon), longitude: lon });

/** Weighted totals as integers summing to 100 (largest remainder). */
export function weightedTotals<K extends string>(
  signs: Partial<Record<WeightedPlacement, Sign | null>>,
  map: Record<Sign, K>,
  keys: readonly K[],
): Record<K, number> {
  const raw = Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;
  let total = 0;
  for (const [p, w] of Object.entries(PLACEMENT_WEIGHTS) as [WeightedPlacement, number][]) {
    const s = signs[p];
    if (!s) continue;
    raw[map[s]] += w;
    total += w;
  }
  const scaled = keys.map((k) => ({ k, v: total ? (raw[k] * 100) / total : 0 }));
  const out = Object.fromEntries(scaled.map(({ k, v }) => [k, Math.floor(v)])) as Record<K, number>;
  let left = 100 - scaled.reduce((s, { k }) => s + out[k], 0);
  [...scaled]
    .sort((a, b) => (b.v % 1) - (a.v % 1))
    .forEach(({ k }) => {
      if (left > 0 && total) {
        out[k]++;
        left--;
      }
    });
  return out;
}

export function computeNatal(input: NatalInput): NatalResult {
  const known = input.hour !== null;
  const utc = localToUtc({
    ...input,
    hour: input.hour ?? 12,
    minute: known ? (input.minute ?? 0) : 0,
  });
  const longitudes = bodyLongitudes(utc);
  const asc = known ? ascendant(utc, input.lat, input.lon) : null;
  let moonAlternatives: [Sign, Sign] | undefined;
  if (!known) {
    const early = signOf(bodyLongitudes(localToUtc({ ...input, hour: 0, minute: 0 })).moon).sign;
    const late = signOf(bodyLongitudes(localToUtc({ ...input, hour: 23, minute: 59 })).moon).sign;
    if (early !== late) moonAlternatives = [early, late];
  }
  const details = {
    sun: place(longitudes.sun),
    moon: place(longitudes.moon),
    mercury: place(longitudes.mercury),
    venus: place(longitudes.venus),
    mars: place(longitudes.mars),
    jupiter: place(longitudes.jupiter),
    saturn: place(longitudes.saturn),
    rising: asc === null ? null : place(asc),
  };
  const signs = {
    sun: details.sun.sign,
    moon: details.moon.sign,
    rising: details.rising?.sign ?? null,
    venus: details.venus.sign,
    mars: details.mars.sign,
    mercury: details.mercury.sign,
  };
  return {
    utc,
    longitudes,
    ascendant: asc,
    details,
    moonAlternatives,
    birthTimeKnown: known,
    elements: weightedTotals(signs, ELEMENT_OF, ["fire", "earth", "air", "water"] as const),
    modalities: weightedTotals(signs, MODALITY_OF, ["cardinal", "fixed", "mutable"] as const),
  };
}
