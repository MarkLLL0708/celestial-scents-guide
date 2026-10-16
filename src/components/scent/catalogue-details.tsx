import { useLanguage } from "@/i18n/provider";
import type { Perfume } from "@/data/types";

export function perfumeName(p: Perfume, lang: "en" | "vi") { return lang === "vi" ? p.name_vi || p.name : p.name; }
export function PerfumePrice({ perfume }: { perfume: Perfume }) {
  const { t } = useLanguage();
  return <span>{perfume.details_pending ? t.detailsPending : `${perfume.price} ${perfume.currency} · ${perfume.size_ml} ml`}</span>;
}
export function PerfumeStory({ perfume }: { perfume: Perfume }) {
  const { lang, t } = useLanguage();
  const text = lang === "vi" ? perfume.story_vi : perfume.story_hook;
  return <>{text && <p className="perfume-story">{text.charAt(0).toUpperCase() + text.slice(1)}</p>}{perfume.review_note && <p className="small muted">{t.notesPending}</p>}</>;
}