import { describe, it, expect } from "vitest";
import { validateReading, pickBySmell, MAX_ATTEMPTS } from "@/lib/reading/rules";

const ok = { truth: "You fix the crooked frame first.", cost: "You judge yourself hard.", scent: "It smells like clean laundry. It fits your tidy habits." };
const p = (id: string, scent_family: string, notes: string[] = []) => ({ id, scent_family, top_notes: notes, heart_notes: [], base_notes: [] }) as never;

describe("reading rules", () => {
  it("accepts a clean reading", () => expect(validateReading(ok)).toEqual([]));
  it("rejects a banned word", () => expect(validateReading({ ...ok, cost: "Your energy runs out." })).toContain("banned:energy"));
  it("rejects a 23-word sentence but allows 22", () => {
    const words = (n: number) => Array(n).fill("word").join(" ") + ".";
    expect(validateReading({ ...ok, truth: words(23) })).toContain("long_sentence");
    expect(validateReading({ ...ok, truth: words(22) })).toEqual([]);
  });
  it("tries once plus two retries", () => expect(MAX_ATTEMPTS).toBe(3));
  it("picks the perfume by smell tags in code", () => {
    expect(pickBySmell("Scorpio", [p("a", "Fresh"), p("b", "Leather", ["oud"])])?.id).toBe("b");
  });
});
