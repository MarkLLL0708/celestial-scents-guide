/** Hand-written friend-voice reading used whenever the AI writer is unavailable. Pure: no birth inputs, no I/O. */
import { chartBalance, type ElementCounts, type Element } from "./balance";

type Lang = "en" | "vi";
type Sign = "Aries" | "Taurus" | "Gemini" | "Cancer" | "Leo" | "Virgo" | "Libra" | "Scorpio" | "Sagittarius" | "Capricorn" | "Aquarius" | "Pisces";

const AREA: Record<Lang, Record<string, string>> = {
  en: {
    sun: "This one's about how you run your whole personality.",
    moon: "This is how you act when you're tired and nobody's watching.",
    rising: "This is the first impression you make before you open your mouth.",
    mercury: "This is how your brain handles texts, arguments and decisions.",
    venus: "This is how you act when you like someone.",
    mars: "This is how you chase what you want.",
    jupiter: "This is where you get lucky and then get lazy about it.",
    saturn: "This is the part of life that refuses to be rushed.",
    uranus: "This is where you rebel just to prove a point.",
    neptune: "This is where you see what you want to see.",
    pluto: "This is where you'd rather control everything than trust anyone.",
  },
  vi: {
    sun: "Cái này là cách mình vận hành cả con người mình.",
    moon: "Đây là lúc mệt và chẳng ai nhìn thì mình cư xử thế nào.",
    rising: "Đây là ấn tượng đầu tiên trước khi mình kịp mở miệng.",
    mercury: "Đây là cách đầu óc mình xử lý tin nhắn, cãi nhau và quyết định.",
    venus: "Đây là cách mình cư xử khi thích ai đó.",
    mars: "Đây là cách mình đuổi theo thứ mình muốn.",
    jupiter: "Đây là chỗ mình gặp may rồi lười luôn.",
    saturn: "Đây là phần đời không chịu bị hối.",
    uranus: "Đây là chỗ mình nổi loạn chỉ để chứng minh một điều.",
    neptune: "Đây là chỗ mình chỉ thấy cái mình muốn thấy.",
    pluto: "Đây là chỗ mình thà kiểm soát hết còn hơn tin ai.",
  },
};

