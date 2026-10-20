import type { Perfume } from "@/data/types";

/** Short personal reading: plain behaviour first, one candid cost, a grounded scent line. */
export interface PersonalReading { truth: string; cost: string; scent: string }
type Lang = "en" | "vi";
type Line = { truth: string; cost: string; why: string };

const lines: Record<string, Record<Lang, Line>> = {
  Aries: {
    en: { truth: "You start things before anyone else has finished talking. You would rather fix a mistake than wait for permission.", cost: "People sometimes feel run over when you move this fast.", why: "It wakes you up the way you already move." },
    vi: { truth: "Bạn bắt đầu làm khi người khác còn đang bàn. Bạn thà sửa sai còn hơn ngồi chờ được phép.", cost: "Đôi khi người bên cạnh thấy bị bỏ lại phía sau.", why: "Nó tỉnh táo giống cách bạn hành động." },
  },
  Taurus: {
    en: { truth: "You trust what you can touch, taste and keep. You pick a routine and protect it quietly.", cost: "You can stay in something long after it stopped feeling good.", why: "It feels steady, like something you would keep for years." },
    vi: { truth: "Bạn tin vào thứ mình chạm được, nếm được, giữ được. Bạn chọn một nếp sống và lặng lẽ giữ nó.", cost: "Bạn có thể ở lại một chỗ rất lâu sau khi nó hết dễ chịu.", why: "Nó vững vàng, như món đồ bạn giữ nhiều năm." },
  },
  Gemini: {
    en: { truth: "You keep three conversations going in your head at once. You learn fast and get bored faster.", cost: "People can feel you are half somewhere else.", why: "It changes as it sits on you, like your attention does." },
    vi: { truth: "Trong đầu bạn luôn có ba cuộc trò chuyện cùng lúc. Bạn học nhanh và chán còn nhanh hơn.", cost: "Người khác đôi khi thấy bạn chỉ có mặt một nửa.", why: "Nó đổi dần trên da, giống cách bạn đổi mối quan tâm." },
  },
  Cancer: {
    en: { truth: "You notice who is cold before they say it. You remember small things people told you months ago.", cost: "You hold on to hurt longer than you admit.", why: "It smells like being looked after, which you do for others." },
    vi: { truth: "Bạn nhận ra ai đang buồn trước khi họ nói. Bạn nhớ những chuyện nhỏ người ta kể từ mấy tháng trước.", cost: "Bạn giữ nỗi đau lâu hơn bạn chịu thừa nhận.", why: "Nó có mùi được chăm sóc, điều bạn vẫn làm cho người khác." },
  },
  Leo: {
    en: { truth: "You walk into a room and the room adjusts. You give generously and expect it to be noticed.", cost: "Being ignored hurts you more than being criticised.", why: "It stays warm and noticeable without shouting." },
    vi: { truth: "Bạn bước vào phòng và cả phòng tự điều chỉnh. Bạn cho đi hào phóng và mong được nhìn thấy.", cost: "Bị lơ đi làm bạn đau hơn bị chê.", why: "Nó ấm và dễ nhận ra mà không cần ồn ào." },
  },
  Virgo: {
    en: { truth: "You see the crooked picture frame first. You show love by fixing things for people.", cost: "You judge yourself harder than anyone else ever would.", why: "It feels clean and exact, the way you like things." },
    vi: { truth: "Bạn là người đầu tiên thấy khung tranh bị lệch. Bạn thể hiện tình cảm bằng cách sửa đồ giúp người khác.", cost: "Bạn khắt khe với chính mình hơn bất kỳ ai.", why: "Nó sạch và gọn, đúng kiểu bạn thích." },
  },
  Libra: {
    en: { truth: "You read a room and smooth it before anyone asks. You hate choosing when someone might lose.", cost: "You say yes to keep the peace and resent it later.", why: "It feels balanced, soft on one side and clear on the other." },
    vi: { truth: "Bạn đọc được không khí và làm dịu nó trước khi ai nhờ. Bạn ghét phải chọn khi có người sẽ thiệt.", cost: "Bạn gật đầu cho êm chuyện rồi sau đó bực bội.", why: "Nó cân bằng, một bên mềm, một bên trong trẻo." },
  },
  Scorpio: {
    en: { truth: "You watch people before you let them in. You can tell when someone is lying.", cost: "Once someone breaks your trust, you rarely give it back.", why: "It has a dark edge that people come closer to notice." },
    vi: { truth: "Bạn quan sát người ta rất lâu rồi mới cho lại gần. Bạn biết khi nào ai đó nói dối.", cost: "Ai làm mất lòng tin của bạn thì khó lấy lại.", why: "Nó có một góc tối khiến người ta phải lại gần mới nhận ra." },
  },
  Sagittarius: {
    en: { truth: "You book the trip first and plan it later. You say the true thing out loud.", cost: "Your honesty lands harder than you meant it to.", why: "It smells like somewhere you have not been yet." },
    vi: { truth: "Bạn đặt vé trước rồi mới lên kế hoạch. Bạn nói thẳng điều mình nghĩ.", cost: "Sự thẳng thắn của bạn đôi khi làm người khác đau hơn bạn muốn.", why: "Nó có mùi của một nơi bạn chưa từng tới." },
  },
  Capricorn: {
    en: { truth: "You keep working after everyone else has gone home. You trust results more than promises.", cost: "You forget to rest until your body makes you.", why: "It feels serious and well made, like your work." },
    vi: { truth: "Bạn vẫn làm việc khi mọi người đã về. Bạn tin kết quả hơn lời hứa.", cost: "Bạn quên nghỉ cho tới khi cơ thể bắt bạn dừng.", why: "Nó nghiêm túc và chỉn chu, giống công việc của bạn." },
  },
  Aquarius: {
    en: { truth: "You think about how things could work instead of how they do. You keep friends at a slight distance.", cost: "People who want closeness can feel shut out.", why: "It smells a little unexpected, which suits you." },
    vi: { truth: "Bạn nghĩ mọi thứ có thể vận hành ra sao thay vì đang vận hành thế nào. Bạn giữ bạn bè ở một khoảng cách nhỏ.", cost: "Người muốn gần gũi có thể thấy bị đẩy ra.", why: "Nó hơi bất ngờ, rất hợp với bạn." },
  },
  Pisces: {
    en: { truth: "You pick up other people's moods like a radio. You drift into daydreams in the middle of the day.", cost: "You lose track of what you want when others are loud.", why: "It feels soft and a bit hazy, like your daydreams." },
    vi: { truth: "Bạn bắt sóng tâm trạng người khác như một chiếc radio. Giữa ban ngày bạn vẫn hay mơ mộng.", cost: "Khi người khác ồn ào, bạn quên mất mình muốn gì.", why: "Nó mềm và hơi mơ hồ, giống những giấc mơ ban ngày của bạn." },
  },
};

