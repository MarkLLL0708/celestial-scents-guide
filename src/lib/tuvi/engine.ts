/** Browser-side Tử Vi chart builder. Load with dynamic import so iztro never ships on other pages. */
import { astro } from "iztro";
import { trueSolar } from "./provinces";
import type { TuviChart, TuviInput, TuviPalace } from "./types";

export function buildChart(input: TuviInput): TuviChart {
  const ts = trueSolar(input.date, input.time, input.lon);
  const a = astro.bySolar(ts.date, ts.hourIndex, input.gender === "male" ? "男" : "女", true, "zh-CN");
  const palaces: TuviPalace[] = a.palaces.map((p) => ({
    name: p.name,
    stem: p.heavenlyStem,
    branch: p.earthlyBranch,
    isBody: p.isBodyPalace,
    major: p.majorStars.map((s) => ({ name: s.name, brightness: s.brightness || "", mutagen: s.mutagen || "" })),
    minor: p.minorStars.map((s) => ({ name: s.name, brightness: s.brightness || "", mutagen: s.mutagen || "" })),
    decade: [p.decadal.range[0], p.decadal.range[1]],
  }));
  return {
    input,
    solar: ts,
    birthYear: Number(input.date.slice(0, 4)),
    lunarDate: a.lunarDate,
    pillars: a.chineseDate,
    bureau: a.fiveElementsClass,
    soul: a.soul,
    body: a.body,
    palaces,
  };
}
