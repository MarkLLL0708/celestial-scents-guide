import type { Chart, Planet, Transit } from "@/data/types";
import { computeNatal, type NatalInput } from "./chart";
import { signOf, outerLongitudes } from "./placements";
import type { AspectHit } from "./aspects";

/** Real chart from local birth details in the birth place's own time zone. */
export function buildChart(input: NatalInput): Chart {
  const n = computeNatal(input);
  const d = n.details;
  const outer = outerLongitudes(n.utc);
  const outerDetails = Object.fromEntries(Object.entries(outer).map(([body, longitude]) => [body, { ...signOf(longitude), longitude }])) as Record<"uranus" | "neptune" | "pluto", { sign: string; degree: number; longitude: number }>;
  const moonSign = n.moonAlternatives ? signOf(n.longitudes.moon).sign : d.moon.sign;
  const degrees: Partial<Record<Planet, number>> = {
    sun: Math.floor(d.sun.degree),
    moon: Math.floor(d.moon.degree),
    venus: Math.floor(d.venus.degree),
    mars: Math.floor(d.mars.degree),
    mercury: Math.floor(d.mercury.degree),
    jupiter: Math.floor(d.jupiter.degree),
    saturn: Math.floor(d.saturn.degree),
    uranus: Math.floor(outerDetails.uranus.degree),
    neptune: Math.floor(outerDetails.neptune.degree),
    pluto: Math.floor(outerDetails.pluto.degree),
  };
  if (d.rising) degrees.rising = Math.floor(d.rising.degree);
  return {
    sun: d.sun.sign,
    moon: moonSign,
    rising: d.rising?.sign ?? null,
    venus: d.venus.sign,
    mars: d.mars.sign,
    mercury: d.mercury.sign,
    jupiter: d.jupiter.sign,
    saturn: d.saturn.sign,
    uranus: outerDetails.uranus.sign,
    neptune: outerDetails.neptune.sign,
    pluto: outerDetails.pluto.sign,
    degrees,
    elements: n.elements,
    modalities: n.modalities,
    details: { ...d, ...outerDetails },
    moonAlternatives: n.moonAlternatives,
    birthTimeKnown: n.birthTimeKnown,
    lat: input.lat,
    lon: input.lon,
    timezone: input.timezone,
  };
}

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