const everyday: Record<string, Record<Lang, string>> = {
  Citrus: { en: "a peeled orange", vi: "vỏ cam vừa bóc" },
  Floral: { en: "fresh flowers on a kitchen table", vi: "bó hoa tươi trên bàn bếp" },
  Woody: { en: "a pencil just sharpened", vi: "cây bút chì vừa gọt" },
  Oriental: { en: "warm spices in a pan", vi: "gia vị ấm trong chảo" },
  Fresh: { en: "clean laundry", vi: "quần áo mới giặt" },
  Gourmand: { en: "a bakery in the morning", vi: "tiệm bánh buổi sáng" },
  Aromatic: { en: "herbs crushed between your fingers", vi: "lá thơm vò giữa ngón tay" },
  Musk: { en: "warm skin after a shower", vi: "làn da ấm sau khi tắm" },
  Leather: { en: "an old leather jacket", vi: "chiếc áo da cũ" },
  Green: { en: "cut grass after rain", vi: "cỏ vừa cắt sau mưa" },
};

/** Notes come only from the perfume itself; at most two are named. */
export function personalReading(sign: string, perfume: Perfume | null, lang: Lang, noteWord: (n: string) => string = (n) => n): PersonalReading {
  const l = (lines[sign] ?? lines.Libra)[lang];
  if (!perfume) return { truth: l.truth, cost: l.cost, scent: "" };
  const smell = everyday[perfume.scent_family]?.[lang] ?? (lang === "vi" ? "một căn phòng sạch" : "a clean room");
  const notes = [...perfume.top_notes, ...perfume.heart_notes, ...perfume.base_notes].slice(0, 2).map(noteWord);
  const first = lang === "vi"
    ? `Nó gợi mùi ${smell}${notes.length ? `, với ${notes.join(" và ")}` : ""}.`
    : `It smells like ${smell}${notes.length ? `, with ${notes.join(" and ")}` : ""}.`;
  return { truth: l.truth, cost: l.cost, scent: `${first} ${l.why}` };
}
