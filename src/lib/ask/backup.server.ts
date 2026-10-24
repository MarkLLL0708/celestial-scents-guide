import { chartBalance, variedRitual, ELEMENT_SMELLS, type ElementCounts, type Element } from "@/lib/reading/balance";
import { vi } from "@/i18n/vi";

type Lang = "en" | "vi";
export interface AskBackupInput {
  question: string; theme: "self" | "love" | "work" | "luck"; lang: Lang;
  elements: ElementCounts; perfume: string | null; notes: string; smell_words: string[];
  sun: string; moon: string; rising: string | null;
}
const COPY = {
  ex: {
    en: "Don't text just because tonight is quiet. If nothing has changed, you're reopening the same conversation and expecting a different person.",
    vi: "Đừng nhắn chỉ vì tối nay thấy trống trải. Chưa có gì thay đổi mà đã quay lại thì vẫn cuộc nói chuyện cũ thôi.",
    ritualId: "window-open", enAction: "Leave the message unsent. Write what you need from them, then check whether they've ever actually offered it.", viAction: "Khoan gửi tin nhắn. Viết điều mình cần ở người ta, rồi xem trước giờ người ta đã từng cho được chưa.",
  },
  standards: {
    en: "Keep the standards that protect your values. Drop the little tests nobody knows they're taking; dating isn't unpaid probation.",
    vi: "Giữ tiêu chuẩn liên quan đến điều mình coi trọng. Bỏ mấy bài kiểm tra ngầm đi; hẹn hò chứ có tuyển nhân viên đâu.",
    ritualId: "first-date-pulse", enAction: "Write one non-negotiable and one preference you can bend on. On the next date, ask a real question instead of scoring answers.", viAction: "Ghi một điều không thể nhượng bộ và một sở thích có thể linh động. Buổi hẹn tới hỏi thật, đừng ngồi chấm điểm.",
  },
  date: {
    en: "Wear something you actually like, not a costume for their approval. You're meeting a person, not auditioning to become their favourite.",
    vi: "Chọn thứ mình thật sự thích, đừng hóa trang theo gu người ta. Đi gặp một người thôi, có phải thi để được chọn đâu.",
    ritualId: "ask-a-question", enAction: "Before leaving, name one thing you're curious about. Ask it, and let the answer finish before planning your next line.", viAction: "Trước khi đi, nghĩ một điều thật sự muốn biết. Hỏi rồi nghe hết câu trả lời, đừng mải soạn câu tiếp theo.",
  },
  conflict: {
    en: "Being annoyed doesn't automatically make everyone else the problem. Name the specific behaviour before giving the whole room a bad review.",
    vi: "Mình khó chịu không có nghĩa là cả phòng đều có lỗi. Chỉ rõ hành động nào làm mình bực, đừng đánh trượt cả hội.",
    ritualId: "mirror-inventory", enAction: "Write the exact thing that annoyed you, without 'always' or 'everyone'. Make one clear request, not a speech.", viAction: "Viết đúng việc làm mình bực, bỏ chữ 'lúc nào cũng' và 'ai cũng'. Nói một yêu cầu rõ ràng, khỏi diễn văn.",
  },
  finish: {
    en: "The new idea is fun because it hasn't asked you to do the boring bit yet. Shrink the job and finish that version first.",
    vi: "Ý tưởng mới vui vì chưa bắt mình làm đoạn chán thôi. Thu nhỏ việc lại rồi làm xong bản đó đã.",
    ritualId: "clean-desk-scent", enAction: "Close the extra tabs. Set ten minutes and finish one small piece before looking for another idea.", viAction: "Đóng các tab thừa. Hẹn mười phút rồi làm xong một phần nhỏ trước khi đi kiếm ý tưởng khác.",
  },
  rest: {
    en: "Rest doesn't need a productivity excuse. If you turn Saturday into another performance review, don't act surprised when Monday feels identical.",
    vi: "Nghỉ đâu cần lý do năng suất. Biến thứ Bảy thành buổi tự kiểm điểm nữa thì thứ Hai mệt y hệt cũng phải thôi.",
    ritualId: "slow-evening", enAction: "Put your phone in another room for fifteen minutes. Drink something slowly and leave one harmless chore unfinished.", viAction: "Để điện thoại phòng khác mười lăm phút. Uống chậm một cốc nước, để nguyên một việc vặt không gấp.",
  },
  work: {
    en: "Ask for what you need at work instead of hoping someone notices the extra effort. Silent resentment isn't a negotiation strategy.",
    vi: "Cần gì ở chỗ làm thì nói rõ, đừng chờ người ta tự thấy mình cố gắng. Bực âm thầm đâu phải cách thương lượng.",
    ritualId: "loud-sentence", enAction: "Write one request with a concrete deadline. Say it without adding three apologies or volunteering for more work.", viAction: "Viết một yêu cầu có hạn cụ thể. Nói ra, đừng kèm ba câu xin lỗi rồi nhận thêm việc.",
  },
  choice: {
    en: "More opinions won't choose for you. Compare the actual options, pick the reversible step, and stop calling another delay research.",
    vi: "Hỏi thêm cũng chẳng ai chọn hộ được. So các lựa chọn thật, chọn bước có thể đổi lại, đừng gọi trì hoãn là tìm hiểu.",
    ritualId: "two-minute-start", enAction: "Write two options and one cost for each. Take the smallest reversible step today, then review what actually happened.", viAction: "Ghi hai lựa chọn và một cái giá cho mỗi lựa chọn. Hôm nay làm bước nhỏ có thể đổi lại, rồi xem kết quả thật.",
  },
  feelings: {
    en: "Thinking about a feeling isn't the same as admitting it. Say what you want plainly; the impressive explanation can wait.",
    vi: "Phân tích cảm xúc chưa phải thừa nhận nó. Nói thẳng mình muốn gì trước đã, bài giải thích thông minh để sau.",
    ritualId: "warm-shower", enAction: "Name one feeling and one need out loud. Don't defend either, and don't turn them into a joke.", viAction: "Nói thành tiếng một cảm xúc và một điều mình cần. Khỏi bào chữa, cũng đừng chốt bằng câu đùa.",
  },
  scent: {
    en: "Pick a smell you enjoy wearing, not one you hope will do your personality's homework. The chart gives a direction, not a dress code.",
    vi: "Chọn mùi mình thích dùng, đừng giao bài tập tính cách cho chai nước hoa. Bản đồ sao gợi một hướng, không ra đồng phục.",
    ritualId: "new-route", enAction: "Try a little on skin if you already own it. Wait ten minutes, then decide whether you like it without checking anyone else's reaction.", viAction: "Nếu đã có chai đó thì thử ít trên da. Chờ mười phút, tự xem có thích không trước khi hỏi người khác.",
  },
} as const;
type Intent = keyof typeof COPY;
export function questionIntent(question: string): Intent | "unknown" | "sensitive" {
  const q = question.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d");
  if (/\b(suicid\w*|self.harm|medical|medication|diagnos\w*|pregnan\w*|lawsuit|invest\w*)\b|tu tu|tu hai|thuoc|benh|mang thai|kien tung|dau tu/.test(q)) return "sensitive";
  if (/\bex\b|nguoi cu|nyc/.test(q)) return "ex";
  if (/picky|standard|tieu chuan|ken chon/.test(q)) return "standards";
  if (/first date|hen dau|buoi hen/.test(q)) return "date";
  if (/annoy|irritat|grudge|ghet|kho chiu|buc|tuc/.test(q)) return "conflict";
  if (/finish|starting|procrastinat|hoan thanh|bat dau|tri hoan|bo do/.test(q)) return "finish";
  if (/relax|rest|weekend|nghi ngoi|thu gian|cuoi tuan/.test(q)) return "rest";
  if (/scent|perfume|wear|nuoc hoa|mui huong/.test(q)) return "scent";
  if (/work|boss|career|job|cong viec|sep|su nghiep|cho lam/.test(q)) return "work";
  if (/choose|decision|should|chon|quyet dinh|co nen/.test(q)) return "choice";
  if (/feel|love|dating|emotion|cam xuc|yeu|hen ho/.test(q)) return "feelings";
  return "unknown";
}
const ELEMENT_COPY: Record<Element, { en: [string, string]; vi: [string, string] }> = {
  fire: { en: ["you can get things moving", "starting before you feel ready needs practice"], vi: ["biết cách khởi động mọi việc", "cần tập bắt đầu cả khi chưa thấy sẵn sàng"] },
  earth: { en: ["you notice what needs doing and can stick with it", "following through needs practice"], vi: ["nhìn ra việc cần làm và biết bám đến cùng", "cần tập làm đến nơi đến chốn"] },
  air: { en: ["you can see more than one side", "stepping back before reacting needs practice"], vi: ["nhìn được nhiều phía của một chuyện", "cần tập lùi lại nghĩ trước khi phản ứng"] },
  water: { en: ["you notice how people feel", "saying what you feel without hiding it needs practice"], vi: ["để ý được cảm xúc người khác", "cần tập nói cảm xúc thật thay vì giấu đi"] },
};
const VI = { fire: "Lửa", earth: "Đất", air: "Khí", water: "Nước" };
const SMELLS: Record<string, { en: string; vi: string }> = {
  "spicy kitchen": { en: "spice gives it a lively edge", vi: "gia vị cho mùi một nét rõ, có lực" },
  "orange peel": { en: "orange peel adds a bright, sharp edge", vi: "vỏ cam cho mùi nét tươi, hơi sắc" },
  "old library": { en: "the old-library smell gives it a settled, familiar feel", vi: "mùi thư viện cũ gợi cảm giác quen, vững" },
  bitter: { en: "the bitter edge keeps it from feeling too sweet", vi: "nét đắng giữ mùi khỏi ngọt quá" },
  "warm bread": { en: "the warm-bread smell gives it an everyday warmth", vi: "mùi bánh mì ấm gợi sự gần gũi hằng ngày" },
  "cold air": { en: "the cold-air smell feels crisp rather than heavy", vi: "mùi không khí lạnh cho cảm giác thoáng, không nặng" },
  "cut grass": { en: "cut grass gives it a fresh, green edge", vi: "cỏ vừa cắt cho mùi nét xanh, tươi" },
  "clean laundry": { en: "clean laundry gives it a simple, fresh feel", vi: "mùi quần áo mới giặt gợi sự sạch, nhẹ" },
  "wet pavement": { en: "wet pavement gives it a cool, rain-like feel", vi: "mùi vỉa hè sau mưa gợi nét mát, thoáng" },
  "warm blanket": { en: "the warm-blanket smell feels soft and familiar", vi: "mùi chăn ấm gợi sự mềm, quen thuộc" },
  sea: { en: "the sea smell gives it a breezy, open feel", vi: "mùi biển gợi cảm giác thoáng, rộng" },
  "your skin but better": { en: "the skin-like smell stays intimate rather than showy", vi: "mùi gần với da gợi sự gần gũi, không phô trương" },
  garden: { en: "the garden smell gives it a gentle, green feel", vi: "mùi khu vườn gợi nét xanh, dịu" },
};