const SIGN: Record<Lang, Record<Sign, [habit: string, jab: string, cost: string]>> = {
  en: {
    Aries: ["You decide in four seconds and call it instinct.", "Half the time it's just impatience in a nice jacket.", "People stop telling you things because you've already moved on."],
    Taurus: ["You'd rather stay comfortable than admit something stopped working.", "Stubborn isn't a personality, it's a delay.", "You lose good years defending a routine you don't even like."],
    Gemini: ["You have six opinions and commit to none of them.", "Keeping options open is just dodging a decision with better branding.", "People never quite know where they stand with you."],
    Cancer: ["You remember every slight and call it being sensitive.", "You also mother people who never asked for it.", "You end up exhausted from caring for everyone except yourself."],
    Leo: ["You want to be noticed and pretend you don't.", "Then you sulk when the room doesn't clap.", "People start performing for you instead of being honest with you."],
    Virgo: ["You fix other people's mistakes and quietly keep score.", "Nobody asked for the edit.", "You burn out proving you're useful to people who'd like you anyway."],
    Libra: ["You agree with whoever spoke last to keep the peace.", "That's not kindness, it's hiding.", "Nobody ever gets to meet what you actually think."],
    Scorpio: ["You test people quietly and fail them without telling them.", "Trust issues aren't a mystery, they're a habit.", "The people worth keeping get tired of passing exams."],
    Sagittarius: ["You leave the moment something gets boring or serious.", "You call it freedom, but it's mostly running.", "Nothing gets deep enough to actually hold you."],
    Capricorn: ["You treat rest like something you have to earn.", "Working late isn't a personality either.", "You'll be very successful and very tired at the same time."],
    Aquarius: ["You go cold the second someone needs something emotional from you.", "Being different doesn't mean being unreachable.", "People feel like they're talking to a locked door."],
    Pisces: ["You drift into daydreams instead of dealing with the actual problem.", "The problem waits, and it's very patient.", "Things you could have fixed early get big and loud."],
  },
  vi: {
    Aries: ["Quyết trong bốn giây rồi gọi đó là bản năng.", "Nói thật thì phần nhiều là nóng vội khoác áo đẹp thôi.", "Người ta thôi kể chuyện với mình vì mình đã sang chuyện khác rồi."],
    Taurus: ["Thà ở yên trong vùng thoải mái còn hơn thừa nhận có thứ đã hỏng.", "Cứng đầu đâu phải tính cách, nó chỉ là trì hoãn thôi.", "Mất cả mấy năm để giữ một thói quen mà chính mình chẳng thích."],
    Gemini: ["Có sáu ý kiến mà chẳng chốt cái nào.", "Để ngỏ mọi lựa chọn thì cũng chỉ là né quyết định cho sang thôi.", "Người xung quanh chẳng bao giờ biết mình đứng ở đâu."],
    Cancer: ["Nhớ từng lần bị tổn thương rồi gọi đó là nhạy cảm.", "Còn chăm người ta trong khi người ta chẳng nhờ.", "Cuối cùng kiệt sức vì lo cho cả thế giới trừ chính mình."],
    Leo: ["Muốn được để ý mà cứ làm như không.", "Rồi dỗi khi cả phòng không vỗ tay.", "Người ta bắt đầu diễn cho mình xem thay vì nói thật."],
    Virgo: ["Sửa lỗi cho người khác rồi lặng lẽ ghi sổ.", "Chẳng ai nhờ mình biên tập đâu.", "Kiệt sức để chứng minh mình có ích với những người vốn đã quý mình rồi."],
    Libra: ["Ai nói sau cùng thì đồng ý với người đó, cho êm chuyện.", "Đấy không phải tử tế, đấy là trốn.", "Chẳng ai được gặp suy nghĩ thật của mình cả."],
    Scorpio: ["Âm thầm thử người ta rồi đánh trượt mà không báo.", "Khó tin người đâu phải bí ẩn, nó là thói quen.", "Những người đáng giữ rồi cũng mệt vì phải thi mãi."],
    Sagittarius: ["Hễ chuyện gì chán hoặc nghiêm túc là chuồn.", "Gọi là tự do chứ phần lớn là chạy trốn.", "Chẳng có gì đủ sâu để giữ được mình."],
    Capricorn: ["Coi nghỉ ngơi như thứ phải kiếm mới được hưởng.", "Làm muộn cũng đâu phải tính cách.", "Rồi sẽ rất thành công và rất mệt cùng một lúc."],
    Aquarius: ["Hễ ai cần mình về mặt cảm xúc là lạnh tanh.", "Khác người đâu có nghĩa là không ai chạm tới được.", "Người ta thấy như đang nói chuyện với một cánh cửa khóa."],
    Pisces: ["Trốn vào mơ mộng thay vì xử lý vấn đề thật.", "Vấn đề thì cứ chờ, nó kiên nhẫn lắm.", "Chuyện sửa được từ sớm cứ to dần rồi ầm lên."],
  },
};

const HOUSE: Record<Lang, string[]> = {
  en: ["how you come across", "money and comfort", "texts and daily errands", "home and family", "dating and fun", "work routines and your body", "partners", "intimacy and shared money", "travel and big beliefs", "career and reputation", "friends and group chats", "the stuff you keep private"],
  vi: ["cách mình xuất hiện trước người khác", "tiền nong và sự thoải mái", "tin nhắn và việc vặt hằng ngày", "nhà cửa và gia đình", "hẹn hò và vui chơi", "công việc hằng ngày và cơ thể", "người yêu, người cộng sự", "chuyện thân mật và tiền chung", "đi xa và niềm tin lớn", "sự nghiệp và danh tiếng", "hội bạn và các nhóm chat", "những thứ mình giấu kín"],
};

