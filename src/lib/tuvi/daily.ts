/** Pure Tử Vi composers for Today and Ask. Keyed blocks only, no AI, no randomness. */
import { chartBalance, variedRitual, type ElementCounts } from "@/lib/reading/balance";
import { BRANCH_VI, PALACE, STARS, STAR_VI, STEM_VI, type Bucket } from "./blocks";
import { palaceOf, rulers, TOPICS, type TopicKey } from "./reading";
import type { TuviChart, TuviPalace } from "./types";

type Lang = "en" | "vi";
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

export const PALACE_EN: Record<string, { name: string; domain: string; advice: string }> = {
  命宫: { name: "Destiny", domain: "who you are", advice: "Work from your strengths instead of performing someone else's." },
  兄弟: { name: "Siblings", domain: "siblings and business partners", advice: "Put money matters with family and partners in writing." },
  夫妻: { name: "Spouse", domain: "love and marriage", advice: "Say the thing that bothers you once, plainly, before it piles up." },
  子女: { name: "Children", domain: "children and the people you mentor", advice: "Teach by doing. Lectures go in one ear." },
  财帛: { name: "Wealth", domain: "money", advice: "Split spending money and savings into two accounts this month." },
  疾厄: { name: "Health", domain: "health and the body", advice: "Book the yearly check-up instead of waiting for pain." },
  迁移: { name: "Travel", domain: "travel and how the world sees you", advice: "Outside your circle, people remember manners more than wit." },
  仆役: { name: "Friends", domain: "friends, contacts and staff", advice: "Fewer, solid friends. Stop carrying everyone's problems." },
  官禄: { name: "Career", domain: "work and career", advice: "Pick one skill and go deep. Constant job-hopping costs you roots." },
  田宅: { name: "Property", domain: "home, land and family life", advice: "Read the papers twice before buying anything with walls." },
  福德: { name: "Fortune", domain: "your inner life and how you rest", advice: "Keep one phone-free stretch every day that belongs to nobody else." },
  父母: { name: "Parents", domain: "parents, bosses and paperwork", advice: "With elders and bosses, ask first. It saves a fight later." },
};

export const STAR_EN: Record<string, string> = {
  紫微: "Born to run things, and quietly expects the room to wait for you",
  天机: "A fast, restless mind that plans three moves ahead and second-guesses all of them",
  太阳: "Gives warmth and help freely, then wonders why you're the one who's tired",
  武曲: "Decisive and money-minded, better with numbers than with feelings",
  天同: "Easygoing and comfort-loving, which is lovely until a deadline arrives",
  廉贞: "Intense and principled, with a temper you think nobody notices",
  天府: "Steady and careful, the person who keeps the reserves and the receipts",
  太阴: "Gentle and observant, feels everything and says about a third of it",
  贪狼: "Charming, curious and hungry for everything at once",
  巨门: "Sharp-tongued and analytical, wins arguments and loses the mood",
  天相: "Fair and diplomatic, so good at keeping peace that your own needs go missing",
  天梁: "The elder in every room, protective and slightly preachy",
  七杀: "Bold and impatient, would rather break through than wait for a door",
  破军: "Tears things down to rebuild them, sometimes before asking anyone",
};

const BUCKET_WORD: Record<Lang, Record<Bucket, string>> = {
  en: { fire: "Fire", earth: "Earth", air: "Metal and Wood", water: "Water" },
  vi: { fire: "Hỏa", earth: "Thổ", air: "Kim, Mộc", water: "Thủy" },
};

/** Day stem-branch from the Julian day number; 2000-01-01 is 戊午. */
export function dayGanZhi(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const jdn = Math.floor(Date.UTC(y, m - 1, d) / 86400000) + 2440588;
  const idx = (jdn + 49) % 60;
  return { idx, stem: STEMS[idx % 10], branch: BRANCHES[idx % 12], label: `${STEM_VI[STEMS[idx % 10]]} ${BRANCH_VI[BRANCHES[idx % 12]]}` };
}

