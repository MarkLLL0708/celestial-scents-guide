// Friend-voice fallback lines for Ask when the live writer is unavailable.
// Lines are chosen by theme (and a chart/date seed) so two different charts do not read the same.
import type { AspectTheme } from "./aspects";

type Lang = "en" | "vi";
export type BlockSlot = "working" | "pushing" | "protect";

export const textBank: Record<Lang, Record<BlockSlot, Record<AspectTheme, string[]>>> = {
  en: {
    working: {
      self: [
        "You've described this plan to three people already. Start it before you describe it to a fourth.",
        "You actually know what you want today. Write it down before you talk yourself out of it.",
        "Your pace is fine today. Stop checking if everyone else approves of it.",
      ],
      love: [
        "Say the plain thing. The clever version just makes them work harder to like you.",
        "Someone's being nice to you today. Let them, without arguing about whether you deserve it.",
        "Send the photo, keep the message short, and don't stare at the screen afterwards.",
      ],
      work: [
        "Your head's clear enough for the boring task. Do the oldest thing on the list first.",
        "That vague plan needs a date. Plans without dates are just wishes with spreadsheets.",
        "You explain things well today. Use it on the email you've been dodging all week.",
      ],
      luck: [
        "Go to the slightly awkward thing. You can leave after an hour, nobody's locking the door.",
        "Reply to the person who helped you last time. That's where the good stuff comes from.",
        "The easy option is the right one today. Take it and skip the guilt.",
      ],
    },
    pushing: {
      self: [
        "You're about to over-explain a tiny choice. Make it, skip the essay.",
        "Your mood will flip before lunch. Eat something before you decide anything.",
        "You're tired of being the reasonable one. Take an hour off from having opinions.",
      ],
      love: [
        "A small annoyance wants to become a speech. One line, or let it go.",
        "A slow reply is usually just a slow reply. Stop writing the sad movie in your head.",
        "You're arguing with what you expected, not with the actual person. Listen to them.",
      ],
      work: [
        "Your patience dies after lunch. Write the reply, then wait an hour before sending it.",
        "Agree to the deadline, not the tone. You don't have to absorb someone else's panic.",
        "Too many tabs, too many promises. Close three before you open another.",
      ],
      luck: [
        "The good offer has fine print. Read it twice before you get excited.",
        "You want to say yes to everything. Say maybe and sleep on it.",
        "Bigger isn't better today. Do the smaller version and actually finish it.",
      ],
    },
    protect: {
      self: [
        "Say no to one thing before noon. The world will survive without your yes.",
        "Keep one hour this evening that nobody can book, including you.",
        "Put the phone down earlier than you think. Scrolling isn't resting.",
      ],
      love: [
        "Not everyone's earned the long version of your feelings today. Give the short one.",
        "Leave the old argument where it is. Digging it up never ends the way you want.",
        "Don't fill every quiet moment with plans. Silence isn't a problem to solve.",
      ],
      work: [
        "One task, one window, until it's done. Multitasking is just failing at several things.",
        "If the meeting could be a message, make it a message.",
        "Finish it properly instead of finishing it first. Nobody remembers who was fastest.",
      ],
      luck: [
        "Wait a day before buying the thing that feels urgent. It won't be tomorrow.",
        "Don't waste a good mood on people who aren't listening.",
        "Save your yes for things you'd actually still do next week.",
      ],
    },
  },
  vi: {
    working: {
      self: [
        "Kể kế hoạch này cho ba người rồi đấy. Bắt tay làm trước khi kể cho người thứ tư.",
        "Hôm nay biết rõ mình muốn gì. Ghi lại trước khi tự thuyết phục mình bỏ.",
        "Nhịp của mình hôm nay ổn mà. Thôi đi hỏi xem ai có duyệt không.",
      ],
      love: [
        "Nói thẳng câu đơn giản thôi. Bản khéo léo chỉ làm người ta mệt hơn.",
        "Hôm nay có người tử tế với mình. Cứ nhận đi, đừng cãi xem mình có xứng không.",
        "Gửi tấm ảnh, nhắn ngắn thôi, rồi đừng ngồi nhìn màn hình nữa.",
      ],
      work: [
        "Đầu óc đủ tỉnh để làm việc chán rồi. Làm cái cũ nhất trong danh sách trước.",
        "Kế hoạch mơ hồ kia cần một ngày cụ thể. Không có ngày thì chỉ là ước mơ có bảng tính.",
        "Hôm nay nói gì cũng dễ hiểu. Dùng nó cho cái email né cả tuần nay đi.",
      ],
      luck: [
        "Cứ đến cái buổi hơi ngại kia. Một tiếng chán thì về, có ai khóa cửa đâu.",
        "Nhắn lại cho người từng giúp mình. Cái hay thường tới từ đó.",
        "Hôm nay lựa chọn dễ chính là lựa chọn đúng. Chọn luôn, khỏi áy náy.",
      ],
    },
    pushing: {
      self: [
        "Sắp giải thích dài dòng cho một lựa chọn bé tí. Chọn đi, bỏ bài văn.",
        "Tâm trạng sẽ đổi trước bữa trưa. Ăn gì đó rồi mới quyết.",
        "Mệt vì lúc nào cũng phải là người hợp lý rồi. Nghỉ có ý kiến một tiếng đi.",
      ],
      love: [
        "Một bực bội nhỏ đang muốn thành bài diễn văn. Một câu thôi, hoặc bỏ qua.",
        "Nhắn chậm thường chỉ là nhắn chậm. Thôi dựng phim buồn trong đầu đi.",
        "Đang cãi với điều mình kỳ vọng chứ đâu phải với người thật. Nghe người ta nói đã.",
      ],
      work: [
        "Qua trưa là hết kiên nhẫn. Viết trả lời xong thì chờ một tiếng rồi mới gửi.",
        "Đồng ý hạn chót, đừng đồng ý giọng điệu. Không cần ôm hộ cơn hoảng của ai.",
        "Quá nhiều tab, quá nhiều lời hứa. Đóng ba cái rồi mới mở cái mới.",
      ],
      luck: [
        "Lời mời ngon thì có điều khoản nhỏ. Đọc hai lần rồi hẵng mừng.",
        "Muốn gật đầu với mọi thứ đấy. Nói để xem đã, ngủ một đêm rồi tính.",
        "Hôm nay to hơn không có nghĩa là tốt hơn. Làm bản nhỏ mà làm cho xong.",
      ],
    },
    protect: {
      self: [
        "Từ chối một việc trước buổi trưa. Thiếu cái gật đầu của mình thì đời vẫn chạy.",
        "Giữ một tiếng tối nay không ai đặt lịch được, kể cả chính mình.",
        "Bỏ điện thoại xuống sớm hơn mình nghĩ. Lướt mạng đâu phải nghỉ ngơi.",
      ],
      love: [
        "Không phải ai cũng xứng nghe bản dài của cảm xúc hôm nay. Kể bản ngắn thôi.",
        "Chuyện cãi cũ để yên đấy. Đào lên chẳng bao giờ kết thúc như mình muốn.",
        "Đừng lấp mọi khoảng lặng bằng kế hoạch. Im lặng đâu phải bài toán cần giải.",
      ],
      work: [
        "Một việc, một cửa sổ, làm đến khi xong. Làm nhiều việc một lúc là hỏng nhiều việc một lúc.",
        "Cuộc họp mà nhắn tin được thì nhắn tin thôi.",
        "Làm cho đàng hoàng thay vì làm cho nhanh. Chẳng ai nhớ ai xong trước đâu.",
      ],
      luck: [
        "Chờ một ngày trước khi mua món có vẻ gấp. Mai là hết gấp ngay.",
        "Đừng phí tâm trạng tốt cho người không thèm nghe.",
        "Giữ cái gật đầu cho việc tuần sau mình vẫn muốn làm.",
      ],
    },
  },
};

export const summaryBank: Record<Lang, Record<AspectTheme, string>> = {
  en: {
    self: "Your day, your pace. Finish one thing properly and stop there.",
    love: "People are easier to read today. So are you, so act like it.",
    work: "Finishing beats starting today. Close something.",
    luck: "There's a small opening today. Don't be too busy to notice it.",
  },
  vi: {
    self: "Ngày của mình, nhịp của mình. Làm xong một việc cho đàng hoàng rồi thôi.",
    love: "Hôm nay dễ đọc người, người cũng dễ đọc mình. Cư xử cho đàng hoàng.",
    work: "Hôm nay làm xong quan trọng hơn bắt đầu. Đóng được việc nào thì đóng.",
    luck: "Có một khe cửa nhỏ hôm nay. Đừng bận tới mức không thấy.",
  },
};

export const quietBank: Record<Lang, string> = {
  en: "Quiet sky today. No excuses, no drama, just get on with it.",
  vi: "Trời yên hôm nay. Không cớ, không drama, cứ thế mà làm.",
};

export function pickLine(lang: Lang, slot: BlockSlot, theme: AspectTheme, seed: number): string {
  const lines = textBank[lang][slot][theme];
  return lines[Math.abs(Math.floor(seed)) % lines.length];
}