const ANGLE: Record<Lang, string[]> = {
  en: ["It feels so normal you don't even notice you're doing it.", "The people close to you notice it first and are too polite to say so.", "Under pressure this gets louder, not smarter.", "What you actually need is less performing and more sleep.", "Use it on purpose this month instead of letting it run you."],
  vi: ["Quen tới mức chẳng còn nhận ra mình đang làm vậy.", "Người thân thấy trước tiên, chỉ là ngại không nói.", "Lúc căng thẳng thì nó to hơn chứ chẳng khôn hơn.", "Thứ thật sự cần là bớt diễn và ngủ nhiều hơn.", "Tháng này dùng nó có chủ đích, đừng để nó dắt mình đi."],
};

const ELEMENT_NAME: Record<Lang, Record<Element, string>> = {
  en: { fire: "fire", earth: "earth", air: "air", water: "water" },
  vi: { fire: "Lửa", earth: "Đất", air: "Khí", water: "Nước" },
};
const NEED: Record<Lang, Record<Element, string>> = {
  en: { fire: "starting things is the part you stall on", earth: "follow-through is the part that goes missing", air: "stepping back to think gets skipped", water: "feelings get filed away instead of felt" },
  vi: { fire: "khoản bắt đầu là khoản hay bị chần chừ", earth: "làm đến nơi đến chốn là khoản hay rơi rớt", air: "lùi lại nghĩ cho thoáng là khoản hay bị bỏ qua", water: "cảm xúc toàn bị cất đi thay vì được cảm" },
};
const SMELL_VI: Record<string, string> = {
  "spicy kitchen": "gian bếp nhiều gia vị", "orange peel": "vỏ cam", "warm blanket": "chăn ấm", "warm bread": "bánh mì mới nướng",
  "cut grass": "cỏ vừa cắt", "cold air": "không khí lạnh", "your skin but better": "làn da mình nhưng thơm hơn", garden: "khu vườn",
  "clean laundry": "quần áo mới giặt", bitter: "vị đắng", smoke: "khói", "old library": "thư viện cũ", "wet pavement": "vỉa hè sau mưa", sea: "biển",
};
const PLANET_VI: Record<string, string> = { sun: "Mặt Trời", moon: "Mặt Trăng", mercury: "Sao Thủy", venus: "Sao Kim", mars: "Sao Hỏa", jupiter: "Sao Mộc", saturn: "Sao Thổ", uranus: "Sao Thiên Vương", neptune: "Sao Hải Vương", pluto: "Sao Diêm Vương", rising: "Cung Mọc" };

