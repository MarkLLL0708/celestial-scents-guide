import { describe, expect, it } from "vitest";
import type { Perfume, Prefs } from "@/data/types";
import { en } from "@/i18n/en";
import { scorePerfume, type MatchChart } from "@/lib/match/score";
import { applyFilters, priceTertiles } from "@/lib/match/filters";
import { buildShelf, buildCapsule, CAPSULE_MIN, CAPSULE_MAX, type MatchRitual } from "@/lib/match/shelf";
import { describePick } from "@/lib/match/text";
import { parseCatalogue } from "@/lib/match/catalogue";

const mk = (
  id: string,
  name: string,
  family: string,
  intensity: number,
  notes: string[],
  moods: string[],
  extra: Partial<Perfume> = {},
): Perfume => ({
  id,
  name,
  brand: "test",
  price: 100,
  currency: "USD",
  size_ml: 50,
  style: "unisex",
  scent_family: family,
  intensity,
  top_notes: notes,
  heart_notes: [],
  base_notes: [],
  mood_tags: moods,
  sold_out: false,
  ...extra,
});

const catalogue: Perfume[] = [
  mk(
    "p1",
    "Saffron Hour",
    "Oriental",
    5,
    ["saffron", "bergamot", "rose", "cardamom", "amber", "vanilla"],
    ["bold", "radiant", "warm"],
  ),
  mk(
    "p2",
    "Cedar Letter",
    "Woody",
    3,
    ["pink pepper", "cedar", "vetiver", "sandalwood", "oakmoss"],
    ["refined", "serious", "grounded"],
  ),
  mk(
    "p3",
    "Paper Rain",
    "Fresh",
    2,
    ["mint", "bergamot", "tea", "violet", "white musk"],
    ["cool", "clean", "bright"],
  ),
  mk(
    "p4",
    "Salt Jasmine",
    "Floral",
    3,
    ["sea salt", "jasmine", "lily", "vanilla", "musk"],
    ["dreamy", "soft", "comforting"],
  ),
  mk(
    "p5",
    "Dark Rose Room",
    "Oriental",
    5,
    ["dark rose", "oud", "incense", "patchouli"],
    ["mysterious", "intense", "sensual"],
  ),
  mk(
    "p6",
    "Green Ledger",
    "Green",
    2,
    ["fig leaf", "vetiver", "tea", "lavender"],
    ["calm", "clean", "fresh"],
  ),
  mk(
    "p7",
    "Leather Orchard",
    "Leather",
    4,
    ["leather", "cardamom", "tobacco", "cedar"],
    ["adventurous", "warm", "refined"],
  ),
];
const chartA: MatchChart = {
  sun: "Aquarius",
  moon: "Gemini",
  rising: "Aries",
  venus: "Capricorn",
  mars: "Capricorn",
};
const calm: MatchRitual = { id: "calm", title: "calm", noteFamily: "bergamot, tea, vetiver" };
const noPrefs: Prefs = { avoid: [], style: "any", budget: "any" };
const byName = (n: string) => catalogue.find((p) => p.name === n) as Perfume;

describe("scent scoring, chart A", () => {
  it.each([
    ["Cedar Letter", 52.3],
    ["Paper Rain", 43.4],
    ["Leather Orchard", 34.1],
    ["Green Ledger", 28.8],
    ["Saffron Hour", 17.2],
    ["Salt Jasmine", 13.0],
    ["Dark Rose Room", 10.4],
  ])("%s totals %d", (name, total) => {
    expect(Math.abs(scorePerfume(byName(name), chartA).total - total)).toBeLessThanOrEqual(0.1);
  });
  it("Cedar Letter parts", () => {
    const b = scorePerfume(byName("Cedar Letter"), chartA);
    expect(Math.abs(b.chartScore - 44.7)).toBeLessThanOrEqual(0.1);
    expect(Math.abs(b.intensityBonus - 7.6)).toBeLessThanOrEqual(0.1);
  });
});

describe("shelf with the calm ritual", () => {
  const shelf = buildShelf(catalogue, chartA, noPrefs, calm);
  it("forChart is Cedar Letter with venus evidence", () => {
    expect(shelf.forChart?.perfume.name).toBe("Cedar Letter");
    expect(describePick(en, shelf.forChart!).evidence).toBe(
      "VENUS IN CAPRICORN ↔ VETIVER, CEDAR, OAKMOSS",
    );
    expect(describePick(en, shelf.forChart!).reason).toBe(
      "your venus in capricorn likes vetiver, cedar and oakmoss. this has all three.",
    );
  });
  it("forWeek is Paper Rain at 77.4", () => {
    expect(shelf.forWeek?.perfume.name).toBe("Paper Rain");
    expect(Math.abs((shelf.forWeek?.score ?? 0) - 77.4)).toBeLessThanOrEqual(0.1);
  });
  it("forShadow is Salt Jasmine at 53.3", () => {
    expect(shelf.forShadow?.perfume.name).toBe("Salt Jasmine");
    expect(Math.abs((shelf.forShadow?.score ?? 0) - 53.3)).toBeLessThanOrEqual(0.1);
  });
});