const palaceName = (p: TuviPalace, lang: Lang) => (lang === "vi" ? PALACE[p.name]?.vi : PALACE_EN[p.name]?.name) ?? p.name;
const domainOf = (p: TuviPalace, lang: Lang) => (lang === "vi" ? PALACE[p.name]?.domain : PALACE_EN[p.name]?.domain) ?? "";
const adviceOf = (p: TuviPalace, lang: Lang) => (lang === "vi" ? PALACE[p.name]?.advice : PALACE_EN[p.name]?.advice) ?? "";
function starText(c: TuviChart, p: TuviPalace, lang: Lang) {
  const { stars, borrowed } = rulers(c, p);
  const names = stars.map((s) => STAR_VI[s.name] ?? s.name).join(" + ");
  const main = stars[0];
  const core = main ? (lang === "vi" ? STARS[main.name]?.core : STAR_EN[main.name]) : undefined;
  return { names, core, borrowed };
}
export const weakElement = (e: ElementCounts) => chartBalance(e).least[0];
export const elementWord = (b: Bucket, lang: Lang) => BUCKET_WORD[lang][b];

export interface TodayPlan {
  date: string;
  ganZhi: string;
  palace: string;
  stars: string;
  lines: string[];
  ritual: { id: string; action: string };
}
export function composeToday(c: TuviChart, date: string, lang: Lang, elements: ElementCounts): TodayPlan {
  const day = dayGanZhi(date);
  const p = c.palaces.find((q) => q.branch === day.branch)!;
  const s = starText(c, p, lang);
  const weak = weakElement(elements);
  const lines =
    lang === "vi"
      ? [
          `Hôm nay là ngày ${day.label}. Chi ngày rơi vào cung ${palaceName(p, lang)} của mình, nên chuyện ${domainOf(p, lang)} sẽ là chuyện nổi lên trước.`,
          s.names ? `Cung này có ${s.names}${s.borrowed ? " (cung trống, mượn sao cung đối)" : ""}. ${s.core}.` : "Cung này trống chính tinh, ai đến đúng lúc thì việc chạy theo người đó.",
          `Lời khuyên cho hôm nay: ${adviceOf(p, lang)}`,
          weak ? `Lá số mình thiếu ${elementWord(weak, lang)}, nên hôm nay dùng mùi hương và màu son bù phần đó.` : "Ngũ hành lá số khá cân, hôm nay chỉ cần giữ nhịp.",
        ]
      : [
          `Today is a ${day.label} day. Its branch lands on your ${palaceName(p, lang)} palace, so ${domainOf(p, lang)} is what comes up first.`,
          s.names ? `That palace holds ${s.names}${s.borrowed ? " (empty, so it borrows from the opposite palace)" : ""}. ${s.core}.` : "That palace has no major star, so the day follows whoever shows up on time.",
          `For today: ${adviceOf(p, lang)}`,
          weak ? `Your chart runs short on ${elementWord(weak, lang)}, so today's scent and lip colour fill that gap.` : "Your elements are fairly even, so today is about keeping the rhythm.",
        ];
  return { date, ganZhi: day.label, palace: palaceName(p, lang), stars: s.names, lines, ritual: variedRitual(`${date}${c.pillars}`, lang, day.idx, weak) };
}

