import type { Body, Longitudes } from "./placements";

export type AspectName = "conjunct" | "sextile" | "square" | "trine" | "opposite";
export type AspectTheme = "self" | "love" | "work" | "luck";
export type AspectKind = "easy" | "hard" | "intense";

export const ASPECTS: { name: AspectName; angle: number; orb: number }[] = [
  { name: "conjunct", angle: 0, orb: 6 },
  { name: "sextile", angle: 60, orb: 3 },
  { name: "square", angle: 90, orb: 5 },
  { name: "trine", angle: 120, orb: 5 },
  { name: "opposite", angle: 180, orb: 6 },
];
export const MOON_ORB_CAP = 3;

export interface AspectHit {
  transiting: Body;
  aspect: AspectName;
  natal: Body;
  orb: number;
  strength: 1 | 2 | 3 | 4 | 5;
  theme: AspectTheme;
  kind: AspectKind;
}

export function themeOf(a: Body, b: Body): AspectTheme {
  const has = (...xs: Body[]) => xs.includes(a) || xs.includes(b);
  if (has("jupiter")) return "luck";
  if (has("venus")) return "love";
  if (has("saturn", "mercury", "mars")) return "work";
  return "self";
}

export function kindOf(aspect: AspectName, a: Body, b: Body): AspectKind {
  if (aspect === "sextile" || aspect === "trine") return "easy";
  if (aspect === "square" || aspect === "opposite") return "hard";
  const has = (...xs: Body[]) => xs.includes(a) || xs.includes(b);
  const soft = has("venus", "jupiter");
  const tough = has("mars", "saturn");
  if (soft && !tough) return "easy";
  if (tough && !soft) return "hard";
  return "intense";
}

export const angularDifference = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

export function aspectsBetween(
  transit: Longitudes,
  natal: Partial<Longitudes>,
  opts: { skipNatal?: Body[] } = {},
): AspectHit[] {
  const out: AspectHit[] = [];
  for (const [tb, tl] of Object.entries(transit) as [Body, number][]) {
    for (const [nb, nl] of Object.entries(natal) as [Body, number | undefined][]) {
      if (nl === undefined || opts.skipNatal?.includes(nb)) continue;
      const diff = angularDifference(tl, nl);
      for (const a of ASPECTS) {
        const limit = tb === "moon" ? Math.min(a.orb, MOON_ORB_CAP) : a.orb;
        const orb = Math.abs(diff - a.angle);
        if (orb > limit) continue;
        const strength = Math.max(1, 5 - Math.floor((5 * orb) / limit)) as AspectHit["strength"];
        out.push({
          transiting: tb,
          aspect: a.name,
          natal: nb,
          orb,
          strength,
          theme: themeOf(tb, nb),
          kind: kindOf(a.name, tb, nb),
        });
      }
    }
  }
  return out.sort((x, y) => y.strength - x.strength || x.orb - y.orb);
}

export const aspectString = (a: Pick<AspectHit, "transiting" | "aspect" | "natal">) =>
  `transiting ${a.transiting} ${a.aspect} natal ${a.natal}`;
