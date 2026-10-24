import type { Ritual, RitualTheme } from "@/data/types";
import { RITUAL_ACTIONS, type Element } from "./balance";

type Lang = "en" | "vi";
// Titles describe the exact action shown in the reading, not an unrelated legacy ritual.
const titles: Record<string, [string, string]> = {
  "doorstep-yes": ["say yes before the excuses", "nhận lời trước khi kiếm cớ"],
  "two-minute-start": ["two minutes, just start", "hai phút, làm luôn đi"],
  "loud-sentence": ["say the actual opinion", "nói thẳng ý kiến đi"],
  "walk-fast": ["walk, skip the commentary", "đi bộ, khỏi nghe bình luận"],
  "send-first": ["send the first message", "nhắn trước đi"],
  "coin-and-note": ["make the invitation", "chủ động rủ đi"],
  "clean-desk-scent": ["finish before checking messages", "làm xong rồi hãy mở tin nhắn"],
  "no-reapply": ["the boring task first", "việc chán làm trước"],
  "one-drawer": ["one drawer, not your whole life", "một ngăn kéo thôi, không phải cả đời"],
  "budget-line": ["look at the actual spending", "nhìn thẳng khoản đã tiêu"],
  "cook-something": ["finish one simple meal", "nấu xong một món đơn giản"],
  "bed-on-time": ["bed, not another scroll", "đi ngủ, đừng lướt nữa"],
  "three-breath-doorway": ["name today's actual plan", "nói rõ hôm nay làm gì"],
  "ask-a-question": ["ask, then actually listen", "hỏi rồi nghe cho hết"],
  "window-open": ["write down what's bothering you", "viết ra chuyện đang khó chịu"],
  "new-route": ["take a different way home", "đổi đường về nhà"],
  "call-not-text": ["make the call", "gọi đi, đừng chỉ nhắn"],
  "read-ten-pages": ["ten pages without a screen", "mười trang, không màn hình"],
  "first-date-pulse": ["say what you actually want", "nói điều mình thật sự muốn"],
  "mirror-inventory": ["stop making their excuses", "thôi bào chữa hộ người ta"],
  "slow-evening": ["put the phone elsewhere", "để điện thoại chỗ khác"],
  "warm-shower": ["name the feeling, skip the essay", "gọi tên cảm xúc, khỏi viết luận"],
  "thank-you-text": ["a thank-you without the joke", "cảm ơn, khỏi chêm câu đùa"],
  "scarf-hug": ["let the hug last", "để cái ôm lâu hơn chút"],
};
const elementDetails: Record<Element, { theme: RitualTheme; notes: string; intention: [string, string] }> = {
  fire: { theme: "self", notes: "orange, ginger, pepper", intention: ["Make one move before you turn it into another debate.", "Làm một việc đi, trước khi lại tự tranh luận cả buổi."] },
  earth: { theme: "work", notes: "cedar, vetiver, sandalwood", intention: ["Finish something small. Planning it again doesn't count.", "Làm xong một việc nhỏ. Lên kế hoạch lại không tính."] },
  air: { theme: "calm", notes: "bergamot, tea, green", intention: ["Try a different response instead of replaying the same one.", "Thử cách khác đi, đừng phát lại đúng một kiểu mãi."] },
  water: { theme: "love", notes: "rose, musk, vanilla", intention: ["Admit the feeling without immediately arguing with it.", "Nhận là mình có cảm xúc đó đi, đừng vội cãi lại nó."] },
};

export const readingRitualIds = RITUAL_ACTIONS.map((action) => action.id);

/** Shared by links, matching and Cloud validation; every emitted action has a real page. */
export function readingRitualFor(id: string, lang: Lang): Ritual | null {
  const action = RITUAL_ACTIONS.find((item) => item.id === id);
  const title = titles[id];
  if (!action || !title) return null;
  const details = elementDetails[action.element];
  const index = lang === "en" ? 0 : 1;
  return {
    id,
    title: title[index],
    theme: id === "slow-evening" || id === "warm-shower" || id === "bed-on-time" ? "evening" : id === "coin-and-note" ? "luck" : id === "mirror-inventory" ? "self" : details.theme,
    intention: details.intention[index],
    timing: lang === "en" ? "when you're ready to do the action" : "khi sẵn sàng làm việc này",
    durationMin: id === "walk-fast" ? 10 : id === "two-minute-start" ? 2 : 5,
    needs: [lang === "en" ? "any perfume you already own; scent is optional" : "nước hoa đang có; không dùng mùi hương cũng được"],
    steps: [
      action[lang],
      lang === "en" ? "Afterward, name what you actually did. No need to turn it into a whole new routine." : "Xong thì nói rõ mình vừa làm được gì. Không cần biến nó thành cả một lịch sinh hoạt mới.",
    ],
    why: lang === "en" ? "The scent is a reminder to follow through, not a fix for your chart. The useful bit is what you do." : "Mùi hương nhắc mình làm tới cùng, không sửa lá số. Phần có ích là việc mình làm.",
    noteFamily: details.notes,
    reason: lang === "en" ? "Choose a scent you like wearing. This action doesn't require a new bottle." : "Chọn mùi mình thích dùng. Việc này không cần mua chai mới.",
  };
}