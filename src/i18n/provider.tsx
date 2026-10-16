import { useContext, useEffect, useState, type ReactNode } from "react";
import { en, type Dictionary, type TranslationKey } from "./en";
import { vi } from "./vi";
import { stableContext } from "@/lib/stable-context";
type Lang = "en" | "vi";
const LANG_KEY = "natal-notes:lang";
const Context = stableContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dictionary;
  word: (key: string) => string;
}>("NatalLanguage", { lang: "en", setLang: () => {}, t: en, word: (k) => k });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLanguage] = useState<Lang>("en");
  const t = lang === "en" ? en : vi;
  const apply = (l: Lang) => {
    setLanguage(l);
    document.documentElement.lang = l;
  };
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(LANG_KEY);
    } catch {
      /* storage blocked */
    }
    const device = navigator.language?.toLowerCase().startsWith("vi") ? "vi" : "en";
    const l: Lang = saved === "vi" || saved === "en" ? saved : device;
    if (l !== "en") apply(l);
  }, []);
  const setLang = (l: Lang) => {
    apply(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* storage blocked */
    }
  };
  return (
    <Context.Provider value={{ lang, setLang, t, word: (k) => t[k as TranslationKey] ?? t[k.toLowerCase() as TranslationKey] ?? k }}>
      {children}
    </Context.Provider>
  );
}
export const useLanguage = () => useContext(Context);
