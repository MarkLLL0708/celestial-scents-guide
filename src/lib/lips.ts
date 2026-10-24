import { chartBalance, type Element, type ElementCounts } from "@/lib/reading/balance";

type Lang = "en" | "vi";
export type LipType = "lipstick" | "gloss" | "oil" | "balm";
export type LipFinish = "velvet" | "satin" | "matte" | "shine" | "glow";
export interface LipProduct {
  id: string;
  brand: "Dior" | "Armani" | "YSL";
  line: string;
  shade: string;
  type: LipType;
  finish: LipFinish;
  /** Colour family in plain words, used to explain the pick. */
  colour: { en: string; vi: string };
  /** Element the colour carries; the shade is chosen to build the chart's weakest element. */
  element: Element;
  /** Price and size stay pending until the owner supplies them; purchase stays off. */
  price: null;
  size: null;
}

const p = (id: string, brand: LipProduct["brand"], line: string, shade: string, type: LipType, finish: LipFinish, element: Element, en: string, vi: string): LipProduct =>
  ({ id, brand, line, shade, type, finish, element, colour: { en, vi }, price: null, size: null });

/** Starter shelf from the owner's brands; full latest-collection list, prices and sizes pending. */
export const LIP_PRODUCTS: LipProduct[] = [
  p("dior-rouge-999", "Dior", "Rouge Dior", "999", "lipstick", "velvet", "fire", "a true red", "đỏ chuẩn"),
  p("dior-rouge-720", "Dior", "Rouge Dior", "720 Icône", "lipstick", "satin", "earth", "a warm rosewood brown", "nâu hồng gỗ ấm"),
  p("dior-rouge-100", "Dior", "Rouge Dior", "100 Nude Look", "lipstick", "velvet", "earth", "a soft beige nude", "nude be dịu"),
  p("dior-glow-001", "Dior", "Dior Addict Lip Glow", "001 Pink", "balm", "glow", "air", "a sheer pink that reacts to your lips", "hồng trong, lên màu theo môi"),
  p("dior-glow-004", "Dior", "Dior Addict Lip Glow", "004 Coral", "balm", "glow", "fire", "a sheer coral", "cam san hô trong"),
  p("dior-maximizer-001", "Dior", "Dior Addict Lip Maximizer", "001 Pink", "gloss", "shine", "air", "a clear pink plumping gloss", "son bóng hồng trong làm đầy môi"),
  p("dior-oil-012", "Dior", "Dior Addict Lip Glow Oil", "012 Rosewood", "oil", "shine", "water", "a glossy rosewood", "hồng gỗ bóng"),
  p("armani-power-400", "Armani", "Lip Power", "400", "lipstick", "satin", "fire", "a deep warm red", "đỏ ấm đậm"),
  p("armani-maestro-400", "Armani", "Lip Maestro", "400", "lipstick", "velvet", "fire", "a brick red velvet", "đỏ gạch mịn"),
  p("armani-maestro-405", "Armani", "Lip Maestro", "405", "lipstick", "velvet", "water", "a deep rose berry", "hồng đất ngả mọng"),
  p("ysl-rpc-01", "YSL", "Rouge Pur Couture", "01 Le Rouge", "lipstick", "satin", "fire", "a bright pure red", "đỏ tươi"),
  p("ysl-slim-1966", "YSL", "The Slim", "1966 Rouge Libre", "lipstick", "matte", "earth", "a brick red-brown", "đỏ nâu gạch"),
  p("ysl-slim-21", "YSL", "The Slim", "21 Rouge Paradoxe", "lipstick", "matte", "water", "a deep berry red", "đỏ mọng đậm"),
  p("ysl-candy-glaze", "YSL", "Candy Glaze", "pink", "gloss", "shine", "air", "a sheer glassy pink", "hồng trong bóng như kẹo"),
];

