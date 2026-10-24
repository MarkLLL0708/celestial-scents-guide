import { chartBalance, variedRitual, ELEMENT_SMELLS, type ElementCounts, type Element } from "@/lib/reading/balance";
import { vi } from "@/i18n/vi";
import { readingRitualFor } from "@/lib/reading/rituals";
import { pickLip, lipLine, lipName, pairLine } from "@/lib/lips";

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
  dateScent: {
    en: "For a first date, wear something that sits close to your skin and that you'd still like three hours later. Two sprays, not a cloud; they should notice it when they lean in, not when you walk in.",
    vi: "Buổi hẹn đầu thì chọn mùi nằm sát da, ba tiếng sau mình vẫn thấy thích. Hai lần xịt thôi, đừng tỏa cả phòng; người ta nên nhận ra khi ngồi gần, không phải lúc mình vừa bước vào.",
    ritualId: "ask-a-question", enAction: "Spray once on the wrist and once behind the ear twenty minutes before leaving, then stop touching it.", viAction: "Xịt một lần lên cổ tay, một lần sau tai, hai mươi phút trước khi đi, rồi thôi đừng chỉnh nữa.",
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
  if (/\b(suicid\w*|self.harm|medical|medication|diagnos\w*|pregnan\w*|lawsuit|invest\w*|tu tu|tu hai|thuoc|benh|mang thai|kien tung|dau tu)\b/.test(q)) return "sensitive";
  if (/\bex\b|nguoi cu|nyc/.test(q)) return "ex";
  if (/picky|standard|tieu chuan|ken chon/.test(q)) return "standards";
  const scentWords = /scent|perfume|fragrance|wear|nuoc hoa|mui huong|xit|\bmui\b/;
  if (/\bdate\b|hen dau|buoi hen|hen ho/.test(q) && scentWords.test(q)) return "dateScent";
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


/** Ties the chart balance to the actual question, so the middle paragraph changes with what was asked. */
const LINK: Record<Intent, { en: string; vi: string }> = {
  ex: { en: "Your {strong} side is great at replaying the good bits. The {weak} side is the one that should be checking the receipts, and it's your quietest voice.", vi: "Phần {strong} giỏi tua lại đoạn đẹp. Phần {weak} mới là phần nên soi lại sự thật, mà nó lại nói nhỏ nhất." },
  standards: { en: "Your {strong} side is sitting on the judging panel. The {weak} side is what you'd need to let someone in before the verdict.", vi: "Phần {strong} đang ngồi ghế giám khảo. Phần {weak} mới là thứ cần để cho người ta lại gần trước khi phán." },
  date: { en: "Lean on your {strong} side; it's your best angle. The thin {weak} side is why you overthink everything before you even leave the house.", vi: "Cứ dựa vào phần {strong}, đó là góc đẹp nhất. Phần {weak} mỏng nên mới nghĩ mãi trước khi ra khỏi nhà." },
  dateScent: { en: "Your {strong} side will show up on its own. Let the scent carry a bit of the {weak} side you're short on, so you come across rounder, not louder.", vi: "Phần {strong} tự khắc lộ ra. Để mùi hương mang thêm chút {weak} mình đang thiếu, cho mình tròn trịa hơn chứ không ồn hơn." },
  conflict: { en: "Your {strong} side spots what's wrong in two seconds. The low {weak} side is why you skip checking your own part in it.", vi: "Phần {strong} thấy cái sai trong hai giây. Phần {weak} ít nên hay bỏ qua bước xem lại phần của mình." },
  finish: { en: "Your {strong} side loves the shiny start. The {weak} side is the boring middle, and your chart doesn't hand you much of it.", vi: "Phần {strong} mê đoạn mở đầu. Phần {weak} là khúc giữa chán ngắt, mà lá số lại cho mình ít phần đó." },
  rest: { en: "Your {strong} side keeps the engine running. The {weak} side is the off switch, and yours is hard to find.", vi: "Phần {strong} giữ máy luôn chạy. Phần {weak} là công tắc tắt, mà của mình thì khó tìm." },
  work: { en: "Your {strong} side is what people rely on you for. The low {weak} side is why you assume they'll notice without being told.", vi: "Phần {strong} là lý do người ta dựa vào mình. Phần {weak} ít nên mình cứ nghĩ người ta tự thấy mà không cần nói." },
  choice: { en: "Your {strong} side keeps producing options. The {weak} side is the part that commits, and it's underfed.", vi: "Phần {strong} cứ nghĩ thêm lựa chọn. Phần {weak} là phần chốt hạ, mà nó đang thiếu." },
  feelings: { en: "Your {strong} side handles the explaining. The {weak} side is the actual feeling, and you keep sending it to voicemail.", vi: "Phần {strong} lo phần giải thích. Phần {weak} mới là cảm xúc thật, mà mình cứ để nó vào hộp thư thoại." },
  scent: { en: "Wear the {strong} side you already have, and let the scent cover some of the {weak} side you don't.", vi: "Phần {strong} có sẵn thì cứ thể hiện, để mùi hương bù một chút phần {weak} còn thiếu." },
};
const hashOf = (text: string) => [...text].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 0);

