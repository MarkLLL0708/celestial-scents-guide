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
  return { elements, least: max === min ? [] : least, absent: ELEMENTS.filter((e) => elements[e] === 0), balanced: max === min };
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
  { id: "clean-desk-scent", en: "Apply lightly to one wrist, close your messages, and finish one small task before reopening them.", vi: "Xịt nhẹ lên một cổ tay, đóng tin nhắn rồi làm xong một việc nhỏ mới mở lại." },
  { id: "first-date-pulse", en: "Apply lightly to one wrist and write one honest sentence without apologizing for having a preference.", vi: "Xịt nhẹ lên một cổ tay rồi viết một câu thật lòng, đừng xin lỗi chỉ vì mình có ý muốn riêng." },
  { id: "three-breath-doorway", en: "Apply lightly to one wrist, stand by the door, and say one thing you're actually doing today.", vi: "Xịt nhẹ lên một cổ tay, đứng cạnh cửa rồi nói rõ hôm nay sẽ làm việc gì." },
  { id: "mirror-inventory", en: "Apply lightly to one wrist and say what annoyed you today without adding an excuse for anyone.", vi: "Xịt nhẹ lên một cổ tay rồi nói chuyện hôm nay làm mình bực, không cần bào chữa hộ ai." },
  { id: "slow-evening", en: "Apply lightly to one wrist, leave your phone in another room, and sit with a glass of water.", vi: "Xịt nhẹ lên một cổ tay, để điện thoại ở phòng khác rồi ngồi uống một cốc nước." },
  { id: "coin-and-note", en: "Apply lightly to one wrist and write one invitation you can make instead of waiting to be asked.", vi: "Xịt nhẹ lên một cổ tay rồi viết một lời rủ mình có thể chủ động gửi, đừng ngồi chờ được hỏi." },
] as const;
export function variedRitual(context: string, lang: "en" | "vi", offset = 0) {
  const hash = [...context].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 0);
  const action = RITUAL_ACTIONS[(hash + offset) % RITUAL_ACTIONS.length];
  return { id: action.id, action: action[lang] };
}