/** Server-owned hand-written backup. Never infers missing facts or predicts outcomes. */
export function writeAskBackup(d: AskBackupInput, offset = 0) {
  const intent = questionIntent(d.question);
  const balance = chartBalance(d.elements);
  const lang = d.lang;
  const copy = intent === "unknown" || intent === "sensitive" ? COPY.feelings : COPY[intent];
  const honest = intent === "sensitive"
    ? lang === "en" ? "This needs qualified support, not a chart reading. I can't safely decide it for you; talk to someone trained for this situation." : "Chuyện này cần người có chuyên môn, không phải bản đồ sao. Không thể quyết hộ; hãy tìm người được đào tạo để hỗ trợ."
    : intent === "unknown"
      ? lang === "en" ? `About “${d.question.slice(0, 70).replace(/[.!?！]/g, "")}”: I don't have enough context to give a fair yes or no. Name the actual situation and what's at stake; a chart can't fill that gap.` : `Về “${d.question.slice(0, 55).replace(/[.!?！]/g, "")}”: chưa đủ ngữ cảnh để nói nên hay không. Kể rõ tình huống và điều đang phân vân; bản đồ sao không điền hộ được.`
      : copy[lang];
  const names = (es: Element[]) => es.map(e => lang === "vi" ? VI[e] : e).join(lang === "vi" ? " và " : " and ");
  const strong = balance.strongest;
  const weak = balance.least;
  const strength = strong[0];
  const weakness = weak[0];
  const chart = balance.balanced
    ? lang === "en" ? "Your elements are equal here; there's no strongest or weakest one to blame. Use that range instead of inventing a missing piece." : "Các nguyên tố ở đây bằng nhau, không có bên mạnh nhất hay yếu nhất. Dùng sự cân bằng đó, đừng tự bịa một phần thiếu."
    : lang === "en"
      ? `${names(strong)} leads (${strong.map(e => d.elements[e]).join("/")}); ${strength ? ELEMENT_COPY[strength].en[0] : "you have something to work with"}. ${names(weak)} is ${weak.every(e => d.elements[e] === 0) ? "absent" : "lowest"} (${weak.map(e => d.elements[e]).join("/")}); ${weakness ? ELEMENT_COPY[weakness].en[1] : "use the quieter side too"}.`
      : `${names(strong)} mạnh nhất (${strong.map(e => d.elements[e]).join("/")}); ${strength ? ELEMENT_COPY[strength].vi[0] : "có điểm mạnh để dùng"}. ${names(weak)} ${weak.every(e => d.elements[e] === 0) ? "vắng mặt" : "ít nhất"} (${weak.map(e => d.elements[e]).join("/")}); ${weakness ? ELEMENT_COPY[weakness].vi[1] : "dùng cả phần ít nổi bật"}.`;
  const weakTags = weak.flatMap(e => [...ELEMENT_SMELLS[e]]);
  const matched = d.smell_words.find(tag => weakTags.includes(tag) && SMELLS[tag]);
  const tag = matched ?? d.smell_words.find(tag => SMELLS[tag]);
  const detail = tag ? SMELLS[tag][lang] : null;
  const noteDictionary = vi as unknown as Record<string, string>;
  const notes = lang === "vi" ? d.notes.split(", ").map(note => noteDictionary[note.toLowerCase()] ?? note).join(", ") : d.notes;
  const scent = d.perfume
    ? lang === "en"
      ? `${d.perfume}${d.notes ? ` lists ${d.notes}` : " is the selected scent"}.${detail ? ` ${detail.charAt(0).toUpperCase() + detail.slice(1)}.` : " There aren't enough supplied smell details to explain its texture honestly."} ${matched ? `That suits practising the quieter ${names(weak)} side, as a reminder, not a fix.` : "This is a sensory preference, not evidence it corrects your chart."}`
      : `${d.perfume}${notes ? ` có các nốt ${notes}` : " là mùi được chọn"}.${detail ? ` ${detail.charAt(0).toUpperCase() + detail.slice(1)}.` : " Chưa đủ mô tả mùi để nói rõ hơn cho đúng."} ${matched ? `Dùng làm lời nhắc tập phần ${names(weak)} ít nổi bật, không phải để sửa bản đồ sao.` : "Đây là sở thích về mùi, không phải cách bù nguyên tố."}`
    : lang === "en" ? "No catalogue scent was available, so I'm not inventing a bottle or its ingredients. Use a perfume you already enjoy." : "Chưa có mùi phù hợp từ danh mục, nên không bịa chai hay nguyên liệu. Cứ dùng mùi mình đã thích.";
  const extra = variedRitual(d.question, lang, offset, weakness);
  const action = offset === 0 ? (lang === "en" ? copy.enAction : copy.viAction) : extra.action.replace(/you"ve/g, "you've").replace(/you"re/g, "you're").replace(/don"t/g, "don't").replace(/what"s/g, "what's").replace(/you"d/g, "you'd");
  const ritual = lang === "en" ? `If you own a scent, use a little as your cue; buying one isn't required. ${action}` : `Có nước hoa thì dùng ít làm dấu nhắc, không cần mua chai mới. ${action}`;
  return { answer: intent === "sensitive" ? honest : `${honest}\n\n${chart}\n\n${scent}\n\n${ritual}`, ritualId: offset === 0 ? copy.ritualId : extra.id };
}