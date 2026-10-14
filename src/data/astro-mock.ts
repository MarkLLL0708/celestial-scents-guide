// Mock astrology content. A real engine replaces this file; the UI only sees api.ts.
import type { AstroAnswer, Reading, Ritual, Theme, Today, Topic, Transit } from "./types";

type Lang = "en" | "vi";
type Section = [string, string];

const tr = (
  transiting: Transit["transiting"],
  aspect: Transit["aspect"],
  natal: Transit["natal"],
  orb: number,
  theme: Theme,
  strength: Transit["strength"],
): Transit => ({ transiting, aspect, natal, orb, theme, strength });

export const topics: Topic[] = ["you", "love", "work", "luck"];

const readingText: Record<Lang, Record<Topic, { title: string; sections: Section[] }>> = {
  en: {
    you: {
      title: "an air sign who wants a door to close",
      sections: [
        [
          "the sun in aquarius",
          "Your sun sits at 25° aquarius, late in the sign, where the ideas are already formed and only need a room. You think in systems and group plans. People read you as calm. Mostly you are thinking about something else, and you would rather finish the thought than be polite about interrupting it.",
        ],
        [
          "the moon in cancer",
          "The moon in cancer is the soft part under the theory. You need a fixed place to come back to: the same mug, the same chair, the same three people. When that place is shaken you go quiet before you go angry. Most people never see the second step, because you leave first.",
        ],
        [
          "libra rising",
          "Libra rising is the face at the door. It is polite, balanced, a little slow to say no. Strangers find you easy. The cost is that you agree to small things you do not want, then spend an evening undoing them. A shorter yes would save you most of the week.",
        ],
        [
          "where they argue",
          "Aquarius wants distance, cancer wants closeness, libra wants everyone to be fine. The three rarely agree on a plan. You solve it by keeping one life for ideas and another for home, and by not letting the two meet. It works, until a single person ends up belonging to both.",
        ],
        [
          "what to keep",
          "Keep the routines that look boring from outside. They are what lets the aquarius part go wandering without getting lost. Keep one person who knows both sides of you. And keep saying the late, odd idea out loud. Usually it turns out to be the one everyone uses next month.",
        ],
      ],
    },
    love: {
      title: "careful at the door, generous inside",
      sections: [
        [
          "venus in pisces",
          "Venus at 14° pisces is the most generous placement in your chart. You love by noticing: the song someone hums, the tea they ordered once. You forgive early and sometimes too early. Pisces venus does not keep score, which is lovely, until you realise nobody else was counting your side either.",
        ],
        [
          "the moon asks for safety",
          "With the moon in cancer, love has to feel like home before it can feel like anything else. Fast and loud does not register as romance. Being remembered does. If someone is consistent for three months you will give them more than they asked for. If they are clever but unpredictable, you will drift.",
        ],
        [
          "mars in gemini",
          "Mars in gemini means you flirt by talking. Long messages, odd questions, a joke that runs for weeks. Arguments are fast and verbal and over quickly. The risk is talking around a feeling instead of naming it. Try one plain sentence with a feeling in it. It lands harder than a clever paragraph.",
        ],
        [
          "what pushes back",
          "Libra rising wants peace, so you smooth things that should be said. The aquarius sun then takes a step back to think, which reads as cold. Partners feel the gap and fill it with guesses. The fix is boring: say the small irritation on the day it happens, not at the end of the month.",
        ],
        [
          "what lasts",
          "You stay with people who give you room and still turn up. Pick the friend who texts back late but always texts back. Pisces venus will make anyone sound magical in your head. The cancer moon is the better judge. Ask it one question: do I feel calmer after seeing them, or more alert?",
        ],
      ],
    },
    work: {
      title: "good at the plan, slower at the paperwork",
      sections: [
        [
          "mercury in capricorn",
          "Mercury at 29° capricorn gives you a practical mind with a long view. You write short, plan in stages and distrust vague promises. Late-degree mercury tends to check the work once more than needed. That last check is usually where you find the mistake, so keep doing it, just set a time limit.",
        ],
        [
          "the aquarius sun at work",
          "You do best where the problem is bigger than any one person. Systems, communities, tools other people will use. You dislike hierarchy for its own sake and will quietly route around a manager who adds nothing. Choose places that let you build something and then leave it running without you.",
        ],
        [
          "saturn in pisces",
          "Saturn at 22° pisces is the strict teacher in a soft room. Structure does not come naturally around feelings, deadlines that depend on other people, or anything without edges. You learn discipline late but properly. Write the edges down: start time, end time, what done means. Saturn here respects lists.",
        ],
        [
          "mars in gemini",
          "Mars in gemini runs several projects at once and gets bored at seventy percent. Your best weeks have two tasks, not six. Talking a problem through helps more than staring at it. Find one colleague who lets you think aloud and then asks you, plainly, which of the six you are actually finishing.",
        ],
        [
          "what to protect",
          "Protect the mornings. The capricorn mercury does its best thinking before the messages arrive. Protect your name on the work you did, because the libra rising will happily share credit until it disappears. And protect one afternoon a week that has no meetings at all. That is where the aquarius ideas come from.",
        ],
      ],
    },
    luck: {
      title: "luck that arrives through other people",
      sections: [
        [
          "jupiter in sagittarius",
          "Jupiter at 11° sagittarius sits in its own sign, which astrologers read as luck that works without much effort. Yours comes through travel, teachers and strangers with strong opinions. It rarely knocks on the door at home. You have to go somewhere slightly unfamiliar for it to find you.",
        ],
        [
          "how it shows up",
          "Expect openings, not prizes. An introduction, a course that happens to have a free place, a city you visit for a weekend and keep thinking about. Sagittarius jupiter likes a yes said quickly. The aquarius sun will want to research it first. Do the research after you have said yes.",
        ],
        [
          "venus supports it",
          "Venus in pisces trines your cancer moon in the chart, a soft and easy link. Luck often arrives with kindness attached: someone helps because they like you, not because it pays. Say thank you properly, in writing. These people tend to come back with a second, bigger favour a year later.",
        ],
        [
          "what blocks it",
          "Saturn in pisces asks whether you deserve the good thing before you take it. That pause costs you more chances than any bad transit. Libra rising adds a second pause to check nobody else wanted it. Notice both pauses. You do not need to remove them, only make them shorter.",
        ],
        [
          "this year",
          "Transiting jupiter moves toward your libra rising over the next months, which is read as a time for being seen. Say yes to the small public things: a talk, a post, a dinner with people you half know. The luck is not in the event. It is in the one person you meet there.",
        ],
      ],
    },
  },
  vi: {
    you: {
      title: "một cung khí muốn có một cánh cửa đóng lại",
      sections: [
        [
          "mặt trời ở bảo bình",
          "Mặt trời của bạn ở 25° bảo bình, cuối cung, nơi ý tưởng đã hình thành và chỉ cần một căn phòng. Bạn nghĩ theo hệ thống và kế hoạch nhóm. Người khác thấy bạn bình tĩnh. Thật ra bạn đang nghĩ chuyện khác, và muốn nghĩ xong hơn là lịch sự khi bị cắt ngang.",
        ],
        [
          "mặt trăng ở cự giải",
          "Mặt trăng ở cự giải là phần mềm bên dưới lý thuyết. Bạn cần một chỗ cố định để quay về: cùng cái cốc, cùng cái ghế, cùng ba người. Khi chỗ đó lung lay, bạn im lặng trước khi tức giận. Hầu hết mọi người không thấy bước thứ hai, vì bạn đã rời đi trước.",
        ],
        [
          "cung mọc thiên bình",
          "Cung mọc thiên bình là gương mặt ở cửa. Lịch sự, cân bằng, hơi chậm khi nói không. Người lạ thấy bạn dễ gần. Cái giá là bạn đồng ý những việc nhỏ mình không muốn, rồi mất một buổi tối để gỡ ra. Một lời đồng ý ngắn hơn sẽ cứu bạn gần cả tuần.",
        ],
        [
          "nơi chúng tranh cãi",
          "Bảo bình muốn khoảng cách, cự giải muốn gần gũi, thiên bình muốn mọi người đều ổn. Ba phần hiếm khi đồng ý. Bạn giải quyết bằng một đời sống cho ý tưởng, một đời sống cho nhà, và không để hai thứ gặp nhau. Cách này ổn, cho đến khi có một người thuộc về cả hai.",
        ],
        [
          "điều nên giữ",
          "Giữ những thói quen trông nhàm chán từ bên ngoài. Chúng cho phần bảo bình đi lang thang mà không lạc. Giữ một người hiểu cả hai phía của bạn. Và cứ nói to ý tưởng muộn màng, kỳ lạ đó. Thường thì đó là ý mà tháng sau ai cũng dùng.",
        ],
      ],
    },
    love: {
      title: "cẩn thận ở cửa, rộng lượng bên trong",
      sections: [
        [
          "kim tinh ở song ngư",
          "Kim tinh ở 14° song ngư là vị trí rộng lượng nhất trong bản đồ của bạn. Bạn yêu bằng cách để ý: bài hát ai đó ngân nga, loại trà họ gọi một lần. Bạn tha thứ sớm, đôi khi quá sớm. Kim tinh song ngư không đếm điểm, điều đó đẹp, cho đến khi bạn nhận ra cũng chẳng ai đếm phần của bạn.",
        ],
        [
          "mặt trăng cần an toàn",
          "Với mặt trăng ở cự giải, tình yêu phải giống như nhà trước khi giống bất cứ điều gì khác. Nhanh và ồn không được tính là lãng mạn. Được nhớ đến thì có. Nếu ai đó đều đặn trong ba tháng, bạn sẽ cho họ nhiều hơn họ xin. Nếu họ thông minh nhưng thất thường, bạn sẽ trôi đi.",
        ],
        [
          "hỏa tinh ở song tử",
          "Hỏa tinh ở song tử nghĩa là bạn tán tỉnh bằng lời. Tin nhắn dài, câu hỏi lạ, một câu đùa kéo dài nhiều tuần. Cãi nhau nhanh, bằng lời, và qua nhanh. Rủi ro là nói vòng quanh một cảm xúc thay vì gọi tên nó. Thử một câu đơn giản có cảm xúc. Nó có sức nặng hơn một đoạn văn khéo.",
        ],
        [
          "điều cản lại",
          "Cung mọc thiên bình muốn yên ổn, nên bạn làm phẳng những điều đáng nói. Mặt trời bảo bình lùi lại để suy nghĩ, trông như lạnh lùng. Người kia cảm thấy khoảng trống và lấp bằng phỏng đoán. Cách sửa rất nhàm: nói điều khó chịu nhỏ ngay trong ngày, đừng để đến cuối tháng.",
        ],
        [
          "điều bền lâu",
          "Bạn ở lại với người cho bạn khoảng trống mà vẫn có mặt. Chọn người bạn nhắn lại muộn nhưng luôn nhắn lại. Kim tinh song ngư sẽ khiến ai cũng nghe như phép màu trong đầu bạn. Mặt trăng cự giải là giám khảo tốt hơn. Hỏi nó một câu: gặp họ xong mình bình tĩnh hơn hay cảnh giác hơn?",
        ],
      ],
    },
    work: {
      title: "giỏi lập kế hoạch, chậm hơn với giấy tờ",
      sections: [
        [
          "thủy tinh ở ma kết",
          "Thủy tinh ở 29° ma kết cho bạn đầu óc thực tế với tầm nhìn dài. Bạn viết ngắn, lập kế hoạch theo từng giai đoạn và không tin lời hứa mơ hồ. Thủy tinh ở độ cuối thường kiểm tra lại thêm một lần. Lần đó thường là lúc bạn tìm ra lỗi, nên cứ làm, chỉ cần đặt giới hạn thời gian.",
        ],
        [
          "mặt trời bảo bình trong công việc",
          "Bạn làm tốt nhất khi vấn đề lớn hơn bất kỳ một người nào. Hệ thống, cộng đồng, công cụ người khác sẽ dùng. Bạn không thích thứ bậc chỉ vì thứ bậc và sẽ lặng lẽ đi vòng qua người quản lý không đóng góp gì. Chọn nơi cho bạn xây một thứ rồi để nó tự chạy.",
        ],
        [
          "thổ tinh ở song ngư",
          "Thổ tinh ở 22° song ngư là người thầy nghiêm trong một căn phòng mềm. Kỷ luật không đến tự nhiên quanh cảm xúc, những hạn chót phụ thuộc người khác, hay bất cứ thứ gì không có ranh giới. Bạn học kỷ luật muộn nhưng chắc. Viết ranh giới ra: giờ bắt đầu, giờ kết thúc, thế nào là xong.",
        ],
        [
          "hỏa tinh ở song tử",
          "Hỏa tinh ở song tử chạy nhiều dự án cùng lúc và chán khi đến bảy mươi phần trăm. Tuần tốt nhất của bạn có hai việc, không phải sáu. Nói ra vấn đề giúp nhiều hơn nhìn chằm chằm vào nó. Tìm một đồng nghiệp để bạn nghĩ thành tiếng, rồi hỏi thẳng bạn sẽ hoàn thành việc nào.",
        ],
        [
          "điều cần bảo vệ",
          "Bảo vệ buổi sáng. Thủy tinh ma kết nghĩ tốt nhất trước khi tin nhắn đến. Bảo vệ tên bạn trên việc bạn đã làm, vì cung mọc thiên bình sẵn sàng chia công cho đến khi nó biến mất. Và bảo vệ một buổi chiều mỗi tuần không có cuộc họp nào. Ý tưởng bảo bình đến từ đó.",
        ],
      ],
    },
    luck: {
      title: "may mắn đến qua người khác",
      sections: [
        [
          "mộc tinh ở nhân mã",
          "Mộc tinh ở 11° nhân mã nằm trong cung của chính nó, thường được đọc là may mắn đến mà không cần nhiều công sức. May mắn của bạn đến qua đi xa, thầy cô và những người lạ có ý kiến mạnh. Nó hiếm khi gõ cửa nhà. Bạn phải đến một nơi hơi lạ để nó tìm thấy bạn.",
        ],
        [
          "nó xuất hiện thế nào",
          "Hãy chờ những cơ hội, không phải giải thưởng. Một lời giới thiệu, một khóa học còn chỗ trống, một thành phố bạn ghé cuối tuần rồi nhớ mãi. Mộc tinh nhân mã thích một lời đồng ý nhanh. Mặt trời bảo bình muốn tìm hiểu trước. Hãy tìm hiểu sau khi đã đồng ý.",
        ],
        [
          "kim tinh hỗ trợ",
          "Kim tinh song ngư tam hợp mặt trăng cự giải trong bản đồ, một liên kết mềm và dễ. May mắn thường đến kèm sự tử tế: ai đó giúp vì họ quý bạn, không vì lợi. Hãy cảm ơn tử tế, bằng chữ viết. Những người này thường quay lại với một ân huệ lớn hơn một năm sau.",
        ],
        [
          "điều chặn nó",
          "Thổ tinh song ngư hỏi bạn có xứng đáng với điều tốt trước khi nhận nó. Khoảng dừng đó làm bạn mất nhiều cơ hội hơn bất kỳ quá cảnh xấu nào. Cung mọc thiên bình thêm một khoảng dừng nữa để xem có ai khác muốn nó không. Để ý cả hai. Không cần bỏ, chỉ cần ngắn lại.",
        ],
        [
          "năm nay",
          "Mộc tinh quá cảnh tiến về cung mọc thiên bình của bạn trong vài tháng tới, thường được đọc là thời gian được nhìn thấy. Đồng ý với những việc công khai nhỏ: một buổi nói chuyện, một bài đăng, một bữa tối với người nửa quen. May mắn không nằm ở sự kiện. Nó nằm ở một người bạn gặp ở đó.",
        ],
      ],
    },
  },
};

