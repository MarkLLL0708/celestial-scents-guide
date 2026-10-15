import type { LibraryKind } from './keys';
export const ranges: Record<LibraryKind,[number,number]> = {reading_section:[50,75],today_block:[25,45],trait_line:[3,7],day_summary:[6,16],ask_answer:[40,70]};
export function validateText(kind: LibraryKind, body: string): string[] {
 const flags:string[]=[]; const count=body.trim().split(/\s+/u).filter(Boolean).length; const [min,max]=ranges[kind];
 if(count<min||count>max) flags.push('word_count');
 if(/\b(perfume|fragrance|scent|buy|shop|price|money|pregnant|die|death|cure|disease|cosmic|universe|destiny|journey)\b/iu.test(body)||/(^|[^\p{L}])(nước hoa|mùi hương|mua|giá|tiền|mang thai|chết|bệnh|vũ trụ|định mệnh)(?=$|[^\p{L}])/iu.test(body)) flags.push('banned_word');
 if(/[!！]/u.test(body)) flags.push('exclamation');
 if(/\p{Extended_Pictographic}/u.test(body)) flags.push('emoji');
 if(body!==body.toLocaleLowerCase()) flags.push('uppercase');
 return flags;
}