const TOPIC_WORDS: [TopicKey, RegExp][] = [
  ["love", /\b(love|date|dating|partner|relationship|marri\w*|crush|ex|boyfriend|girlfriend|husband|wife)\b|người yêu|tình cảm|tình yêu|hẹn hò|cưới|vợ|chồng|crush/iu],
  ["career", /\b(work|job|jobs|career|careers|boss|promotion|business|office|quit)\b|công việc|sự nghiệp|sếp|công ty|thăng chức|kinh doanh|nghỉ việc/iu],
  ["wealth", /\b(money|salary|debt|invest\w*|saving|savings|rich|spend\w*)\b|tiền|lương|nợ|tài chính|tiết kiệm/iu],
  ["health", /\b(health|sleep|tired|stress\w*|body|energy)\b|sức khỏe|ngủ|mệt|căng thẳng/iu],
  ["parents", /\b(parent|parents|mother|father|mom|dad|mum)\b|cha mẹ|bố mẹ|ba mẹ|\bmẹ\b|\bbố\b/iu],
  ["friends", /\b(friend|friends|colleague|colleagues|people)\b|bạn bè|đồng nghiệp/iu],
  ["property", /\b(house|home|move|moving|apartment|flat)\b|nhà|chuyển nhà|căn hộ/iu],
  ["travel", /\b(travel|abroad|trip|overseas)\b|đi xa|du học|nước ngoài|du lịch/iu],
  ["children", /\b(child|children|kid|kids|son|daughter)\b|con cái|\bcon\b/iu],
];
const SENSITIVE = /\b(pregnan\w*|lawsuit|lottery|stock|stocks|crypto|cancer|diagnos\w*)\b|mang thai|kiện|xổ số|chứng khoán|ung thư/iu;
export const askTopic = (q: string): TopicKey => TOPIC_WORDS.find(([, re]) => re.test(q))?.[0] ?? "overview";

export interface AskAnswer { topic: TopicKey; palace: string; paragraphs: string[]; ritual: { id: string; action: string } }
/** perfume: the scent name plus its actual smell words, picked by code for the weakest element. */
export function composeAsk(c: TuviChart, question: string, lang: Lang, year: number, elements: ElementCounts, perfume: { name: string; smells: string[]; matched: boolean } | null, pair: string): AskAnswer {
  const topic = askTopic(question);
  const p = palaceOf(c, TOPICS.find((x) => x.key === topic)!.palace);
  const s = starText(c, p, lang);
  const yp = c.palaces.find((q) => q.branch === BRANCHES[(year - 4) % 12])!;
  const weak = weakElement(elements);
  const sensitive = SENSITIVE.test(question);
  const vi = lang === "vi";
  const opening = vi
    ? `${sensitive ? "Chuyện này cần người có chuyên môn, lá số không thay được bác sĩ hay luật sư. Nhưng nhìn cách mình xử lý thì: " : "Nói thẳng: "}câu này nằm ở cung ${palaceName(p, lang)}. ${s.names ? `Ở đó có ${s.names}${s.borrowed ? ", cung trống nên mượn sao cung đối" : ""}. ${s.core}.` : "Cung này trống chính tinh, nên kết quả phụ thuộc người đi cùng mình."}`
    : `${sensitive ? "That one needs a professional, a chart can't replace a doctor or a lawyer. But on how you handle it: " : "Straight answer: "}this sits in your ${palaceName(p, lang)} palace. ${s.names ? `It holds ${s.names}${s.borrowed ? ", borrowed from the opposite palace because it's empty" : ""}. ${s.core}.` : "It has no major star, so the outcome depends on who you bring along."}`;
  const yearLine = vi
    ? `Năm ${year} tiểu hạn đi qua cung ${palaceName(yp, lang)}, nên chuyện ${domainOf(yp, lang)} động trước. Việc nên làm: ${adviceOf(p, lang)}`
    : `In ${year} the year passes through your ${palaceName(yp, lang)} palace, so ${domainOf(yp, lang)} is where things move first. What to do: ${adviceOf(p, lang)}`;
  const scent = perfume
    ? vi
      ? `${weak ? `Lá số mình thiếu ${elementWord(weak, lang)}. ` : ""}${perfume.name} có mùi ${perfume.smells.slice(0, 3).join(", ")}, ${perfume.matched ? "chính là phần đang hụt" : "là chai gần nhất với phần đang hụt mà kệ đang có"}. ${pair}`
      : `${weak ? `Your chart runs short on ${elementWord(weak, lang)}. ` : ""}${perfume.name} smells of ${perfume.smells.slice(0, 3).join(", ")}, ${perfume.matched ? "which is exactly the missing piece" : "the closest thing to the missing piece on the shelf right now"}. ${pair}`
    : pair;
  const ritual = variedRitual(`${question}${c.pillars}`, lang, 0, weak);
  return { topic, palace: palaceName(p, lang), paragraphs: [opening, yearLine, scent, ritual.action], ritual };
}