/** Finish carries the strongest element: matte/velvet = earth, satin = fire, glow = air, shine = water. */
const FINISH_ELEMENT: Record<LipFinish, Element> = { matte: "earth", velvet: "earth", satin: "fire", glow: "air", shine: "water" };
const FINISH_WHY: Record<LipFinish, { en: string; vi: string }> = {
  matte: { en: "the matte finish stays put, the way your steady side does", vi: "chất lì bám chắc, giống phần vững của mình" },
  velvet: { en: "the velvet finish is soft but doesn't budge", vi: "chất mịn nhung mềm mà bền" },
  satin: { en: "the satin finish has a bit of glow, enough to be noticed", vi: "chất satin hơi ánh, đủ để người ta để ý" },
  glow: { en: "the sheer glow looks like your lips, only less tired", vi: "lớp trong nhẹ trông như môi thật, chỉ tươi hơn" },
  shine: { en: "the shine catches light and makes you look easier to approach", vi: "độ bóng bắt sáng, trông dễ gần hơn" },
};
const ELEMENT_WORD = { en: { fire: "fire", earth: "earth", air: "air", water: "water" }, vi: { fire: "Lửa", earth: "Đất", air: "Khí", water: "Nước" } } as const;
const COLOUR_JOB: Record<Element, { en: string; vi: string }> = {
  fire: { en: "red and coral read as nerve: you look like you've already decided", vi: "đỏ và cam san hô trông dứt khoát, như đã quyết rồi" },
  earth: { en: "nudes and browns read as grounded: you look like you'll actually follow through", vi: "nude và nâu trông vững vàng, như sẽ làm tới nơi" },
  air: { en: "sheer pinks read as light: you look open to a conversation instead of a verdict", vi: "hồng trong trông nhẹ nhàng, sẵn sàng nói chuyện chứ không phán xét" },
  water: { en: "berries and glossy rose read as soft: you look like someone people can tell things to", vi: "tông mọng và hồng bóng trông mềm, người ta dễ tâm sự hơn" },
};

const hashOf = (text: string) => [...text].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 0);

/** Deterministic: same chart and context always give the same lip, so text and cards agree. */
export function pickLip(elements: ElementCounts, context: string, shelf: LipProduct[] = LIP_PRODUCTS): LipProduct {
  const b = chartBalance(elements);
  const weak = b.balanced ? undefined : b.least[0];
  const strong = b.strongest[0];
  const byColour = weak ? shelf.filter((l) => l.element === weak) : shelf;
  const pool = byColour.length ? byColour : shelf;
  const best = strong ? pool.filter((l) => FINISH_ELEMENT[l.finish] === strong) : [];
  const choices = best.length ? [...best, ...pool.filter((l) => !best.includes(l))].slice(0, Math.max(2, best.length)) : pool;
  return choices[hashOf(context) % choices.length];
}

export const lipName = (l: LipProduct) => `${l.line.startsWith(l.brand) ? "" : `${l.brand} `}${l.line} ${l.shade}`;

/** One friend-voice paragraph explaining the lip by the chart's strong and weak elements. */
export function lipLine(lang: Lang, elements: ElementCounts, lip: LipProduct): string {
  const b = chartBalance(elements);
  const weak = b.balanced ? undefined : b.least[0];
  const strong = b.strongest[0];
  const w = ELEMENT_WORD[lang];
  const name = lipName(lip);
  const colour = lip.colour[lang];
  const finish = FINISH_WHY[lip.finish][lang];
  const backs = strong && FINISH_ELEMENT[lip.finish] === strong;
  if (lang === "vi") {
    const why = weak && lip.element === weak
      ? `Màu ${colour} để bù phần ${w[weak]} đang thiếu: ${COLOUR_JOB[weak].vi}.`
      : `Màu ${colour}: ${COLOUR_JOB[lip.element].vi}.`;
    return `Đi kèm là son ${name}. ${why} Còn ${finish}${backs && strong ? `, giữ đúng thế mạnh ${w[strong]} của mình` : ""}.`;
  }
  const why = weak && lip.element === weak
    ? `It's ${colour}, there to build the ${w[weak]} you're short on: ${COLOUR_JOB[weak].en}.`
    : `It's ${colour}: ${COLOUR_JOB[lip.element].en}.`;
  return `Pair it with ${name}. ${why} And ${finish}${backs && strong ? `, which plays up the ${w[strong]} you already lead with` : ""}.`;
}

/** Ties the lip and perfume into one pick so they read as a pair, not two add-ons. */
export function pairLine(lang: Lang, elements: ElementCounts, lip: LipProduct, perfume: string): string {
  const b = chartBalance(elements);
  const weak = b.balanced ? undefined : b.least[0];
  const strong = b.strongest[0];
  const w = ELEMENT_WORD[lang];
  const name = lipName(lip);
  if (lang === "vi") {
    return weak && strong
      ? `Đi chung thì ${perfume} lo phần ${w[strong]} mình vốn mạnh, còn ${name} kéo phần ${w[weak]} lên. Một cái giữ thế, một cái bù chỗ hụt, vậy là đủ một bộ.`
      : `${perfume} với ${name} đi chung một bộ: không bù gì cả, chỉ để nhắc mình giữ nhịp đang ổn.`;
  }
  return weak && strong
    ? `Worn together, ${perfume} handles the ${w[strong]} you already have and ${name} does the ${w[weak]} work. One keeps your edge, one covers the gap. That's the whole outfit.`
    : `${perfume} and ${name} are one set here: nothing to fix, just a reminder to keep the balance you've got.`;
}
