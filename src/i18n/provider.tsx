import {createContext,useContext,useState,type ReactNode} from 'react';
import {en,type Dictionary,type TranslationKey} from './en';
import {vi} from './vi';
const Context=createContext<{lang:'en'|'vi';setLang:(l:'en'|'vi')=>void;t:Dictionary;word:(key:string)=>string}>({lang:'en',setLang:()=>{},t:en,word:k=>k});
export function LanguageProvider({children}:{children:ReactNode}){const [lang,setLanguage]=useState<'en'|'vi'>('en');const t=lang==='en'?en:vi;const setLang=(l:'en'|'vi')=>{setLanguage(l);document.documentElement.lang=l;};return <Context.Provider value={{lang,setLang,t,word:k=>t[k as TranslationKey]??k}}>{children}</Context.Provider>}
export const useLanguage=()=>useContext(Context);
