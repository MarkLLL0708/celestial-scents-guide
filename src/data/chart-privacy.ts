import { z } from "zod";
import type { Chart, ChartRecord } from "./types";

const placement = z
  .object({
    sign: z.string().max(20),
    degree: z.number().min(0).max(360),
    longitude: z.number().min(0).max(360),
  })
  .strict();
export const privateChartSchema = z
  .object({
    sun: z.string(),
    moon: z.string(),
    rising: z.string().nullable(),
    venus: z.string(),
    mars: z.string(),
    mercury: z.string(),
    jupiter: z.string(),
    saturn: z.string(),
    degrees: z.record(z.string(), z.number()),
    elements: z
      .object({ fire: z.number(), earth: z.number(), air: z.number(), water: z.number() })
      .strict(),
    modalities: z.object({ cardinal: z.number(), fixed: z.number(), mutable: z.number() }).strict(),
    details: z
      .object({
        sun: placement,
        moon: placement,
        mercury: placement,
        venus: placement,
        mars: placement,
        jupiter: placement,
        saturn: placement,
        rising: placement.nullable(),
      })
      .strict(),
    birthTimeKnown: z.boolean(),
    moonAlternatives: z.tuple([z.string(), z.string()]).optional(),
  })
  .strict();
export const prefsSchema = z
  .object({
    avoid: z.array(z.string().max(80)).max(50),
    style: z.enum(["any", "feminine", "masculine", "unisex"]),
    budget: z.enum(["any", "low", "mid", "high"]),
  })
  .strict();
export function chartForStorage(chart: Chart) {
  const {
    sun,
    moon,
    rising,
    venus,
    mars,
    mercury,
    jupiter,
    saturn,
    degrees,
    elements,
    modalities,
    details,
    birthTimeKnown,
    moonAlternatives,
  } = chart;
  return privateChartSchema.parse({
    sun,
    moon,
    rising,
    venus,
    mars,
    mercury,
    jupiter,
    saturn,
    degrees,
    elements,
    modalities,
    details,
    birthTimeKnown,
    moonAlternatives,
  });
}
export function chartFromStorage(value: unknown): Chart {
  return { ...privateChartSchema.parse(value), lat: 0, lon: 0, timezone: "UTC" };
}
export function recordForStorage(record: ChartRecord) {
  return {
    id: record.id,
    nickname: record.name.slice(0, 60),
    chart: chartForStorage(record.chart),
    prefs: prefsSchema.parse(record.prefs ?? { avoid: [], style: "any", budget: "any" }),
  };
}
