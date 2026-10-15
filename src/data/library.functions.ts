import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { createClient } from '@supabase/supabase-js';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { kinds,validKey } from '@/lib/library/keys';
import { validateText } from '@/lib/library/validation';
import type { Database } from '@/integrations/supabase/types';
const selection=z.object({kind:z.enum(kinds),keys:z.array(z.string()).max(1000),lang:z.enum(['en','vi'])}).strict();
export const approvedTexts=createServerFn({method:'GET'}).inputValidator(selection).handler(async({data})=>{
 const url=process.env['SUPABASE_URL']; const key=process.env['SUPABASE_PUBLISHABLE_KEY'];
 if(!url||!key) throw new Error('Cloud configuration missing');
 const client=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const headers=new Headers(init?.headers);if(key.startsWith('sb_')) headers.delete('Authorization');headers.set('apikey',key);return fetch(input,{...init,headers})}}});
 const {data:rows,error}=await client.from('text_library').select('key,body').eq('status','approved').eq('kind',data.kind).eq('lang',data.lang).in('key',data.keys);
 if(error) throw new Error(error.message); return rows;
});
export const libraryRows=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {data:admin}=await context.supabase.rpc('has_role',{user_id:context.userId,role:'admin'});if(!admin) throw new Error('Forbidden');
 const {data,error}=await context.supabase.from('text_library').select('*').order('key').limit(10000);if(error) throw new Error(error.message);
 const {data:state}=await context.supabase.from('library_generation_state').select('pause_reason').eq('id','library').maybeSingle();
 return {rows:data,pause:state?.pause_reason??null};
});
export const editLibrary=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.string().uuid(),body:z.string().max(10000),approve:z.boolean()}).strict()).handler(async({data,context})=>{
 const {data:admin}=await context.supabase.rpc('has_role',{user_id:context.userId,role:'admin'});if(!admin) throw new Error('Forbidden');
 const {data:row,error:readError}=await context.supabase.from('text_library').select('kind').eq('id',data.id).single();if(readError) throw new Error(readError.message);
 const kind=z.enum(kinds).parse(row.kind); const flags=validateText(kind,data.body);
 if(data.approve&&flags.length) throw new Error(`Cannot approve: ${flags.join(', ')}`);
 const {error}=await context.supabase.from('text_library').update({body:data.body,flags,status:data.approve?'approved':'draft',updated_at:new Date().toISOString()}).eq('id',data.id);if(error) throw new Error(error.message);return {flags};
});
export const deleteLibrary=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.string().uuid()}).strict()).handler(async({data,context})=>{
 const {data:admin}=await context.supabase.rpc('has_role',{user_id:context.userId,role:'admin'});if(!admin) throw new Error('Forbidden');
 const {error}=await context.supabase.from('text_library').delete().eq('id',data.id);if(error) throw new Error(error.message);return {ok:true};
});
export const resumeLibrary=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {data:admin}=await context.supabase.rpc('has_role',{user_id:context.userId,role:'admin'});if(!admin) throw new Error('Forbidden');
 const {error}=await context.supabase.from('library_generation_state').update({pause_reason:null}).eq('id','library');if(error) throw new Error(error.message);return {ok:true};
});
export const generateLibrary=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(selection.extend({keys:z.array(z.string()).min(1).max(8),regenerate:z.boolean().default(false)})).handler(async({data,context})=>{
 const {data:admin}=await context.supabase.rpc('has_role',{user_id:context.userId,role:'admin'});if(!admin) throw new Error('Forbidden');
 if(data.keys.some(k=>!validKey(data.kind,k))) throw new Error('Invalid library key');
 const {data:state}=await context.supabase.from('library_generation_state').select('pause_reason').eq('id','library').maybeSingle();if(state?.pause_reason) throw new Error(state.pause_reason);
 const {data:locked,error:lockError}=await context.supabase.rpc('acquire_library_generation');if(lockError) throw new Error(lockError.message);if(!locked) throw new Error('Generation already running or paused.');
 const key=process.env['LOVABLE_API_KEY'];if(!key) throw new Error('Lovable AI configuration missing');
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const {generateText,LIBRARY_MODEL}=await import('@/lib/library/generation.server');
 const signal=getRequest().signal;let generated=0,skipped=0;
 try {
  for(const k of data.keys) {
   if(signal.aborted) break;
   const {data:old,error:oldError}=await context.supabase.from('text_library').select('status').eq('kind',data.kind).eq('key',k).eq('lang',data.lang).maybeSingle();if(oldError) throw new Error(oldError.message);
   if(old&&!data.regenerate) {skipped++;continue;}
   let body=await generateText(key,data.kind,k,data.lang,signal);let flags=validateText(data.kind,body);
   if(flags.length) {await new Promise(r=>setTimeout(r,400)); body=await generateText(key,data.kind,k,data.lang,signal); flags=validateText(data.kind,body);}
   const {error}=await supabaseAdmin.from('text_library').upsert({kind:data.kind,key:k,lang:data.lang,body,flags,model:LIBRARY_MODEL,status:'draft',updated_at:new Date().toISOString()},{onConflict:'kind,key,lang'});if(error) throw new Error(error.message);generated++;
   if(data.keys.length>1) await new Promise(r=>setTimeout(r,400));
  }
  return {generated,skipped};
 } catch(error) {
  const e=error as {statusCode?:number;message?:string};
  if(e.statusCode===402||e.statusCode===403||e.statusCode===404||e.message?.includes('declined')) await supabaseAdmin.from('library_generation_state').update({pause_reason:e.message??'AI access paused'}).eq('id','library');
  if(signal.aborted) return {generated,skipped};
  throw new Error(e.message??'Text generation failed');
 } finally {await supabaseAdmin.from('library_generation_state').update({lease_until:null}).eq('id','library');}
});
