import { describe, expect, it } from "vitest";
import { chartBalance, rankForBalance, variedRitual, RITUAL_ACTIONS } from "@/lib/reading/balance";

describe("chart-based scent recommendations", () => {
  it("uses the actual least represented element, not the Sun sign", () => {
    const balance = chartBalance({ fire: 0, earth: 20, air: 50, water: 30 });
    expect(balance.least).toEqual(["fire"]);
    expect(balance.absent).toEqual(["fire"]);
  });
  it("does not claim a nonzero element is absent", () => {
    expect(chartBalance({ fire: 15, earth: 20, air: 40, water: 25 }).absent).toEqual([]);
  });
  it("does not invent a deficit in a balanced chart", () => {
    expect(chartBalance({ fire: 25, earth: 25, air: 25, water: 25 }).least).toEqual([]);
  });
  it("ranks actual smell tags ahead of unrelated scents", () => {
    const rows = [{ id: "a", smell_words: ["sea"] }, { id: "b", smell_words: ["spicy kitchen", "orange peel"] }];
    expect(rankForBalance(rows, { fire: 0, earth: 20, air: 50, water: 30 })[0].id).toBe("b");
  });
  it("varies practical rituals across successive reading contexts", () => {
    const ids = Array.from({ length: 6 }, (_, i) => variedRitual("same-chart", "en", i).id);
    expect(new Set(ids).size).toBe(6);
  });
  it("offers at least 24 distinct rituals and ties them to the weak element", () => {
    expect(new Set(RITUAL_ACTIONS.map((r) => r.id)).size).toBeGreaterThanOrEqual(24);
    for (let i = 0; i < 6; i++) expect(RITUAL_ACTIONS.find((r) => r.id === variedRitual("x", "en", i, "fire").id)?.element).toBe("fire");
  });
});