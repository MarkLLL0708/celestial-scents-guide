import { describe, it, expect } from "vitest";
import { personalReading } from "@/lib/astro/personal";
import { SIGNS } from "@/lib/astro/placements";

const perfume = { scent_family: "Fresh", top_notes: ["bergamot"], heart_notes: ["iris", "rose"], base_notes: ["musk"] } as never;
const banned = /\b(enveloping|resonates|embrace|journey|energy|essence|aura|cosmic|universe)\b/i;

describe("personal reading", () => {
  for (const lang of ["en", "vi"] as const) for (const sign of SIGNS) it(`${sign} ${lang} follows the rules`, () => {
    const r = personalReading(sign, perfume, lang);
    expect(r.truth.toLowerCase().startsWith(sign.toLowerCase())).toBe(false);
    expect(r.cost.split(/[.]\s/).length).toBe(1);
    const all = `${r.truth} ${r.cost} ${r.scent}`;
    expect(all).not.toMatch(banned);
    expect(all).not.toMatch(/!/);
    for (const s of all.split(/(?<=\.)\s+/)) expect(s.split(/\s+/).length).toBeLessThanOrEqual(18);
  });
  it("names at most two notes, only from the perfume", () => {
    const r = personalReading("Aries", perfume, "en");
    expect(r.scent).toContain("bergamot and iris");
    expect(r.scent).not.toContain("musk");
  });
});
