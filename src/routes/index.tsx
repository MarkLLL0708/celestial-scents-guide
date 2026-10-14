import {createFileRoute} from '@tanstack/react-router';
import {validatePreview,metadata} from '@/features/shared';
import {Landing} from '@/features/store-pages';
export const Route=createFileRoute('/')({validateSearch:validatePreview,head:()=>metadata('fragrance and your stars','Your birth date already picked a perfume.'),component:Page});
function Page(){const {state}=Route.useSearch();return <Landing state={state}/>}
