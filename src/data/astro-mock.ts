// Mock astrology content. A real engine replaces this file; the UI only sees api.ts.
import { readingRitualFor, readingRitualIds } from "@/lib/reading/rituals";
import type {
  AstroAnswer,
  Reading,
  Ritual,
  RitualTheme,
  Theme,
  Today,
  Topic,
  Transit,
} from "./types";

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
          "how you start",
          "Your sun sits at 25° aquarius, late in the sign, where the ideas are already formed and only need a room. You think in systems and group plans. People read you as calm. Mostly you are thinking about something else, and you would rather finish the thought than be polite about interrupting it.",
        ],
        [
          "how you react",
          "The moon in cancer is the soft part under the theory. You need a fixed place to come back to: the same mug, the same chair, the same three people. When that place is shaken you go quiet before you go angry. Most people never see the second step, because you leave first.",
        ],
        [
          "how you rest",
          "Libra rising is the face at the door. It is polite, balanced, a little slow to say no. Strangers find you easy. The cost is that you agree to small things you do not want, then spend an evening undoing them. A shorter yes would save you most of the week.",
        ],
        [
          "what you hide",
          "Aquarius wants distance, cancer wants closeness, libra wants everyone to be fine. The three rarely agree on a plan. You solve it by keeping one life for ideas and another for home, and by not letting the two meet. It works, until a single person ends up belonging to both.",
        ],
        [
          "what you're building",
          "Keep the routines that look boring from outside. They are what lets the aquarius part go wandering without getting lost. Keep one person who knows both sides of you. And keep saying the late, odd idea out loud. Usually it turns out to be the one everyone uses next month.",
        ],
      ],
    },
    love: {
      title: "careful at the door, generous inside",
      sections: [
        [
          "how you give",
          "Venus at 14° pisces is the most generous placement in your chart. You love by noticing: the song someone hums, the tea they ordered once. You forgive early and sometimes too early. Pisces venus does not keep score, which is lovely, until you realise nobody else was counting your side either.",
        ],
        [
          "how you receive",
          "With the moon in cancer, love has to feel like home before it can feel like anything else. Fast and loud does not register as romance. Being remembered does. If someone is consistent for three months you will give them more than they asked for. If they are clever but unpredictable, you will drift.",
        ],
        [
          "what unsettles you",
          "Mars in gemini means you flirt by talking. Long messages, odd questions, a joke that runs for weeks. Arguments are fast and verbal and over quickly. The risk is talking around a feeling instead of naming it. Try one plain sentence with a feeling in it. It lands harder than a clever paragraph.",
        ],
        [
          "what steadies you",
          "Libra rising wants peace, so you smooth things that should be said. The aquarius sun then takes a step back to think, which reads as cold. Partners feel the gap and fill it with guesses. The fix is boring: say the small irritation on the day it happens, not at the end of the month.",
        ],
        [
          "what to ask for",
          "You stay with people who give you room and still turn up. Pick the friend who texts back late but always texts back. Pisces venus will make anyone sound magical in your head. The cancer moon is the better judge. Ask it one question: do I feel calmer after seeing them, or more alert?",
        ],
      ],
    },
    work: {
      title: "good at the plan, slower at the paperwork",
      sections: [
        [
          "how you work",
          "Mercury at 29° capricorn gives you a practical mind with a long view. You write short, plan in stages and distrust vague promises. Late-degree mercury tends to check the work once more than needed. That last check is usually where you find the mistake, so keep doing it, just set a time limit.",
        ],
        [
          "who you work well with",
          "You do best where the problem is bigger than any one person. Systems, communities, tools other people will use. You dislike hierarchy for its own sake and will quietly route around a manager who adds nothing. Choose places that let you build something and then leave it running without you.",
        ],
        [
          "what stalls you",
          "Saturn at 22° pisces is the strict teacher in a soft room. Structure does not come naturally around feelings, deadlines that depend on other people, or anything without edges. You learn discipline late but properly. Write the edges down: start time, end time, what done means. Saturn here respects lists.",
        ],
        [
          "what you're for",
          "Mars in gemini runs several projects at once and gets bored at seventy percent. Your best weeks have two tasks, not six. Talking a problem through helps more than staring at it. Find one colleague who lets you think aloud and then asks you, plainly, which of the six you are actually finishing.",
        ],
        [
          "what to build next",
          "Protect the mornings. The capricorn mercury does its best thinking before the messages arrive. Protect your name on the work you did, because the libra rising will happily share credit until it disappears. And protect one afternoon a week that has no meetings at all. That is where the aquarius ideas come from.",
        ],
      ],
    },
    luck: {
      title: "luck that arrives through other people",
      sections: [
        [
          "your lucky ground",
          "Jupiter at 11° sagittarius sits in its own sign, which astrologers read as luck that works without much effort. Yours comes through travel, teachers and strangers with strong opinions. It rarely knocks on the door at home. You have to go somewhere slightly unfamiliar for it to find you.",
        ],
        [
          "what opens doors",
          "Expect openings, not prizes. An introduction, a course that happens to have a free place, a city you visit for a weekend and keep thinking about. Sagittarius jupiter likes a yes said quickly. The aquarius sun will want to research it first. Do the research after you have said yes.",
        ],
        [
          "what wastes your energy",
          "Venus in pisces trines your cancer moon in the chart, a soft and easy link. Luck often arrives with kindness attached: someone helps because they like you, not because it pays. Say thank you properly, in writing. These people tend to come back with a second, bigger favour a year later.",
        ],
        [
          "this season",
          "Saturn in pisces asks whether you deserve the good thing before you take it. That pause costs you more chances than any bad transit. Libra rising adds a second pause to check nobody else wanted it. Notice both pauses. You do not need to remove them, only make them shorter.",
        ],
        [
          "your small ritual",
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
          "cách bạn bắt đầu",
          "Mặt trời của bạn ở 25° bảo bình, cuối cung, nơi ý tưởng đã hình thành và chỉ cần một căn phòng. Bạn nghĩ theo hệ thống và kế hoạch nhóm. Người khác thấy bạn bình tĩnh. Thật ra bạn đang nghĩ chuyện khác, và muốn nghĩ xong hơn là lịch sự khi bị cắt ngang.",
        ],
        [
          "cách bạn phản ứng",
          "Mặt trăng ở cự giải là phần mềm bên dưới lý thuyết. Bạn cần một chỗ cố định để quay về: cùng cái cốc, cùng cái ghế, cùng ba người. Khi chỗ đó lung lay, bạn im lặng trước khi tức giận. Hầu hết mọi người không thấy bước thứ hai, vì bạn đã rời đi trước.",
        ],
        [
          "cách bạn nghỉ ngơi",
          "Cung mọc thiên bình là gương mặt ở cửa. Lịch sự, cân bằng, hơi chậm khi nói không. Người lạ thấy bạn dễ gần. Cái giá là bạn đồng ý những việc nhỏ mình không muốn, rồi mất một buổi tối để gỡ ra. Một lời đồng ý ngắn hơn sẽ cứu bạn gần cả tuần.",
        ],
        [
          "điều bạn che giấu",
          "Bảo bình muốn khoảng cách, cự giải muốn gần gũi, thiên bình muốn mọi người đều ổn. Ba phần hiếm khi đồng ý. Bạn giải quyết bằng một đời sống cho ý tưởng, một đời sống cho nhà, và không để hai thứ gặp nhau. Cách này ổn, cho đến khi có một người thuộc về cả hai.",
        ],
        [
          "điều bạn đang xây dựng",
          "Giữ những thói quen trông nhàm chán từ bên ngoài. Chúng cho phần bảo bình đi lang thang mà không lạc. Giữ một người hiểu cả hai phía của bạn. Và cứ nói to ý tưởng muộn màng, kỳ lạ đó. Thường thì đó là ý mà tháng sau ai cũng dùng.",
        ],
      ],
    },
    love: {
      title: "cẩn thận ở cửa, rộng lượng bên trong",
      sections: [
        [
          "cách bạn cho đi",
          "Kim tinh ở 14° song ngư là vị trí rộng lượng nhất trong bản đồ của bạn. Bạn yêu bằng cách để ý: bài hát ai đó ngân nga, loại trà họ gọi một lần. Bạn tha thứ sớm, đôi khi quá sớm. Kim tinh song ngư không đếm điểm, điều đó đẹp, cho đến khi bạn nhận ra cũng chẳng ai đếm phần của bạn.",
        ],
        [
          "cách bạn đón nhận",
          "Với mặt trăng ở cự giải, tình yêu phải giống như nhà trước khi giống bất cứ điều gì khác. Nhanh và ồn không được tính là lãng mạn. Được nhớ đến thì có. Nếu ai đó đều đặn trong ba tháng, bạn sẽ cho họ nhiều hơn họ xin. Nếu họ thông minh nhưng thất thường, bạn sẽ trôi đi.",
        ],
        [
          "điều làm bạn chao đảo",
          "Hỏa tinh ở song tử nghĩa là bạn tán tỉnh bằng lời. Tin nhắn dài, câu hỏi lạ, một câu đùa kéo dài nhiều tuần. Cãi nhau nhanh, bằng lời, và qua nhanh. Rủi ro là nói vòng quanh một cảm xúc thay vì gọi tên nó. Thử một câu đơn giản có cảm xúc. Nó có sức nặng hơn một đoạn văn khéo.",
        ],
        [
          "điều giữ bạn vững",
          "Cung mọc thiên bình muốn yên ổn, nên bạn làm phẳng những điều đáng nói. Mặt trời bảo bình lùi lại để suy nghĩ, trông như lạnh lùng. Người kia cảm thấy khoảng trống và lấp bằng phỏng đoán. Cách sửa rất nhàm: nói điều khó chịu nhỏ ngay trong ngày, đừng để đến cuối tháng.",
        ],
        [
          "điều nên đề nghị",
          "Bạn ở lại với người cho bạn khoảng trống mà vẫn có mặt. Chọn người bạn nhắn lại muộn nhưng luôn nhắn lại. Kim tinh song ngư sẽ khiến ai cũng nghe như phép màu trong đầu bạn. Mặt trăng cự giải là giám khảo tốt hơn. Hỏi nó một câu: gặp họ xong mình bình tĩnh hơn hay cảnh giác hơn?",
        ],
      ],
    },
    work: {
      title: "giỏi lập kế hoạch, chậm hơn với giấy tờ",
      sections: [
        [
          "cách bạn làm việc",
          "Thủy tinh ở 29° ma kết cho bạn đầu óc thực tế với tầm nhìn dài. Bạn viết ngắn, lập kế hoạch theo từng giai đoạn và không tin lời hứa mơ hồ. Thủy tinh ở độ cuối thường kiểm tra lại thêm một lần. Lần đó thường là lúc bạn tìm ra lỗi, nên cứ làm, chỉ cần đặt giới hạn thời gian.",
        ],
        [
          "người bạn hợp tác tốt",
          "Bạn làm tốt nhất khi vấn đề lớn hơn bất kỳ một người nào. Hệ thống, cộng đồng, công cụ người khác sẽ dùng. Bạn không thích thứ bậc chỉ vì thứ bậc và sẽ lặng lẽ đi vòng qua người quản lý không đóng góp gì. Chọn nơi cho bạn xây một thứ rồi để nó tự chạy.",
        ],
        [
          "điều khiến bạn chững lại",
          "Thổ tinh ở 22° song ngư là người thầy nghiêm trong một căn phòng mềm. Kỷ luật không đến tự nhiên quanh cảm xúc, những hạn chót phụ thuộc người khác, hay bất cứ thứ gì không có ranh giới. Bạn học kỷ luật muộn nhưng chắc. Viết ranh giới ra: giờ bắt đầu, giờ kết thúc, thế nào là xong.",
        ],
        [
          "điều bạn sinh ra để làm",
          "Hỏa tinh ở song tử chạy nhiều dự án cùng lúc và chán khi đến bảy mươi phần trăm. Tuần tốt nhất của bạn có hai việc, không phải sáu. Nói ra vấn đề giúp nhiều hơn nhìn chằm chằm vào nó. Tìm một đồng nghiệp để bạn nghĩ thành tiếng, rồi hỏi thẳng bạn sẽ hoàn thành việc nào.",
        ],
        [
          "điều nên xây tiếp theo",
          "Bảo vệ buổi sáng. Thủy tinh ma kết nghĩ tốt nhất trước khi tin nhắn đến. Bảo vệ tên bạn trên việc bạn đã làm, vì cung mọc thiên bình sẵn sàng chia công cho đến khi nó biến mất. Và bảo vệ một buổi chiều mỗi tuần không có cuộc họp nào. Ý tưởng bảo bình đến từ đó.",
        ],
      ],
    },
    luck: {
      title: "may mắn đến qua người khác",
      sections: [
        [
          "mảnh đất may mắn của bạn",
          "Mộc tinh ở 11° nhân mã nằm trong cung của chính nó, thường được đọc là may mắn đến mà không cần nhiều công sức. May mắn của bạn đến qua đi xa, thầy cô và những người lạ có ý kiến mạnh. Nó hiếm khi gõ cửa nhà. Bạn phải đến một nơi hơi lạ để nó tìm thấy bạn.",
        ],
        [
          "điều mở ra cánh cửa",
          "Hãy chờ những cơ hội, không phải giải thưởng. Một lời giới thiệu, một khóa học còn chỗ trống, một thành phố bạn ghé cuối tuần rồi nhớ mãi. Mộc tinh nhân mã thích một lời đồng ý nhanh. Mặt trời bảo bình muốn tìm hiểu trước. Hãy tìm hiểu sau khi đã đồng ý.",
        ],
        [
          "điều làm hao năng lượng",
          "Kim tinh song ngư tam hợp mặt trăng cự giải trong bản đồ, một liên kết mềm và dễ. May mắn thường đến kèm sự tử tế: ai đó giúp vì họ quý bạn, không vì lợi. Hãy cảm ơn tử tế, bằng chữ viết. Những người này thường quay lại với một ân huệ lớn hơn một năm sau.",
        ],
        [
          "mùa này",
          "Thổ tinh song ngư hỏi bạn có xứng đáng với điều tốt trước khi nhận nó. Khoảng dừng đó làm bạn mất nhiều cơ hội hơn bất kỳ quá cảnh xấu nào. Cung mọc thiên bình thêm một khoảng dừng nữa để xem có ai khác muốn nó không. Để ý cả hai. Không cần bỏ, chỉ cần ngắn lại.",
        ],
        [
          "nghi thức nhỏ của bạn",
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
      "people are easier to talk to today, and so are you. say the thing you have been rehearsing.",
    pushing:
      "your patience runs short after lunch. write the reply, then wait an hour before sending.",
    protect: "your energy. say no to one thing before noon.",
  },
  vi: {
    summary: "một ngày yên tĩnh, thưởng cho việc làm xong một việc cho đàng hoàng.",
    working:
      "hôm nay mọi người dễ trò chuyện hơn, bạn cũng vậy. hãy nói điều bạn vẫn đang tập dượt.",
    pushing:
      "sau bữa trưa bạn dễ mất kiên nhẫn. hãy viết câu trả lời, rồi chờ một tiếng trước khi gửi.",
    protect: "năng lượng của bạn. hãy từ chối một việc trước buổi trưa.",
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
    protect: { transit: tr("saturn", "opposite", "sun", 3, "self", 3), text: x.protect },
    ritualId: "slow-evening",
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
  self: "mirror-inventory",
  love: "first-date-pulse",
  work: "clean-desk-scent",
  luck: "coin-and-note",
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

type RitualText = Pick<
  Ritual,
  "title" | "intention" | "timing" | "needs" | "steps" | "why" | "reason" | "noteFamily"
>;
const ritualText: Record<Lang, Record<string, RitualText>> = {
  en: {
    "three-breath-doorway": {
      title: "the three-breath doorway",
      intention: "walk into the day at your own pace.",
      timing: "before you leave home",
      needs: ["your scent"],
      steps: [
        "stand at your front door with your keys in your hand. don't open it yet.",
        "put one spray or dab on each wrist. rub nothing in.",
        "hold your wrists near your face and take three slow breaths. on the third, name one thing you will not rush today.",
        "open the door.",
      ],
      why: "a smell paired with an intention becomes a cue you can return to.",
      reason: "bergamot at the door, vetiver for the rest of the morning.",
      noteFamily: "bergamot, tea, vetiver",
    },
    "first-date-pulse": {
      title: "the first-date pulse",
      intention: "arrive as yourself, not as a performance.",
      timing: "thirty minutes before you leave",
      needs: ["a mirror", "your scent"],
      steps: [
        'write one word on your phone: "tonight i want to be ____."',
        "apply the scent once to each wrist and once to the side of your neck.",
        "look in the mirror and say the word out loud, once, at normal volume.",
        "put the phone away and leave without checking your outfit again.",
      ],
      why: "one word said out loud is easier to keep than a plan for the whole evening.",
      reason: "rose up close, sandalwood and musk once you sit down.",
      noteFamily: "rose, musk, sandalwood",
    },
    "clean-desk-scent": {
      title: "the clean-desk scent",
      intention: "start the work that matters first.",
      timing: "the first ten minutes of work",
      needs: ["a pen", "paper", "your scent"],
      steps: [
        "clear one surface the size of your notebook.",
        "write the single task that would make today a good day.",
        "dab the scent on one wrist and keep that wrist near the paper while you write.",
        "don't open messages until the task is underway.",
      ],
      why: "a small cleared space and one written task make the first decision for you.",
      reason: "lemon to begin, cedar to stay at the desk.",
      noteFamily: "rosemary, cedar, lemon",
    },
    "coin-and-note": {
      title: "the coin and the note",
      intention: "notice luck when it arrives.",
      timing: "a new moon or any quiet evening",
      needs: ["a coin", "paper", "a pen", "your scent"],
      steps: [
        "write one small thing you hope for this month, small enough to happen by accident.",
        "fold the paper around the coin.",
        "hold the scent at arm's length and spray the folded paper once. keep the coin dry.",
        "keep it in a bag or coat pocket for the month. each time you smell it, note one coincidence in your favour.",
      ],
      why: "the smell doesn't bring anything. it reminds you to look.",
      reason: "cardamom and amber, slow enough to last a month on paper.",
      noteFamily: "amber, cardamom, vanilla",
    },
    "mirror-inventory": {
      title: "the mirror inventory",
      intention: "see yourself before you edit yourself.",
      timing: "in the evening",
      needs: ["a mirror", "your scent"],
      steps: [
        "stand in front of a mirror without fixing anything.",
        "apply the scent to your wrists and collarbone.",
        "say three true things about today, out loud: one hard, one funny, one unfinished.",
        "turn off the light on your way out.",
      ],
      why: "saying the day plainly, once, lets you stop rehearsing it.",
      reason: "pepper and iris, honest at the top, steady underneath.",
      noteFamily: "iris, cedar, pink pepper",
    },
    "slow-evening": {
      title: "the slow evening",
      intention: "end the day on purpose.",
      timing: "after dinner",
      needs: ["a lamp or candle", "a glass of water", "your scent"],
      steps: [
        "dim the lights and put your phone in another room.",
        "apply the scent lightly to one wrist only.",
        "sit with the water and notice three things you can smell in the room, including the scent.",
        "finish the water, then turn off the lamp.",
      ],
      why: "a day with a clear edge is easier to leave behind.",
      reason: "tonka and vanilla, warm and close to the skin.",
      noteFamily: "vanilla, tonka, incense",
    },
  },
  vi: {
    "three-breath-doorway": {
      title: "ô cửa ba hơi thở",
      intention: "bước vào ngày mới theo nhịp của riêng bạn.",
      timing: "trước khi ra khỏi nhà",
      needs: ["mùi hương của bạn"],
      steps: [
        "đứng trước cửa nhà, chìa khóa trong tay. chưa mở cửa vội.",
        "xịt hoặc chấm một lần lên mỗi cổ tay. đừng chà xát.",
        "đưa cổ tay lại gần mặt và hít thở chậm ba lần. ở hơi thở thứ ba, gọi tên một điều hôm nay bạn sẽ không vội.",
        "mở cửa.",
      ],
      why: "một mùi hương gắn với một ý định sẽ thành tín hiệu để bạn quay lại.",
      reason: "cam bergamot ở cửa, cỏ vetiver cho cả buổi sáng.",
      noteFamily: "cam bergamot, trà, cỏ vetiver",
    },
    "first-date-pulse": {
      title: "nhịp hẹn đầu",
      intention: "đến như chính bạn, không phải một màn trình diễn.",
      timing: "ba mươi phút trước khi đi",
      needs: ["một chiếc gương", "mùi hương của bạn"],
      steps: [
        'viết một từ vào điện thoại: "tối nay tôi muốn là ____."',
        "dùng mùi hương một lần ở mỗi cổ tay và một lần ở bên cổ.",
        "nhìn vào gương và nói to từ đó, một lần, bằng giọng bình thường.",
        "cất điện thoại và ra khỏi nhà mà không kiểm tra lại trang phục.",
      ],
      why: "một từ nói thành tiếng dễ giữ hơn một kế hoạch cho cả buổi tối.",
      reason: "hoa hồng khi ở gần, đàn hương và xạ hương khi đã ngồi xuống.",
      noteFamily: "hoa hồng, xạ hương, đàn hương",
    },
    "clean-desk-scent": {
      title: "mùi hương bàn sạch",
      intention: "bắt đầu việc quan trọng nhất trước.",
      timing: "mười phút đầu tiên của buổi làm việc",
      needs: ["một cây bút", "giấy", "mùi hương của bạn"],
      steps: [
        "dọn một khoảng trống bằng cuốn sổ của bạn.",
        "viết ra một việc duy nhất khiến hôm nay là một ngày tốt.",
        "chấm mùi hương lên một cổ tay và để cổ tay đó gần tờ giấy khi bạn viết.",
        "đừng mở tin nhắn cho đến khi việc đó đã bắt đầu.",
      ],
      why: "một khoảng trống nhỏ và một việc được viết ra sẽ quyết định giúp bạn bước đầu tiên.",
      reason: "chanh để bắt đầu, tuyết tùng để ngồi lại với bàn làm việc.",
      noteFamily: "hương thảo, tuyết tùng, chanh",
    },
    "coin-and-note": {
      title: "đồng xu và mảnh giấy",
      intention: "nhận ra may mắn khi nó đến.",
      timing: "đêm trăng non hoặc bất kỳ buổi tối yên tĩnh nào",
      needs: ["một đồng xu", "giấy", "bút", "mùi hương của bạn"],
      steps: [
        "viết một điều nhỏ bạn mong trong tháng này, nhỏ đến mức có thể xảy ra tình cờ.",
        "gấp tờ giấy quanh đồng xu.",
        "cầm chai nước hoa xa tầm tay và xịt lên tờ giấy gấp một lần. giữ đồng xu khô.",
        "giữ nó trong túi xách hoặc túi áo suốt tháng. mỗi lần ngửi thấy, ghi lại một sự trùng hợp có lợi cho bạn.",
      ],
      why: "mùi hương không mang điều gì đến. nó chỉ nhắc bạn nhìn.",
      reason: "bạch đậu khấu và hổ phách, đủ chậm để lưu trên giấy cả tháng.",
      noteFamily: "hổ phách, bạch đậu khấu, vani",
    },
    "mirror-inventory": {
      title: "kiểm kê trước gương",
      intention: "nhìn thấy mình trước khi chỉnh sửa mình.",
      timing: "vào buổi tối",
      needs: ["một chiếc gương", "mùi hương của bạn"],
      steps: [
        "đứng trước gương mà không chỉnh sửa gì.",
        "dùng mùi hương ở cổ tay và xương quai xanh.",
        "nói to ba điều có thật về hôm nay: một điều khó, một điều buồn cười, một điều còn dang dở.",
        "tắt đèn khi bạn rời đi.",
      ],
      why: "nói thẳng về một ngày, một lần, để bạn thôi tập dượt nó.",
      reason: "tiêu và diên vĩ, thật thà lúc đầu, vững vàng bên dưới.",
      noteFamily: "diên vĩ, tuyết tùng, tiêu hồng",
    },
    "slow-evening": {
      title: "buổi tối chậm",
      intention: "kết thúc ngày một cách có chủ đích.",
      timing: "sau bữa tối",
      needs: ["một chiếc đèn hoặc nến", "một ly nước", "mùi hương của bạn"],
      steps: [
        "làm dịu ánh đèn và để điện thoại ở phòng khác.",
        "dùng mùi hương nhẹ ở một cổ tay.",
        "ngồi cùng ly nước và nhận ra ba mùi trong phòng, kể cả mùi hương bạn vừa dùng.",
        "uống hết ly nước, rồi tắt đèn.",
      ],
      why: "một ngày có ranh giới rõ ràng thì dễ khép lại hơn.",
      reason: "tonka và vani, ấm và gần da.",
      noteFamily: "vani, tonka, trầm hương",
    },
  },
};

const ritualMeta: Record<string, { theme: RitualTheme; durationMin: number }> = {
  "three-breath-doorway": { theme: "calm", durationMin: 2 },
  "first-date-pulse": { theme: "love", durationMin: 5 },
  "clean-desk-scent": { theme: "work", durationMin: 3 },
  "coin-and-note": { theme: "luck", durationMin: 7 },
  "mirror-inventory": { theme: "self", durationMin: 4 },
  "slow-evening": { theme: "evening", durationMin: 6 },
};
export const ritualIds = [...new Set([...Object.keys(ritualMeta), ...readingRitualIds])];
export const firstRitualOfTheme = (theme: RitualTheme): string =>
  ritualIds.find((id) => ritualFor(id, "en")?.theme === theme) ?? "slow-evening";
export const ritualThemes: RitualTheme[] = ["calm", "love", "work", "luck", "self", "evening"];

export function ritualFor(id: string, lang: Lang): Ritual | null {
  const readingRitual = readingRitualFor(id, lang);
  if (readingRitual) return readingRitual;
  const meta = ritualMeta[id];
  if (!meta) return null;
  const text = ritualText[lang][id];
  const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return { id, ...meta, ...text, title: capital(text.title), intention: capital(text.intention), timing: capital(text.timing), needs: text.needs.map(capital), steps: text.steps.map(capital), why: capital(text.why), reason: capital(text.reason) };
}
