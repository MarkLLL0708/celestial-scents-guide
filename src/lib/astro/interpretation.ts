import { en, type Dictionary } from "@/i18n/en";
import { vi } from "@/i18n/vi";
import type { Chart, Planet, Transit } from "@/data/types";
import { SIGN_ORDER as SIGNS } from "@/config/scentMap";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const dictionary = (lang: "en" | "vi"): Dictionary => lang === "vi" ? vi : en;
const key = (s: string) => s as keyof Dictionary;
export function placementInterpretation(chart: Chart, body: Planet, lang: "en" | "vi") {
  const t = dictionary(lang);
  const detail = chart.details[body];
  if (!detail) return { title: t.youNoHouse, paragraphs: [t.youNoHouse] };
  const sign = detail.sign;
  const house = chart.rising ? ((SIGNS.indexOf(sign as typeof SIGNS[number]) - SIGNS.indexOf(chart.rising as typeof SIGNS[number]) + 12) % 12) + 1 : null;
  const planet = t[key(`planet${cap(body)}`)];
  const meaning = t[key(`mean${cap(body)}`)];
  const expression = t[key(`sign${sign}`)];
  const houseLine = house ? t.youHouseLine.replace("{n}", t[key(`ord${house}`)]).replace("{meaning}", t[key(`house${house}`)]) : t.youNoHouse;
  return {
    title: t.youInSign.replace("{planet}", planet).replace("{sign}", t[key(sign)]),
    paragraphs: [meaning, expression, houseLine, t.inspectorShadow, t.inspectorPractice],
  };
}
export function chapterInterpretation(chart: Chart, body: Planet, chapter: number, lang: "en" | "vi") {
  const t = dictionary(lang);
  const details = placementInterpretation(chart, body, lang);
  const chapterText = [t.chapterOriginBody, t.chapterRelationshipBody, t.chapterTroubleBody, t.chapterNeedsBody, t.chapterMissionBody][chapter] ?? t.chapterMissionBody;
  return `${details.title}. ${details.paragraphs.slice(0,3).join(" ")}\n\n${chapterText}`;
}
export function dailyInterpretation(chart: Chart, transit: Transit, lang: "en" | "vi") {
  const t = dictionary(lang);
  const text = t.transitFormat.replace("{a}", t[key(`planet${cap(transit.transiting)}`)]).replace("{b}", t[key(`planet${cap(transit.natal)}`)]).replace("{aspect}", t[key(`aspect${cap(transit.aspect)}`)]);
  const natal = placementInterpretation(chart, transit.natal, lang);
  const kind = transit.kind ?? (["trine", "sextile"].includes(transit.aspect) ? "easy" : ["square", "opposite"].includes(transit.aspect) ? "hard" : "intense");
  return [t.dailyExact.replace("{transit}", text).replace("{orb}", String(transit.orb)), `${natal.title}. ${natal.paragraphs.slice(0,3).join(" ")}`, kind === "easy" ? t.dailyEasy : kind === "hard" ? t.dailyHard : t.dailyIntense];
}