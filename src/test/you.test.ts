import { describe, it, expect } from "vitest";
import { wholeSignHouse } from "@/features/you";

describe("whole-sign houses", () => {
  it("rising sign is the 1st house", () => expect(wholeSignHouse("Capricorn", "Capricorn")).toBe(1));
  it("Libra with Capricorn rising is the 10th house", () => expect(wholeSignHouse("Libra", "Capricorn")).toBe(10));
  it("Taurus with Capricorn rising is the 5th house", () => expect(wholeSignHouse("Taurus", "Capricorn")).toBe(5));
  it("no birth time means no house", () => expect(wholeSignHouse("Leo", null)).toBeNull());
});
