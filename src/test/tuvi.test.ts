import { describe, expect, it } from "vitest";
import { buildChart } from "@/lib/tuvi/engine";
import { composeHooks, composeReading, TOPICS, tuviElements } from "@/lib/tuvi/reading";
import { trueSolar } from "@/lib/tuvi/provinces";
import { voiceIssue } from "@/lib/reading/validation";
import { LINES } from "@/lib/tuvi/blocks";

const BIRTHS = [
  { name: "A", gender: "female", date: "2009-12-01", time: "10:00" },
  { name: "B", gender: "male", date: "2010-05-12", time: "12:00" },
  { name: "C", gender: "female", date: "1979-08-07", time: "08:00" },
  { name: "D", gender: "male", date: "1980-09-13", time: "16:00" },
  { name: "E", gender: "female", date: "2000-02-01", time: "04:00" },
] as const;
const charts = BIRTHS.map((b) => buildChart({ ...b, province: "ha-noi", lon: 105.85 }));
const YEAR = 2026;

describe("tử vi engine and blocks", () => {
  it("true solar time: Hà Nội 09:53 on 1 Nov 2006 stays in giờ Tỵ", () => {
    expect(trueSolar("2006-11-01", "09:53", 105.85).hourIndex).toBe(5);
  });
  it("true solar time: 23:30 clock in Hà Nội is late Tý", () => {
    expect(trueSolar("2006-11-01", "23:30", 105.85).hourIndex).toBe(12);
  });
  it("different births get different openings", () => {
    const openings = charts.map((c) => {
      const r = composeReading(c, "overview", YEAR);
      return r.diagHead + r.diag.slice(0, 60);
    });
    expect(new Set(openings).size).toBe(charts.length);
  });
  it("every paragraph passes the voice validator", () => {
    for (const c of charts) for (const t of TOPICS) {
      const r = composeReading(c, t.key, YEAR);
      for (const part of [r.diag, r.advice, r.verdict]) expect(voiceIssue([part], "vi"), `${c.input.name}/${t.key}: ${part}`).toBeNull();
    }
  });
  it("excluded blocks never appear", () => {
    for (const c of charts) for (const t of TOPICS) {
      const r = composeReading(c, t.key, YEAR);
      const p = c.palaces.find((x) => x.name === t.palace)!;
      const hasKy = [...p.major, ...p.minor].some((s) => s.mutagen === "忌");
      expect(r.diag.includes("hóa Kỵ")).toBe(hasKy);
      expect(r.advice.includes(LINES.kyAdvice)).toBe(hasKy);
      expect(r.keys.includes("VCD_BORROW")).toBe(p.major.length === 0);
      expect(r.keys.includes("SHA")).not.toBe(r.keys.includes("NO_SHA"));
    }
  });
  it("hooks give the luck-cycle year and the 2026 palace", () => {
    const h = composeHooks(charts[3], YEAR);
    expect(h.decade.year).toBe(1980 + h.decade.age - 1);
    expect(h.yearPalace.ganZhi).toBe("Bính Ngọ");
  });
  it("element weights always sum above zero", () => {
    for (const c of charts) expect(Object.values(tuviElements(c)).reduce((a, b) => a + b, 0)).toBeGreaterThan(2);
  });
});
