import { describe, expect, it } from "vitest";
import { allowsPrice, maxProductCards } from "@/lib/sellRules";

describe("soft-sell rules", () => {
  it.each(["/", "/chart/result/demo", "/chart/result/demo/read/love", "/today", "/ask"])(
    "no price on %s",
    (p) => expect(allowsPrice(p)).toBe(false),
  );
  it("ritual page shows up to five scents", () =>
    expect(maxProductCards("/rituals/clean-desk-scent")).toBe(5));
  it("shelf shows three", () => expect(maxProductCards("/chart/result/demo/shelf")).toBe(3));
  it("shop is unlimited", () => expect(maxProductCards("/shop")).toBe(Infinity));
  it("astrology screens show none", () => expect(maxProductCards("/today")).toBe(0));
});
