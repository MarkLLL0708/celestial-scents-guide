import {createFileRoute} from '@tanstack/react-router';
import {validatePreview,metadata} from '@/features/shared';
function Page(){return <div className="narrow"><p className="muted">…</p></div>}
export const Route=createFileRoute('/chart/result/$id')({validateSearch:validatePreview,head:()=>metadata('your chart','Your chart and perfume matches.'),component:Page});
