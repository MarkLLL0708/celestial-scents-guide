// PLACEHOLDER TEXT BANK — to be replaced by AI-written text later.
// Lines are chosen by theme (and a chart/date seed) so two different charts do not read the same.
import type { AspectTheme } from "./aspects";

type Lang = "en" | "vi";
export type BlockSlot = "working" | "pushing" | "protect";

export const textBank: Record<Lang, Record<BlockSlot, Record<AspectTheme, string[]>>> = {
  en: {
    working: {
      self: [
        "you are easier to be around today, including for yourself. start the thing you keep describing.",
        "your own pace fits the day. finish one task before anyone asks how it is going.",
        "you know what you want this morning. write it down before the afternoon edits it.",
      ],
      love: [
        "warmth reads clearly today. one plain sentence does more than a clever one.",
        "people are softer with you than usual. let one of them be kind without arguing.",
        "a small gesture lands today. send the photo, keep the message short.",
      ],
      work: [
        "your head is clear for the boring part. clear the oldest item on the list.",
        "a good day to put a date on something. vague plans get done when they have one.",
        "you explain well today. use it on the email you have been avoiding.",
      ],
      luck: [
        "say yes to the slightly unfamiliar room. leave after an hour if you like.",
        "a door opens through someone you helped before. reply to them today.",
        "the easy option is also the right one today. take it without apologising.",
      ],
    },
    pushing: {
      self: [
        "you will want to explain small choices. make the choice, skip the paragraph.",
        "your mood shifts before lunch. eat first, decide after.",
        "you are tired of being the reasonable one. take an hour where nobody gets your opinion.",
      ],
      love: [
        "a small irritation wants to become a speech. say it in one line, or let it go.",
        "expectations are louder than the person today. listen to the person.",
        "you may read distance into a slow reply. it is usually just a slow reply.",
      ],
      work: [
        "patience runs short after lunch. write the reply, then wait an hour before sending.",
        "someone pushes on a deadline. agree to the date, not the tone.",
        "too many tabs, too many promises. close three before opening one.",
      ],
      luck: [
        "a good offer arrives with a catch in small print. read it twice.",
        "the urge to overcommit is strong today. say maybe, then sleep on it.",
        "more is not better today. pick the smaller version of the plan.",
      ],
    },
    protect: {
      self: [
        "your energy. say no to one thing before noon.",
        "your evening. keep one hour that nobody can book.",
        "your sleep. stop the screen earlier than you think you need to.",
      ],
      love: [
        "your softness. not everyone has earned the long version today.",
        "the quiet between you and one person. do not fill it with plans.",
        "your patience with someone close. leave the old argument where it is.",
      ],
      work: [
        "your focus. one task, one window, until it is done.",
        "your time. a meeting that could be a message should be a message.",
        "your standards. finish properly rather than finish first.",
      ],
      luck: [
        "your money. wait a day before the purchase that feels urgent.",
        "your good mood. do not spend it on people who are not listening.",
        "your yes. keep it for the thing you would do anyway.",
      ],
    },
  },
  vi: {
    working: {
      self: [
        "hôm nay bạn dễ gần hơn, kể cả với chính mình. hãy bắt đầu việc bạn cứ mãi kể.",
        "nhịp của bạn hợp với ngày hôm nay. làm xong một việc trước khi ai hỏi.",
        "sáng nay bạn biết mình muốn gì. viết ra trước khi buổi chiều sửa nó.",
      ],
      love: [
        "sự ấm áp dễ đọc hôm nay. một câu đơn giản hơn một câu khéo.",
        "mọi người dịu dàng với bạn hơn thường lệ. để họ tử tế mà không cãi lại.",
        "một cử chỉ nhỏ có tác dụng hôm nay. gửi tấm ảnh, tin nhắn ngắn thôi.",
      ],
      work: [
        "đầu óc bạn rõ ràng cho phần nhàm chán. xử lý việc cũ nhất trong danh sách.",
        "ngày tốt để đặt hạn cho một việc. kế hoạch mơ hồ sẽ xong khi có ngày cụ thể.",
        "hôm nay bạn giải thích tốt. dùng nó cho email bạn vẫn né.",
      ],
      luck: [
        "đồng ý bước vào căn phòng hơi lạ. về sau một tiếng cũng được.",
        "một cánh cửa mở qua người bạn từng giúp. trả lời họ hôm nay.",
        "lựa chọn dễ cũng là lựa chọn đúng hôm nay. cứ nhận, không cần xin lỗi.",
      ],
    },
    pushing: {
      self: [
        "bạn sẽ muốn giải thích những lựa chọn nhỏ. cứ chọn, bỏ qua đoạn giải thích.",
        "tâm trạng đổi trước bữa trưa. ăn trước, quyết sau.",
        "bạn mệt vì luôn là người hợp lý. dành một tiếng không ai nhận ý kiến của bạn.",
      ],
      love: [
        "một bực bội nhỏ muốn thành bài diễn văn. nói trong một câu, hoặc bỏ qua.",
        "kỳ vọng hôm nay to hơn con người. hãy nghe con người.",
        "bạn có thể đọc ra khoảng cách trong một tin nhắn chậm. thường nó chỉ là tin nhắn chậm.",
      ],
      work: [
        "sau bữa trưa bạn dễ mất kiên nhẫn. viết câu trả lời, chờ một tiếng rồi gửi.",
        "có người ép hạn chót. đồng ý ngày, không đồng ý giọng điệu.",
        "quá nhiều thẻ, quá nhiều lời hứa. đóng ba cái trước khi mở một cái.",
      ],
      luck: [
        "một lời đề nghị tốt đi kèm điều khoản nhỏ. đọc hai lần.",
        "hôm nay dễ nhận quá sức. nói có thể, rồi ngủ một đêm.",
        "nhiều hơn không phải tốt hơn hôm nay. chọn phiên bản nhỏ của kế hoạch.",
      ],
    },
    protect: {
      self: [
        "năng lượng của bạn. từ chối một việc trước buổi trưa.",
        "buổi tối của bạn. giữ một tiếng không ai đặt lịch được.",
        "giấc ngủ của bạn. tắt màn hình sớm hơn bạn nghĩ.",
      ],
      love: [
        "sự mềm mỏng của bạn. không phải ai cũng xứng với bản dài hôm nay.",
        "khoảng lặng giữa bạn và một người. đừng lấp nó bằng kế hoạch.",
        "sự kiên nhẫn với người thân. để cuộc cãi cũ ở yên chỗ cũ.",
      ],
      work: [
        "sự tập trung. một việc, một cửa sổ, đến khi xong.",
        "thời gian của bạn. cuộc họp có thể là tin nhắn thì nên là tin nhắn.",
        "tiêu chuẩn của bạn. làm xong cho đàng hoàng hơn là xong trước.",
      ],
      luck: [
        "tiền của bạn. chờ một ngày trước món đồ có vẻ gấp.",
        "tâm trạng tốt. đừng tiêu nó vào người không lắng nghe.",
        "lời đồng ý của bạn. giữ cho việc bạn vẫn sẽ làm.",
      ],
    },
  },
};

export const summaryBank: Record<Lang, Record<AspectTheme, string>> = {
  en: {
    self: "a day for your own pace. finish one thing properly.",
    love: "a softer day. people are easier to read, and so are you.",
    work: "a day that rewards finishing over starting.",
    luck: "a day with a small opening in it. notice it.",
  },
  vi: {
    self: "một ngày theo nhịp của bạn. làm xong một việc cho đàng hoàng.",
    love: "một ngày dịu hơn. mọi người dễ đọc hơn, bạn cũng vậy.",
    work: "một ngày thưởng cho việc kết thúc hơn là bắt đầu.",
    luck: "một ngày có một khe hở nhỏ. hãy để ý.",
  },
};

export const quietBank: Record<Lang, string> = {
  en: "a quiet day. nothing in the sky is asking for much.",
  vi: "một ngày yên. bầu trời không đòi hỏi gì nhiều.",
};

export function pickLine(lang: Lang, slot: BlockSlot, theme: AspectTheme, seed: number): string {
  const lines = textBank[lang][slot][theme];
  return lines[Math.abs(Math.floor(seed)) % lines.length];
}
