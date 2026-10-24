import { describe, it, expect } from "vitest";
import { validate } from "@/lib/reading/validation";

const ok = { truth: "You fix things when angry. You go quiet first.", cost: "You burn out at work first.", scent: "It smells like clean laundry. It matches how you work." };
const words = (n: number) => Array(n).fill("word").join(" ") + ".";

describe("write-reading validation", () => {
  it("accepts a valid reading", () => expect(validate(ok, "en")).toBeNull());
  it("rejects a banned word", () => expect(validate({ ...ok, cost: "Your energy runs out." }, "en")).toMatch(/banned word: energy/));
  it("rejects an English sentence over 22 words", () => {
    expect(validate({ ...ok, cost: words(23) }, "en")).toMatch(/too long/);
    expect(validate({ ...ok, cost: words(22) }, "en")).toBeNull();
  });
  it("rejects repeated Vietnamese pronouns", () => {
    expect(validate({ truth: "Bạn nghĩ quá lâu. Bạn lại chờ." , cost: "Việc cứ dở dang.", scent: "Mùi cỏ vừa cắt. Thơm nhẹ thôi." }, "vi")).toBe("repeated pronoun");
  });
  it("allows at most 30 Vietnamese words per sentence", () => {
    expect(validate({ ...ok, cost: words(30) }, "vi")).toBeNull();
    expect(validate({ ...ok, cost: words(31) }, "vi")).toBe("sentence too long");
  });
});