export function readingFor(topic: Topic, lang: Lang): Reading {
  const r = readingText[lang][topic];
  return {
    topic,
    title: r.title,
    sections: r.sections.map(([title, body]) => ({ title, body })),
  };
}

const todayText: Record<
  Lang,
  { summary: string; working: string; pushing: string; protect: string }
> = {
  en: {
    summary: "a quiet day that rewards finishing one thing properly.",
    working:
      "Venus is easy on your moon today. Small kindness lands well. Send the message you have been drafting since sunday.",
    pushing:
      "Mars squares your mercury. Replies come out sharper than you mean. Read anything important twice before it goes.",
    protect:
      "Saturn sits on your venus. Protect the evening. You do not owe anyone a second plan after six.",
  },
  vi: {
    summary: "một ngày yên tĩnh, thưởng cho việc làm xong một việc cho đàng hoàng.",
    working:
      "Kim tinh nhẹ nhàng với mặt trăng của bạn hôm nay. Sự tử tế nhỏ được đón nhận. Gửi tin nhắn bạn đã soạn từ chủ nhật.",
    pushing:
      "Hỏa tinh vuông góc thủy tinh của bạn. Câu trả lời sắc hơn bạn muốn. Đọc lại điều quan trọng hai lần trước khi gửi.",
    protect:
      "Thổ tinh nằm trên kim tinh của bạn. Bảo vệ buổi tối. Sau sáu giờ bạn không nợ ai kế hoạch thứ hai.",
  },
};

