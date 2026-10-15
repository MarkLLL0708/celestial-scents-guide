import type { Body, Topic, Transit, Theme } from '@/data/types';
export const kinds = ['reading_section','today_block','trait_line','day_summary','ask_answer'] as const;
export type LibraryKind = typeof kinds[number];
export const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'] as const;
export const bodies: Body[] = ['sun','moon','mercury','venus','mars','jupiter','saturn'];
export const sections: Record<Topic, [string, Body | 'rising'][]> = {
 you: [['how_you_start','sun'],['how_you_react','mars'],['how_you_rest','moon'],['what_you_hide','rising'],['what_youre_building','saturn']],
 love: [['how_you_give','venus'],['how_you_receive','moon'],['what_unsettles_you','mars'],['what_steadies_you','saturn'],['what_to_ask_for','jupiter']],
 work: [['how_you_work','mercury'],['who_you_work_well_with','venus'],['what_stalls_you','saturn'],['what_youre_for','jupiter'],['what_to_build_next','mars']],
 luck: [['your_lucky_ground','jupiter'],['what_opens_doors','venus'],['what_wastes_your_energy','mars'],['this_season','jupiter'],['your_small_ritual','sun']],
};
export const themes: Theme[] = ['self','love','work','luck'];
export const dayKinds = ['easy','hard','intense','quiet'] as const;
export function listKeys(kind: LibraryKind): string[] {
 switch(kind) {
 case 'reading_section': return Object.entries(sections).flatMap(([topic, rows])=>rows.flatMap(([s,p])=>signs.map(sign=>`${topic}.${s}.${p}.${sign}`)));
 case 'trait_line': return ['sun','moon','rising','venus'].flatMap(p=>signs.map(s=>`${p}.${s}`));
 case 'today_block': return Object.entries({working:['conjunct','sextile','trine'],pushing:['conjunct','square','opposite'],protect:['conjunct','sextile','trine','square','opposite']}).flatMap(([r,as])=>bodies.flatMap(t=>as.flatMap(a=>bodies.map(n=>`${r}.${t}.${a}.${n}`))));
 case 'day_summary': return [...themes.flatMap(t=>dayKinds.filter(k=>k!=='quiet').map(k=>`${t}.${k}`)),'quiet'];
 case 'ask_answer': return themes.flatMap(t=>Array.from({length:16},(_,i)=>dayKinds.map(k=>`${t}-${String(i+1).padStart(2,'0')}.${k}`)).flat());
 }
}
export function validKey(kind: LibraryKind,key:string) { return listKeys(kind).includes(key) || (kind==='reading_section' && signs.some(s=>key===`you.what_you_hide.mercury.${s}`)); }
export function aspectKind(t?: Pick<Transit,'aspect'|'transiting'>): typeof dayKinds[number] {
 if(!t) return 'quiet';
 if(t.aspect==='trine'||t.aspect==='sextile'||(t.aspect==='conjunct'&&['venus','jupiter'].includes(t.transiting))) return 'easy';
 if(t.aspect==='square'||t.aspect==='opposite'||(t.aspect==='conjunct'&&['mars','saturn'].includes(t.transiting))) return 'hard';
 return 'intense';
}
