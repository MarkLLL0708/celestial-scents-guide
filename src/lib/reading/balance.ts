import type { Chart, Perfume } from "@/data/types";

export const ELEMENTS = ["fire", "earth", "air", "water"] as const;
export type Element = (typeof ELEMENTS)[number];
export type ElementCounts = Chart["elements"];
export const ELEMENT_SMELLS: Record<Element, readonly string[]> = {
  fire: ["spicy kitchen", "orange peel"],
  earth: ["old library", "bitter", "warm bread"],
  air: ["cold air", "cut grass", "clean laundry", "wet pavement"],
  water: ["warm blanket", "sea", "your skin but better", "garden"],
};
export function chartBalance(elements: ElementCounts) {
  const min = Math.min(...ELEMENTS.map((e) => elements[e]));
  const max = Math.max(...ELEMENTS.map((e) => elements[e]));
  const least = ELEMENTS.filter((e) => elements[e] === min);
  const strongest = max === min ? [] : ELEMENTS.filter((e) => elements[e] === max);
  return { elements, least: max === min ? [] : least, strongest, absent: ELEMENTS.filter((e) => elements[e] === 0), balanced: max === min };
}
export function balanceMatches(perfume: Pick<Perfume, "smell_words">, elements: ElementCounts): string[] {
  const balance = chartBalance(elements);
  const tags = new Set(balance.least.flatMap((e) => [...ELEMENT_SMELLS[e]]));
  return (perfume.smell_words ?? []).filter((tag) => tags.has(tag));
}
/** Rank by actual tags; ties are stable and never use prices or unconfirmed strength. */
export function rankForBalance<T extends Pick<Perfume, "id" | "smell_words">>(perfumes: T[], elements: ElementCounts): T[] {
  return [...perfumes].sort((a, b) => balanceMatches(b, elements).length - balanceMatches(a, elements).length || a.id.localeCompare(b.id));
}
export const RITUAL_ACTIONS = [
  { id: "doorstep-yes", element: "fire", en: "Apply lightly to one wrist and say yes to the first small invitation today before you can talk yourself out of it.", vi: "Xịt nhẹ lên một cổ tay rồi nhận lời rủ nhỏ đầu tiên hôm nay, trước khi kịp tự can mình." },
  { id: "two-minute-start", element: "fire", en: "Apply lightly behind one ear, set a two-minute timer, and start the task you"ve been circling.", vi: "Chấm nhẹ sau một bên tai, hẹn giờ hai phút rồi bắt tay luôn vào việc cứ lượn quanh mãi." },
  { id: "loud-sentence", element: "fire", en: "Apply lightly to your collarbone and say one opinion out loud in a meeting, no softening words.", vi: "Xịt nhẹ lên xương quai xanh rồi nói thẳng một ý kiến trong cuộc họp, khỏi rào đón." },
  { id: "walk-fast", element: "fire", en: "Apply lightly to one wrist and walk ten fast minutes outside with no podcast.", vi: "Xịt nhẹ lên một cổ tay rồi ra ngoài đi bộ nhanh mười phút, không nghe gì cả." },
  { id: "send-first", element: "fire", en: "Apply lightly to one wrist and send the first message instead of waiting to be texted.", vi: "Xịt nhẹ lên một cổ tay rồi nhắn trước đi, đừng ngồi chờ người ta nhắn." },
  { id: "coin-and-note", element: "fire", en: "Apply lightly to one wrist and write one invitation you can make instead of waiting to be asked.", vi: "Xịt nhẹ lên một cổ tay rồi viết một lời rủ mình có thể chủ động gửi, đừng ngồi chờ được hỏi." },
  { id: "clean-desk-scent", element: "earth", en: "Apply lightly to one wrist, close your messages, and finish one small task before reopening them.", vi: "Xịt nhẹ lên một cổ tay, đóng tin nhắn rồi làm xong một việc nhỏ mới mở lại." },
  { id: "no-reapply", element: "earth", en: "Apply once to your inner elbow and don"t reapply until the most boring task on your list is done.", vi: "Xịt một lần lên khuỷu tay trong, chưa xong việc chán nhất trong danh sách thì chưa xịt lại." },
  { id: "one-drawer", element: "earth", en: "Apply lightly to one wrist and clear exactly one drawer, nothing else.", vi: "Xịt nhẹ lên một cổ tay rồi dọn đúng một ngăn kéo thôi, không hơn." },
  { id: "budget-line", element: "earth", en: "Apply lightly to one wrist and write down what you actually spent this week.", vi: "Xịt nhẹ lên một cổ tay rồi ghi ra tuần này thật sự đã tiêu bao nhiêu." },
  { id: "cook-something", element: "earth", en: "Apply lightly to your collarbone and cook one simple thing from start to finish.", vi: "Xịt nhẹ lên xương quai xanh rồi nấu trọn một món đơn giản từ đầu tới cuối." },
  { id: "bed-on-time", element: "earth", en: "Apply lightly to one wrist at ten and be in bed by eleven, phone charging across the room.", vi: "Xịt nhẹ lên cổ tay lúc mười giờ, mười một giờ lên giường, sạc điện thoại ở góc phòng." },
  { id: "three-breath-doorway", element: "air", en: "Apply lightly to one wrist, stand by the door, and say one thing you"re actually doing today.", vi: "Xịt nhẹ lên một cổ tay, đứng cạnh cửa rồi nói rõ hôm nay sẽ làm việc gì." },
  { id: "ask-a-question", element: "air", en: "Apply lightly behind one ear and ask someone one real question, then let them finish answering.", vi: "Chấm nhẹ sau một bên tai, hỏi ai đó một câu thật lòng rồi để người ta trả lời cho hết." },
  { id: "window-open", element: "air", en: "Apply lightly to one wrist, open a window, and write three lines about what"s bugging you.", vi: "Xịt nhẹ lên một cổ tay, mở cửa sổ rồi viết ba dòng về chuyện đang làm mình khó chịu." },
  { id: "new-route", element: "air", en: "Apply lightly to one wrist and take a different route home today.", vi: "Xịt nhẹ lên một cổ tay rồi hôm nay đi đường khác về nhà." },
  { id: "call-not-text", element: "air", en: "Apply lightly to your collarbone and call one person you"d normally just text.", vi: "Xịt nhẹ lên xương quai xanh rồi gọi cho một người bình thường chỉ nhắn tin." },
  { id: "read-ten-pages", element: "air", en: "Apply lightly to one wrist and read ten pages of a real book, not a screen.", vi: "Xịt nhẹ lên một cổ tay rồi đọc mười trang sách giấy, không phải màn hình." },
  { id: "first-date-pulse", element: "water", en: "Apply lightly to one wrist and write one honest sentence without apologizing for having a preference.", vi: "Xịt nhẹ lên một cổ tay rồi viết một câu thật lòng, đừng xin lỗi chỉ vì mình có ý muốn riêng." },
  { id: "mirror-inventory", element: "water", en: "Apply lightly to one wrist and say what annoyed you today without adding an excuse for anyone.", vi: "Xịt nhẹ lên một cổ tay rồi nói chuyện hôm nay làm mình bực, không cần bào chữa hộ ai." },
  { id: "slow-evening", element: "water", en: "Apply lightly to one wrist, leave your phone in another room, and sit with a glass of water.", vi: "Xịt nhẹ lên một cổ tay, để điện thoại ở phòng khác rồi ngồi uống một cốc nước." },
  { id: "warm-shower", element: "water", en: "Take a warm shower, then apply lightly to your inner elbow and name one feeling without explaining it.", vi: "Tắm nước ấm xong thì xịt nhẹ lên khuỷu tay trong, gọi tên một cảm xúc mà khỏi giải thích." },
  { id: "thank-you-text", element: "water", en: "Apply lightly to one wrist and send someone a thank-you that has no joke at the end.", vi: "Xịt nhẹ lên một cổ tay rồi gửi ai đó lời cảm ơn, cuối câu khỏi chêm câu đùa." },
  { id: "scarf-hug", element: "water", en: "Apply lightly to a scarf or sleeve and let someone hug you a few seconds longer than usual.", vi: "Xịt nhẹ lên khăn hoặc tay áo rồi để ai đó ôm mình lâu hơn thường lệ vài giây." },
] as const;
/** Picks a varied ritual; when an element is given, it practises that weak element. */
export function variedRitual(context: string, lang: "en" | "vi", offset = 0, element?: Element) {
  const hash = [...context].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 0);
  const pool = element ? RITUAL_ACTIONS.filter((r) => r.element === element) : RITUAL_ACTIONS;
  const action = pool[(hash + offset) % pool.length];
  return { id: action.id, action: action[lang] };
}