export function todayFor(date: string, lang: Lang): Today {
  const x = todayText[lang];
  return {
    date,
    summary: x.summary,
    tone: { self: 3, love: 4, work: 2, luck: 3 },
    working: { transit: tr("venus", "trine", "moon", 2, "love", 4), text: x.working },
    pushing: { transit: tr("mars", "square", "mercury", 1, "work", 3), text: x.pushing },
    protect: { transit: tr("saturn", "conjunct", "venus", 3, "self", 3), text: x.protect },
    ritualId: "evening-close",
  };
}

const answerText: Record<Lang, Record<Theme, string[]>> = {
  en: {
    self: [
      "Today asks for less explaining. The square makes you over-justify small choices. Make the choice, skip the paragraph, see who actually minds.",
      "You are tired of being the reasonable one. That is the moon talking, not a flaw. Take one evening where nobody gets your opinion.",
    ],
    love: [
      "Yes, but say it plainly. The trine makes warmth easy to read today. Clever is not needed. One sentence with a feeling in it will do.",
      "Not this week. Venus wants a slower answer. Wait for the second message, not the first. You will know more by friday.",
    ],
    work: [
      "Finish the oldest task first. Mercury is sharp and impatient right now, which is good for closing things and bad for starting them.",
      "Ask in writing. Spoken requests will get lost under the opposition this week. A short email with a date in it gets done.",
    ],
    luck: [
      "Say yes to the invitation you were going to decline. Jupiter favours the slightly unfamiliar room. Leave after an hour if you like.",
      "Luck is not loud this week. It looks like a small favour from someone you helped last year. Reply to them today.",
    ],
  },
  vi: {
    self: [
      "Hôm nay cần ít giải thích hơn. Góc vuông khiến bạn biện minh quá mức cho những lựa chọn nhỏ. Cứ chọn, bỏ qua đoạn giải thích, xem ai thật sự bận tâm.",
      "Bạn mệt vì luôn là người hợp lý. Đó là mặt trăng lên tiếng, không phải khuyết điểm. Dành một buổi tối không ai nhận ý kiến của bạn.",
    ],
    love: [
      "Có, nhưng nói đơn giản. Góc tam hợp khiến sự ấm áp dễ đọc hôm nay. Không cần khéo. Một câu có cảm xúc là đủ.",
      "Chưa phải tuần này. Kim tinh muốn một câu trả lời chậm hơn. Chờ tin nhắn thứ hai, không phải thứ nhất. Đến thứ sáu bạn sẽ biết rõ hơn.",
    ],
    work: [
      "Làm xong việc cũ nhất trước. Thủy tinh đang sắc và thiếu kiên nhẫn, tốt để kết thúc, không tốt để bắt đầu.",
      "Hỏi bằng văn bản. Yêu cầu nói miệng sẽ bị lạc tuần này. Một email ngắn có ngày cụ thể sẽ được làm.",
    ],
    luck: [
      "Đồng ý với lời mời bạn định từ chối. Mộc tinh ưu ái căn phòng hơi lạ. Về sau một tiếng cũng được.",
      "May mắn tuần này không ồn ào. Nó trông như một ân huệ nhỏ từ người bạn đã giúp năm ngoái. Trả lời họ hôm nay.",
    ],
  },
};

