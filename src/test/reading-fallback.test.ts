import { describe, expect, it } from "vitest";
import { writeFallback } from "@/lib/reading/fallback";
import { validate, voiceIssue } from "@/lib/reading/validation";

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const PLANETS = ["sun", "moon", "rising", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
const perfume = { name: "Library", notes: ["cedar", "pencil shavings"], smell_words: ["old library", "bitter"] };
const blocks = [{ transiting: "mars", natal: "venus", kind: "hard" }, { transiting: "jupiter", natal: "sun", kind: "easy" }, { transiting: "moon", natal: "moon", kind: "intense" }];

describe("friend-voice fallback reading", () => {
  for (const language of ["en", "vi"] as const) {
    it(`passes the voice rules for every planet and sign in ${language}`, () => {
      for (const planet of PLANETS) for (const sign of SIGNS) for (const house of [null, 1, 12]) {
        const r = writeFallback({ planet, sign, house, language, elements: { fire: 0, earth: 30, air: 40, water: 30 }, perfume, ritual: "Apply lightly to one wrist.", sections: SIGNS.slice(0, 5).map((s, i) => ({ planet: PLANETS[i], sign: s })), blocks });
        expect(validate(r, language), `${planet} ${sign} ${house}`).toBeNull();
        expect(voiceIssue([...r.sections, ...r.blocks], language)).toBeNull();
        expect(r.sections).toHaveLength(5);
      }
    });
  }
  it("calls an element absent only when it is exactly zero", () => {
    const base = { planet: "sun", sign: "Leo", house: null, language: "en" as const, perfume, ritual: "x." };
    expect(writeFallback({ ...base, elements: { fire: 0, earth: 30, air: 40, water: 30 } }).scent).toContain("zero fire");
    expect(writeFallback({ ...base, elements: { fire: 10, earth: 30, air: 30, water: 30 } }).scent).toContain("least fire");
    expect(writeFallback({ ...base, elements: { fire: 25, earth: 25, air: 25, water: 25 } }).scent).toContain("no element is lacking");
  });
  it("names only the supplied perfume notes", () => {
    const r = writeFallback({ planet: "sun", sign: "Leo", house: null, language: "en", elements: { fire: 0, earth: 30, air: 40, water: 30 }, perfume, ritual: "x." });
    expect(r.scent).toContain("Library has cedar and pencil shavings");
  });
});
