import {Button} from '@/components/ui/button';
import {useLanguage} from '@/i18n/provider';
import {Skeleton} from '@/components/scent/controls';
import type {ReactNode} from 'react';
export type PreviewSearch={state?:string;step?:number};
export const validatePreview=(s:Record<string,unknown>):PreviewSearch=>({state:typeof s.state==='string'&&s.state?s.state:undefined,step:Number(s.step)>0?Number(s.step):undefined});
export function StateMessage({message,retry,children}:{message:string;retry?:()=>void;children?:ReactNode}){const {t}=useLanguage();return <div className="state-message"><p>{message}</p>{retry&&<Button variant="text" onClick={retry}>{t.retry}</Button>}{children}</div>}
export function ProductSkeletons(){return <div className="products">{Array.from({length:4},(_,i)=><Skeleton product key={i}/>)}</div>}
export const metadata=(title:string,description:string)=>({meta:[{title:`${title} — Natal Notes`},{name:'description',content:description},{property:'og:title',content:`${title} — Natal Notes`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]});