describe("filters", () => {
  it("avoiding vetiver makes Paper Rain the signature", () => {
    const s = buildShelf(catalogue, chartA, { ...noPrefs, avoid: ["vetiver"] }, calm);
    const ids = [s.forChart, s.forWeek, s.forShadow].map((x) => x?.perfume.name);
    expect(ids).not.toContain("Cedar Letter");
    expect(ids).not.toContain("Green Ledger");
    expect(s.forChart?.perfume.name).toBe("Paper Rain");
    expect(Math.abs((s.forChart?.score ?? 0) - 43.4)).toBeLessThanOrEqual(0.1);
  });
  it("a sold-out perfume never appears", () => {
    const cat = catalogue.map((p) => (p.id === "p2" ? { ...p, sold_out: true } : p));
    const s = buildShelf(cat, chartA, noPrefs, calm);
    expect([s.forChart, s.forWeek, s.forShadow].map((x) => x?.perfume.id)).not.toContain("p2");
  });
  it("masculine keeps masculine and unisex only", () => {
    const cat = [
      { ...catalogue[0], style: "feminine" as const },
      { ...catalogue[1], style: "masculine" as const },
      { ...catalogue[2], style: "unisex" as const },
    ];
    const { eligible } = applyFilters(cat, { ...noPrefs, style: "masculine" });
    expect(eligible.map((p) => p.id)).toEqual(["p2", "p3"]);
  });
  it("low budget uses the lower price tertile", () => {
    const cat = [10, 20, 30, 40, 50, 60].map((price, i) => ({ ...catalogue[i], price }));
    expect(priceTertiles(cat).low).toBeCloseTo(26.67, 1);
    const { eligible } = applyFilters(cat, { ...noPrefs, budget: "low" });
    expect(eligible.map((p) => p.price)).toEqual([10, 20]);
  });
  it("unknown rising is left out and the rest renormalise", () => {
    const b = scorePerfume(byName("Cedar Letter"), { ...chartA, rising: null });
    expect(b.placements.map((p) => p.placement)).not.toContain("rising");
    const expected = (b.placements.reduce((a, p) => a + p.weight * p.signScore, 0) / 85) * 100;
    expect(b.chartScore).toBeCloseTo(expected, 6);
  });
  it("fewer than three eligible perfumes gives fewer entries", () => {
    const s = buildShelf(catalogue.slice(0, 2), chartA, noPrefs, calm);
    expect(s.forChart).not.toBeNull();
    expect(s.forWeek).not.toBeNull();
    expect(s.forShadow).toBeNull();
  });
});

describe("catalogue import", () => {
  it("rejects an unknown scent_family with its row number", () => {
    const csv = [
      "id,name,brand,price,style,scent_family,intensity,top_notes,mood_tags,size_ml,sold_out",
      'a,Good,B,100,unisex,Woody,3,"Cedar, Vetiver","calm, clean",50,FALSE',
      'b,Bad,B,100,unisex,Smoky,3,"cedar","calm",50,FALSE',
    ].join("\n");
    const { perfumes, errors } = parseCatalogue(csv);
    expect(perfumes.map((p) => p.id)).toEqual(["a"]);
    expect(perfumes[0].top_notes).toEqual(["cedar", "vetiver"]);
    expect(errors).toEqual([{ row: 3, field: "scent_family", value: "Smoky" }]);
  });
  it("rejects a nonnumeric bottle size", () => {
    const result = parseCatalogue(
      "name,price,style,scent_family,intensity,size_ml,sold_out\na,100,unisex,Woody,3,large,FALSE",
    );
    expect(result.errors).toContainEqual({ row: 2, field: "size_ml", value: "large" });
  });
  it("requires a TRUE or FALSE sold-out value", () => {
    const result = parseCatalogue(
      "name,price,style,scent_family,intensity,size_ml,sold_out\na,100,unisex,Woody,3,50,maybe",
    );
    expect(result.errors).toContainEqual({ row: 2, field: "sold_out", value: "maybe" });
  });
});

describe("capsule after a reading", () => {
  it("picks between three and five distinct perfumes, shelf picks first", () => {
    const cap = buildCapsule(catalogue, chartA, noPrefs, calm);
    expect(cap.length).toBeGreaterThanOrEqual(Math.min(CAPSULE_MIN, catalogue.length));
    expect(cap.length).toBeLessThanOrEqual(CAPSULE_MAX);
    expect(new Set(cap.map((p) => p.perfume.id)).size).toBe(cap.length);
    const shelf = buildShelf(catalogue, chartA, noPrefs, calm);
    expect(cap[0].perfume.id).toBe(shelf.forChart?.perfume.id);
  });
});