const answerTransits: Record<Theme, Transit[]> = {
  self: [tr("sun", "square", "moon", 2, "self", 3), tr("moon", "opposite", "sun", 1, "self", 2)],
  love: [tr("venus", "trine", "moon", 1, "love", 4), tr("venus", "square", "mars", 3, "love", 2)],
  work: [
    tr("mars", "square", "mercury", 1, "work", 4),
    tr("mercury", "opposite", "saturn", 2, "work", 3),
  ],
  luck: [
    tr("jupiter", "sextile", "sun", 2, "luck", 4),
    tr("jupiter", "trine", "venus", 3, "luck", 3),
  ],
};

export const ritualForTheme: Record<Theme, string> = {
  self: "morning-line",
  love: "letter-unsent",
  work: "desk-reset",
  luck: "open-door",
};
export const themeForTopic: Record<Topic, Theme> = {
  you: "self",
  love: "love",
  work: "work",
  luck: "luck",
};

export function answerFor(question: string, theme: Theme, lang: Lang): AstroAnswer {
  const i = question.trim().length % 2;
  return {
    transit: answerTransits[theme][i],
    answer: answerText[lang][theme][i],
    ritualId: ritualForTheme[theme],
  };
}

type RitualText = Omit<Ritual, "id" | "theme" | "minutes">;
const ritualText: Record<Lang, Record<string, RitualText>> = {
  en: {
    "morning-line": {
      title: "one line before the phone",
      intention: "start the day with your own thought, not someone else's.",
      timing: "on waking",
      steps: [
        "Before you check anything, sit up and put one drop of a scent you own on your wrist.",
        "Write one line about what today is for.",
        "Read it once, close the notebook, then pick up the phone.",
      ],
    },
    "letter-unsent": {
      title: "the letter you do not send",
      intention: "name a feeling clearly before you decide what to do with it.",
      timing: "a friday evening",
      steps: [
        "Choose a scent you already wear for this person, or none.",
        "Write them a short letter you will not send. Use plain sentences.",
        "Underline the one sentence you would actually say. Keep only that.",
      ],
    },
    "desk-reset": {
      title: "a reset for the desk",
      intention: "finish the week with a clear surface and a short list.",
      timing: "friday, last half hour",
      steps: [
        "Clear the desk completely, then put back only three things.",
        "Write next week's two tasks on one card.",
        "Apply a fresh scent you own, so monday starts with something familiar.",
      ],
    },
    "open-door": {
      title: "leave a door open",
      intention: "notice one small chance you would usually walk past.",
      timing: "any morning this week",
      steps: [
        "Wear the scent you save for occasions on an ordinary day.",
        "Say yes to the first small, slightly unfamiliar offer.",
        "At night, write down who you met because of it.",
      ],
    },
    "evening-close": {
      title: "close the evening",
      intention: "end the day on purpose instead of letting it run out.",
      timing: "after six",
      steps: [
        "Turn off one light and one screen.",
        "Put a drop of any scent you own on a tissue near you.",
        "Write the three things you did today. Stop there.",
      ],
    },
  },
  vi: {
    "morning-line": {
      title: "một dòng trước điện thoại",
      intention: "bắt đầu ngày bằng suy nghĩ của mình, không phải của người khác.",
      timing: "khi thức dậy",
      steps: [
        "Trước khi xem bất cứ thứ gì, ngồi dậy và chấm một giọt mùi hương bạn có lên cổ tay.",
        "Viết một dòng về hôm nay để làm gì.",
        "Đọc một lần, gấp sổ lại, rồi mới cầm điện thoại.",
      ],
    },
    "letter-unsent": {
      title: "lá thư không gửi",
      intention: "gọi tên một cảm xúc rõ ràng trước khi quyết định làm gì với nó.",
      timing: "một tối thứ sáu",
      steps: [
        "Chọn mùi hương bạn vẫn dùng khi gặp người này, hoặc không dùng gì.",
        "Viết cho họ một lá thư ngắn bạn sẽ không gửi. Dùng câu đơn giản.",
        "Gạch dưới câu bạn thật sự sẽ nói. Chỉ giữ câu đó.",
      ],
    },
    "desk-reset": {
      title: "dọn lại bàn làm việc",
      intention: "kết thúc tuần với mặt bàn trống và một danh sách ngắn.",
      timing: "thứ sáu, nửa tiếng cuối",
      steps: [
        "Dọn sạch bàn, rồi chỉ đặt lại ba món.",
        "Viết hai việc của tuần sau lên một tấm thẻ.",
        "Xịt lại một mùi hương bạn có, để thứ hai bắt đầu bằng điều quen thuộc.",
      ],
    },
    "open-door": {
      title: "để ngỏ một cánh cửa",
      intention: "để ý một cơ hội nhỏ mà bạn thường bước qua.",
      timing: "một buổi sáng tuần này",
      steps: [
        "Dùng mùi hương bạn để dành cho dịp đặc biệt vào một ngày bình thường.",
        "Đồng ý với lời đề nghị nhỏ, hơi lạ đầu tiên.",
        "Buổi tối, viết lại bạn đã gặp ai nhờ nó.",
      ],
    },
    "evening-close": {
      title: "khép lại buổi tối",
      intention: "kết thúc ngày một cách có chủ ý thay vì để nó tự cạn.",
      timing: "sau sáu giờ",
      steps: [
        "Tắt một ngọn đèn và một màn hình.",
        "Chấm một giọt mùi hương bất kỳ bạn có lên khăn giấy gần mình.",
        "Viết ba việc bạn đã làm hôm nay. Dừng ở đó.",
      ],
    },
  },
};

const ritualMeta: Record<string, { theme: Theme; minutes: number }> = {
  "morning-line": { theme: "self", minutes: 3 },
  "letter-unsent": { theme: "love", minutes: 15 },
  "desk-reset": { theme: "work", minutes: 20 },
  "open-door": { theme: "luck", minutes: 5 },
  "evening-close": { theme: "self", minutes: 10 },
};

export const ritualIds = Object.keys(ritualMeta);

export function ritualFor(id: string, lang: Lang): Ritual | null {
  const meta = ritualMeta[id];
  if (!meta) return null;
  return { id, ...meta, ...ritualText[lang][id] };
}
