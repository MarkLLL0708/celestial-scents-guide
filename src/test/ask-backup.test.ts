import { describe, expect, it } from "vitest";
import { questionIntent, writeAskBackup, type AskBackupInput } from "@/lib/ask/backup.server";

const input: AskBackupInput = {
  question: "Should I text my ex back?", theme: "love", lang: "en", sun: "Capricorn", moon: "Gemini", rising: null,
  elements: { fire: 4, earth: 8, air: 3, water: 0 }, perfume: "Test scent", notes: "iris, musk", smell_words: ["your skin but better"],
};
describe("question-aware Ask backup", () => {
  it("addresses ex-texting and work irritation differently in both languages", () => {
    for (const lang of ["en", "vi"] as const) {
      const ex = writeAskBackup({ ...input, lang, question: lang === "en" ? input.question : "Có nên nhắn lại người cũ không?" });
      const work = writeAskBackup({ ...input, lang, question: lang === "en" ? "Why does everyone at work annoy me?" : "Sao ai ở chỗ làm cũng làm mình bực?" });
      expect(ex.answer.split("\n\n")[0]).not.toBe(work.answer.split("\n\n")[0]);
      expect(ex.ritualId).not.toBe(work.ritualId);
      expect(ex.answer).toContain("Test scent");
      if (lang === "en") expect(ex.answer).toContain("iris, musk");
      expect(ex.answer).toContain(lang === "en" ? "earth leads (8)" : "Đất mạnh nhất (8)");
      expect(ex.answer).toContain(lang === "en" ? "water is absent (0)" : "Nước vắng mặt (0)");
      expect(ex.answer).toContain(lang === "en" ? "Leave the message unsent" : "Khoan gửi tin nhắn");
    }
  });
  it("never calls a nonzero weak element absent", () => {
    expect(writeAskBackup({ ...input, elements: { ...input.elements, water: 1 } }).answer).toContain("water is lowest (1)");
  });
  it("uses Vietnamese ingredient names", () => {
    expect(writeAskBackup({ ...input, lang: "vi", notes: "tea, citrus" }).answer).toContain("Trà, Cam chanh");
  });
  it("doesn't invent a deficit for balanced charts", () => {
    expect(writeAskBackup({ ...input, elements: { fire: 4, earth: 4, air: 4, water: 4 } }).answer).toContain("no strongest or weakest");
  });
  it("explains only supplied smell tags and never invents missing products", () => {
    expect(writeAskBackup(input).answer).toContain("skin-like smell");
    expect(writeAskBackup(input).answer).not.toContain("orange peel");
    expect(writeAskBackup({ ...input, perfume: null }).answer).toContain("not inventing a bottle");
  });
  it("varies repeat rituals without changing the answer to the question", () => {
    const a = writeAskBackup(input, 0).answer.split("\n\n");
    const b = writeAskBackup(input, 1).answer.split("\n\n");
    expect(a[0]).toBe(b[0]);
    expect(a[3]).not.toBe(b[3]);
  });
  it("recognises English and native Vietnamese intents", () => {
    expect(questionIntent("Why can't I relax on weekends?")).toBe("rest");
    expect(questionIntent("Sao mình cứ bắt đầu rồi bỏ dở?")).toBe("finish");
    expect(questionIntent("Mình có kén chọn quá không?")).toBe("standards");
  });
  it("asks for context rather than inventing an answer to an unknown question", () => {
    expect(writeAskBackup({ ...input, question: "What about Tuesday?" }).answer).toContain("don't have enough context");
  });
  it("doesn't provide specialist advice through a chart", () => {
    expect(questionIntent("Should I stop medication?")).toBe("sensitive");
    expect(writeAskBackup({ ...input, question: "Should I stop medication?" }).answer).toContain("qualified support");
  });
});