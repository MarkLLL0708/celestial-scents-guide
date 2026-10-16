import { describe, it, expect } from "vitest";
import { checkLimit, validateLiveAnswer, ASK_LIMITS } from "@/lib/ask/live";
const long = (w: string) => Array.from({ length: 60 }, () => w).join(" ");
describe("live ask rules", () => {
  it("8 per hour", () => {
    expect(ASK_LIMITS.perHour).toBe(8);
    expect(checkLimit(7, 7, 0)).toBe("ok");
    expect(checkLimit(8, 8, 0)).toBe("hour");
  });
  it("20 per day", () => expect(checkLimit(0, 20, 0)).toBe("day"));
  it("global daily cap", () => expect(checkLimit(0, 0, 2000)).toBe("global"));
  it("accepts calm answer naming perfume", () => expect(validateLiveAnswer(long("Perfume"))).toEqual([]));
  it("rejects exclamation and health words", () => {
    expect(validateLiveAnswer(long("Calm") + "!")).toContain("exclamation");
    expect(validateLiveAnswer(long("Calm") + " cure")).toContain("banned_word");
  });
  it("rejects too short", () => expect(validateLiveAnswer("Too short")).toContain("word_count"));
});
