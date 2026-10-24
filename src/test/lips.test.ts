import { describe, expect, it } from "vitest";
import { LIP_PRODUCTS, pickLip, lipLine, lipName } from "@/lib/lips";
import { writeAskBackup } from "@/lib/ask/backup.server";

const elements = { fire: 4, earth: 8, air: 3, water: 0 };
describe("lip picks", () => {
  it("only uses Dior, Armani and YSL, with prices pending", () => {
    for (const l of LIP_PRODUCTS) { expect(["Dior", "Armani", "YSL"]).toContain(l.brand); expect(l.price).toBeNull(); }
  });
  it("picks a shade that builds the weakest element", () => {
    expect(pickLip(elements, "anything").element).toBe("water");
    expect(pickLip({ fire: 0, earth: 5, air: 5, water: 5 }, "x").element).toBe("fire");
  });
  it("is the same pick for the same chart and question", () => {
    expect(pickLip(elements, "Should I text my ex?").id).toBe(pickLip(elements, "Should I text my ex?").id);
  });
  it("explains the weak element in both languages", () => {
    const lip = pickLip(elements, "q");
    expect(lipLine("en", elements, lip)).toContain("build the water you're short on");
    expect(lipLine("vi", elements, lip)).toContain("bù phần Nước đang thiếu");
  });
  it("every Ask backup answer names the lip product", () => {
    for (const lang of ["en", "vi"] as const) for (const question of ["Should I text my ex back?", "Why can't I relax on weekends?", "What about Tuesday?"]) {
      const res = writeAskBackup({ question, theme: "love", lang, sun: "Leo", moon: "Leo", rising: null, elements, perfume: "Fig", notes: "fig", smell_words: [] });
      expect(res.answer).toContain(lipName(pickLip(elements, question)));
    }
  });
});
