import { describe, it, expect } from "vitest";
import names from "@/data/perfume-names.json";
import { outerLongitudes, signOf } from "@/lib/astro/placements";
import { applyFilters, priceTertiles } from "@/lib/match/filters";
import type { Perfume } from "@/data/types";
import { capsuleSchema } from "@/data/cloud.functions";

describe("sanctuary catalogue and chart rules", () => {
  it("uses exactly 40 unique bilingual names", () => {
    expect(names).toHaveLength(40);
    expect(new Set(names.map((p) => p.id)).size).toBe(40);
    expect(names.every((p) => p.name.length > 0 && p.name_vi.length > 0)).toBe(true);
  });
  it("marks every unconfirmed commercial offer pending", () => {
    expect(names.every((p) => p.details_pending && p.price === 0 && p.size_ml === 0)).toBe(true);
  });
  it("does not treat pending prices or style as confirmed matching facts", () => {
    const p = names[0] as Perfume;
    expect(priceTertiles([p]).low).toBe(Infinity);
    expect(applyFilters([p], { avoid: [], budget: "low", style: "feminine" }).eligible).toHaveLength(1);
  });
  it("accepts only three to five distinct perfumes in a saved capsule", () => {
    const make = (ids: string[]) => capsuleSchema.safeParse({ chartId: "chart", ritualId: "slow-evening", perfumeIds: ids }).success;
    expect(make(["a","b"])).toBe(false);
    expect(make(["a","b","c"])).toBe(true);
    expect(make(["a","b","c","d","e"])).toBe(true);
    expect(make(["a","b","c","d","e","f"])).toBe(false);
    expect(make(["a","a","b"])).toBe(false);
  });
  it("includes Uranus, Neptune and Pluto at reference birth A", () => {
    const result = outerLongitudes(new Date("1992-02-14T01:30:00Z"));
    expect(result.uranus).toBeCloseTo(286.178, 2);
    expect(result.neptune).toBeCloseTo(287.811, 2);
    expect(result.pluto).toBeCloseTo(232.922, 2);
    expect(signOf(result.pluto).sign).toBe("Scorpio");
  });
});