import {createFileRoute} from '@tanstack/react-router';
import {validatePreview,metadata} from '@/features/shared';
function Page(){return <div className="narrow"><p className="muted">…</p></div>}
export const Route=createFileRoute('/chart/new')({validateSearch:validatePreview,head:()=>metadata('read my chart','Tell us when and where you were born.'),component:Page});
