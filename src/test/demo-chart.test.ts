import { it, expect } from "vitest";
import { buildChart } from "@/lib/astro/to-chart";
import { demoChart } from "@/data/seed";

it("precomputed sample chart matches the real engine (Hanoi, 14 Feb 1992, 08:30)", () => {
  const fresh = buildChart({ year: 1992, month: 2, day: 14, hour: 8, minute: 30, lat: 21.0285, lon: 105.8542, timezone: "Asia/Bangkok" });
  expect(JSON.parse(JSON.stringify(fresh))).toEqual(demoChart);
});