const join = (xs: string[], lang: Lang) => xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} ${lang === "vi" ? "và" : "and"} ${xs[xs.length - 1]}`;
const signOf = (s: string): Sign => (s in SIGN.en ? s : "Aries") as Sign;

export interface FallbackInput {
  planet: string; sign: string; house: number | null; language: Lang; elements: ElementCounts;
  perfume: { name: string; notes: string[]; smell_words: string[] };
  ritual: string;
  sections?: { planet: string; sign: string }[];
  blocks?: { transiting: string; natal: string; kind?: string }[];
}

export function scentLine(lang: Lang, elements: ElementCounts, perfume: FallbackInput["perfume"]) {
  const b = chartBalance(elements);
  const el = b.least[0];
  const st = b.strongest[0];
  const lead = st && st !== el ? (lang === "vi" ? `${ELEMENT_NAME.vi[st]} đang gánh team, ` : `Your ${st} is doing the heavy lifting, `) : "";
  const first = !el
    ? lang === "vi" ? "Bản đồ sao cân bằng, chẳng thiếu nguyên tố nào, chai này chỉ hợp với thói quen trên thôi." : "Your chart is balanced, so no element is lacking; this one just suits the habit."
    : b.absent.includes(el)
      ? lang === "vi" ? `${lead}${lead ? "còn" : "Bản đồ sao"} không có chút ${ELEMENT_NAME.vi[el]} nào, nên ${NEED.vi[el]}.` : `${lead}${lead ? "but there's" : "Your chart has"} zero ${el}, so ${NEED.en[el]}.`
      : lang === "vi" ? `${lead}${lead ? "còn" : "Trong bản đồ sao,"} ${ELEMENT_NAME.vi[el]} ít nhất, nên ${NEED.vi[el]}.` : `${lead}${lead ? "but you've got the" : "Your chart has the"} least ${el}, so ${NEED.en[el]}.`;
  const smells = perfume.smell_words.slice(0, 2).map((w) => lang === "vi" ? SMELL_VI[w] ?? w : w);
  const notes = perfume.notes.slice(0, 2);
  const second = lang === "vi"
    ? `${perfume.name}${notes.length ? ` có ${join(notes, lang)}` : ""}${smells.length ? `, mùi như ${join(smells, lang)}` : ""}.`
    : `${perfume.name}${notes.length ? ` has ${join(notes, lang)}` : ""}${smells.length ? `${notes.length ? "," : ""} and smells like ${join(smells, lang)}` : ""}.`;
  const third = lang === "vi" ? "Xịt để nhắc mình thôi, chứ nó không sửa hộ được gì đâu." : "Wear it as a reminder, not a fix.";
  return `${first} ${second} ${third}`;
}

export function writeFallback(d: FallbackInput) {
  const lang = d.language;
  const [habit, jab, cost] = SIGN[lang][signOf(d.sign)];
  const area = AREA[lang][d.planet] ?? AREA[lang].sun;
  const house = d.house ? (lang === "vi" ? ` Rõ nhất là ở chuyện ${HOUSE.vi[d.house - 1]}.` : ` It shows up most around ${HOUSE.en[d.house - 1]}.`) : "";
  const sections = (d.sections ?? []).map((s, i) => `${AREA[lang][s.planet] ?? area} ${SIGN[lang][signOf(s.sign)][0]} ${ANGLE[lang][i % 5]}`);
  const name = (p: string) => lang === "vi" ? PLANET_VI[p] ?? p : p.charAt(0).toUpperCase() + p.slice(1);
  const blocks = (d.blocks ?? []).map((t) => {
    const a = name(t.transiting), b = name(t.natal);
    if (t.kind === "hard") return lang === "vi" ? `Hôm nay ${a} đè lên ${b}. Đừng gửi tin nhắn dài, gửi bản ngắn thôi.` : `${a} is pressing on your ${b} today. Don't send the long message, send the short one.`;
    if (t.kind === "easy") return lang === "vi" ? `Hôm nay ${a} chiều ${b} của mình. Tranh thủ làm cái việc cứ để mãi đi.` : `${a} is easy on your ${b} today. Use it for the thing you keep putting off.`;
    return lang === "vi" ? `Hôm nay ${a} ngồi ngay trên ${b}. Cảm xúc to thì hành động nhỏ thôi.` : `${a} is sitting right on your ${b} today. Big feelings, small actions.`;
  });
  const hard = (d.blocks ?? []).some((t) => t.kind === "hard");
  const summary = !d.blocks ? "" : hard
    ? lang === "vi" ? "Không thảm họa đâu, chỉ đừng gây chuyện mà không kết thúc nổi." : "Not a disaster, just don't start fights you can't finish."
    : d.blocks.length ? lang === "vi" ? "Ngày ổn, đừng chờ điềm báo nữa, làm luôn đi." : "Decent day, so stop waiting for a sign and do the thing."
    : lang === "vi" ? "Trời yên, hôm nay chẳng có cớ gì đâu." : "Quiet sky, so no excuses today.";
  return { truth: `${area} ${habit} ${jab}${house}`, cost, scent: scentLine(lang, d.elements, d.perfume), ritual: d.ritual, sections, blocks, summary };
}
