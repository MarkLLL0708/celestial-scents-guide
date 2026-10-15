import { describe,it,expect } from 'vitest';
import { listKeys,validKey,aspectKind } from '@/lib/library/keys';
import { validateText } from '@/lib/library/validation';
describe('library rules',()=>{
 for(const [kind,n] of [['reading_section',240],['today_block',539],['trait_line',48],['day_summary',13],['ask_answer',256]] as const) it(`${kind} keys`,()=>expect(listKeys(kind)).toHaveLength(n));
 it('unknown rising uses mercury',()=>expect(validKey('reading_section','you.what_you_hide.mercury.Aquarius')).toBe(true));
 it('rejects unknown key',()=>expect(validKey('trait_line','name.private')).toBe(false));
 it('trait range 3–7',()=>{expect(validateText('trait_line','two words')).toContain('word_count');expect(validateText('trait_line','quietly keeps a spare key')).toEqual([])});
 it('rejects prohibited EN and VI',()=>{expect(validateText('trait_line','you buy another perfume')).toContain('banned_word');expect(validateText('trait_line','bạn mua một nước hoa')).toContain('banned_word')});
 it('rejects emoji and exclamation',()=>{expect(validateText('trait_line','quietly keeps a key!')).toContain('exclamation');expect(validateText('trait_line','quietly keeps a key 🌞')).toContain('emoji')});
 it('venus conjunction is easy',()=>expect(aspectKind({aspect:'conjunct',transiting:'venus'})).toBe('easy'));
 it('saturn conjunction is hard',()=>expect(aspectKind({aspect:'conjunct',transiting:'saturn'})).toBe('hard'));
 it('sun conjunction is intense',()=>expect(aspectKind({aspect:'conjunct',transiting:'sun'})).toBe('intense'));
});
