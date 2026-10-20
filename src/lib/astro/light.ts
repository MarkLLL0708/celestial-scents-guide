import type { Chart, Transit } from "@/data/types";
import type { AspectHit } from "./aspects";

export const natalLongitudes = (c: Chart) => ({
  sun: c.details.sun.longitude,
  moon: c.details.moon.longitude,
  mercury: c.details.mercury.longitude,
  venus: c.details.venus.longitude,
  mars: c.details.mars.longitude,
  jupiter: c.details.jupiter.longitude,
  saturn: c.details.saturn.longitude,
});

export const toTransit = (a: AspectHit): Transit => ({
  transiting: a.transiting,
  aspect: a.aspect,
  natal: a.natal,
  orb: Math.round(a.orb * 100) / 100,
  theme: a.theme,
  strength: a.strength,
  kind: a.kind,
});
