export type Surface = "hook" | "chartLine" | "answer";
export type Language = "en" | "vi";
export type ReadingOutput = { lines?: string[]; text?: string; headline?: string; body?: string; perfume?: string; ritual?: string };
export type Fixture = { id: number; surface: Surface; packet: Record<string, unknown>; target: Partial<Record<Language, ReadingOutput>> | null };
export const fixtures: Fixture[] = [
  {
    "id": 1,
    "surface": "hook",
    "packet": {
      "chart": {
        "sun": "Capricorn",
        "moon": "Capricorn",
        "rising": "Pisces"
      }
    },
    "target": {
      "en": {
        "lines": [
          "You plan tomorrow today",
          "Big feelings? You find a task",
          "You come off softer than you are"
        ]
      },
      "vi": {
        "lines": [
          "Mai làm gì thì hôm nay lên lịch xong rồi",
          "Buồn là cắm đầu vào việc",
          "Nhìn hiền vậy thôi, chứ không hiền đâu"
        ]
      }
    }
  },
  {
    "id": 2,
    "surface": "chartLine",
    "packet": {
      "placement": {
        "planet": "Venus",
        "sign": "Scorpio",
        "degree": 24
      }
    },
    "target": {
      "en": {
        "text": "You don't do casual. You'd rather get dumped than lied to, and yes, you test people."
      },
      "vi": {
        "text": "Yêu là yêu thật, không có kiểu cho vui. Thà bị bỏ còn hơn bị lừa, và ừ, hay thử lòng người ta lắm."
      }
    }
  },
  {
    "id": 3,
    "surface": "chartLine",
    "packet": {
      "placement": {
        "planet": "Mars",
        "sign": "Virgo",
        "degree": 2
      }
    },
    "target": {
      "en": {
        "text": "You get mad quietly, then go fix something. You're way harder on your own work than anyone else is."
      },
      "vi": {
        "text": "Giận thì im, rồi quay ra dọn dẹp cái gì đó. Với việc của mình thì khó tính hơn ai hết."
      }
    }
  },
  {
    "id": 4,
    "surface": "chartLine",
    "packet": {
      "placement": {
        "planet": "Mercury",
        "sign": "Capricorn",
        "degree": 20
      }
    },
    "target": {
      "en": {
        "text": "You think in lists and say way less than you know. You want a plan before you talk."
      },
      "vi": {
        "text": "Nghĩ gì cũng xếp thành danh sách, nói ra thì chỉ được một nửa. Phải có kế hoạch đã mới chịu mở miệng."
      }
    }
  },
  {
    "id": 5,
    "surface": "chartLine",
    "packet": {
      "placement": {
        "planet": "Jupiter",
        "sign": "Sagittarius",
        "degree": 4
      }
    },
    "target": {
      "en": {
        "text": "Stuff gets easier when you say yes to the thing that scares you a bit. You also overpromise, a lot."
      },
      "vi": {
        "text": "Cứ dám nhận cái việc làm mình hơi sợ là mọi thứ suôn sẻ hơn hẳn. Có điều hay hứa lố."
      }
    }
  },
  {
    "id": 6,
    "surface": "chartLine",
    "packet": {
      "placement": {
        "planet": "Saturn",
        "sign": "Pisces",
        "degree": 8
      }
    },
    "target": {
      "en": {
        "text": "You're strict about your own dreams. You shoot them down before anyone else gets the chance."
      },
      "vi": {
        "text": "Với giấc mơ của chính mình thì cực kỳ khắt khe. Chưa ai kịp chê đã tự chê trước rồi."
      }
    }
  },
  {
    "id": 7,
    "surface": "answer",
    "packet": {
      "chart": {
        "sun": "Capricorn",
        "moon": "Capricorn",
        "rising": "Pisces"
      },
      "question": "What does my Capricorn sun need this week",
      "category": "love",
      "transit": {
        "plain": "wanting and acting pull the same way"
      },
      "perfume": {
        "name": "Pencil Case",
        "smell_words": [
          "sharpened pencil",
          "dry cedar"
        ]
      },
      "ritual": "pause at a doorway for three slow breaths before speaking"
    },
    "target": {
      "en": {
        "headline": "Just say what you want.",
        "body": "You show love by being useful, so nobody ever asks what you want. That's partly on you. This week, wanting something and going for it finally line up. Say it before you start rehearsing. You don't need a speech, just one plain sentence and a pause. Then see who actually answers.",
        "perfume": "Wear Pencil Case. It smells like a sharpened pencil: dry, calm, exactly the mood you want.",
        "ritual": "Take three slow breaths at the door before you say it."
      },
      "vi": {
        "headline": "Muốn gì thì nói thẳng ra đi.",
        "body": "Thương ai là lo việc cho người ta, nên chẳng ai nghĩ tới chuyện hỏi xem mình muốn gì. Cái này cũng một phần tại mình thôi. Tuần này muốn và dám đang đi cùng một nhịp, nói ra sẽ dễ hơn mọi khi. Nói sớm đi, đừng ngồi tập dượt trong đầu nữa. Không cần diễn văn gì đâu, một câu thẳng thôi, nói xong cứ im một chút. Rồi xem ai trả lời cho ra hồn.",
        "perfume": "Xịt Pencil Case đi. Mùi giống bút chì mới gọt, khô và tỉnh, đúng cái cảm giác mình cần lúc mở miệng.",
        "ritual": "Đứng ở cửa, hít thở thật chậm ba hơi rồi hẵng nói."
      }
    }
  },
  {
    "id": 8,
    "surface": "hook",
    "packet": {
      "chart": {
        "sun": "Libra",
        "moon": "Taurus",
        "rising": "Capricorn"
      }
    },
    "target": null
  }
];
export const testModels = ["google/gemini-3.1-flash-lite", "google/gemini-3.8-flash", "google/gemini-4-argon"] as const;