/** Server-owned hand-written backup. Never infers missing facts or predicts outcomes. */
export function writeAskBackup(d: AskBackupInput, offset = 0) {
  const intent = questionIntent(d.question);
  const balance = chartBalance(d.elements);
  const lang = d.lang;
  const en = lang === "en";
  const key: Intent = intent === "unknown" || intent === "sensitive" ? "feelings" : intent;
  const copy = COPY[key];
  if (intent === "sensitive") {
    const answer = en ? "This needs qualified support, not a chart reading. I can't safely decide it for you; talk to someone trained for this situation." : "Chuyện này cần người có chuyên môn, không phải bản đồ sao. Không thể quyết hộ; hãy tìm người được đào tạo để hỗ trợ.";
    return { answer, ritualId: variedRitual(d.question, lang, offset).id };
  }
  const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
  const doThis = en ? copy.enAction : copy.viAction;
  const honest = intent === "unknown"
    ? en ? `About “${d.question.slice(0, 70).replace(/[.!?！]/g, "")}”: I don't have enough context to give a fair yes or no. Name the actual situation and what's at stake; a chart can't fill that gap.` : `Về “${d.question.slice(0, 55).replace(/[.!?！]/g, "")}”: chưa đủ ngữ cảnh để nói nên hay không. Kể rõ tình huống và điều đang phân vân; bản đồ sao không điền hộ được.`
    : `${copy[lang]} ${en ? "Do this:" : "Làm ngay:"} ${doThis}`;
  const name = (e: Element) => (en ? e : VI[e]);
  const names = (es: Element[]) => es.map(name).join(en ? " and " : " và ");
  const strong = balance.strongest;
  const weak = balance.least;
  const strength = strong[0];
  const weakness = weak[0];
  const counts = (es: Element[]) => es.map(e => d.elements[e]).join("/");
  const absent = weak.every(e => d.elements[e] === 0);
  const link = strength && weakness && intent !== "unknown" ? " " + LINK[key][lang].replace("{strong}", name(strength)).replace("{weak}", name(weakness)) : "";
  const chart = balance.balanced
    ? en ? "Your elements are equal here; there's no strongest or weakest one to blame. Use that range instead of inventing a missing piece." : "Các nguyên tố ở đây bằng nhau, không có bên mạnh nhất hay yếu nhất. Dùng sự cân bằng đó, đừng tự bịa một phần thiếu."
    : en
      ? `${cap(names(strong))} leads (${counts(strong)}): ${strength ? ELEMENT_COPY[strength].en[0] : "you have something to work with"}. ${cap(names(weak))} is ${absent ? "absent" : "lowest"} (${counts(weak)}): ${weakness ? ELEMENT_COPY[weakness].en[1] : "use the quieter side too"}.${link}`
      : `${names(strong)} mạnh nhất (${counts(strong)}): ${strength ? ELEMENT_COPY[strength].vi[0] : "có điểm mạnh để dùng"}. ${names(weak)} ${absent ? "vắng mặt" : "ít nhất"} (${counts(weak)}): ${weakness ? ELEMENT_COPY[weakness].vi[1] : "dùng cả phần ít nổi bật"}.${link}`;
  const weakTags = weak.flatMap(e => [...ELEMENT_SMELLS[e]]);
  const known = d.smell_words.filter(tag => SMELLS[tag]);
  const matched = known.find(tag => weakTags.includes(tag));
  const tags = matched ? [matched, ...known.filter(t => t !== matched)].slice(0, 2) : known.slice(0, 2);
  const detail = tags.map(t => SMELLS[t][lang]).join(en ? ", and " : ", còn ");
  const noteDictionary = vi as unknown as Record<string, string>;
  const notes = en ? d.notes : d.notes.split(", ").map(note => noteDictionary[note.toLowerCase()] ?? note).join(", ");
  const variant = hashOf(d.question) % 3;
  const why = matched
    ? en
      ? [`That's the ${names(weak)} you're short on, in a bottle: a reminder to practise it, not a fix.`, `It brings in the ${names(weak)} your chart barely has, so you're wearing the bit you keep skipping.`, `Basically ${names(weak)} on skin, which is exactly the side you keep leaving out.`][variant]
      : [`Đó là phần ${names(weak)} mình đang thiếu, đóng chai: để nhắc mình tập, không phải để sửa lá số.`, `Nó mang vào phần ${names(weak)} lá số gần như không có, tức là khoác lên đúng phần mình hay bỏ qua.`, `Nói gọn là ${names(weak)} trên da, đúng phần mình cứ để ra ngoài.`][variant]
    : en ? "It's a smell preference, not evidence it corrects your chart." : "Đây là sở thích về mùi, không phải cách bù nguyên tố.";
  const scent = d.perfume
    ? en
      ? `${[`Wear ${d.perfume}.`, `${d.perfume} is the one for this.`, `Reach for ${d.perfume}.`][variant]}${notes ? ` It opens with ${notes}.` : ""}${detail ? ` ${cap(detail)}.` : " There aren't enough supplied smell details to describe it honestly."} ${why}`
      : `${[`Dùng ${d.perfume}.`, `${d.perfume} hợp với chuyện này.`, `Lấy ${d.perfume} ra.`][variant]}${notes ? ` Mở đầu bằng ${notes}.` : ""}${detail ? ` ${cap(detail)}.` : " Chưa đủ mô tả mùi để nói rõ hơn cho đúng."} ${why}`
    : en ? "No catalogue scent was available, so I'm not inventing a bottle or its ingredients. Use a perfume you already enjoy." : "Chưa có mùi phù hợp từ danh mục, nên không bịa chai hay nguyên liệu. Cứ dùng mùi mình đã thích.";
  const lipPick = pickLip(d.elements, d.question);
  const lip = `${lipLine(lang, d.elements, lipPick)}${d.perfume ? ` ${pairLine(lang, d.elements, lipPick, d.perfume)}` : ""}`;
  // The ritual paragraph is exactly the ritual the button opens.
  const picked = variedRitual(`${key}:${d.question}`, lang, offset, weakness);
  const page = readingRitualFor(picked.id, lang);
  const ritualText = page ? page.steps[0] : picked.action;
  const ritual = en
    ? `Ritual, “${page?.title ?? picked.id}”: ${ritualText} Before you start, ${lipName(lipPick)} on, one light spray${d.perfume ? ` of ${d.perfume}` : ""} on the wrist, then do it. That's the cue; buying either isn't required.`
    : `Nghi thức “${page?.title ?? picked.id}”: ${ritualText} Trước khi làm thì tô ${lipName(lipPick)}, xịt nhẹ${d.perfume ? ` ${d.perfume}` : ""} lên cổ tay, rồi bắt đầu. Đó là dấu nhắc; không cần mua mới.`;
  return { answer: `${honest}\n\n${chart}\n\n${scent} ${lip}\n\n${ritual}`, ritualId: picked.id };
}
