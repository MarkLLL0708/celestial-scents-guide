import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Bookmark, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker, TimePicker, CitySearch, SectionHeader } from "@/components/scent/controls";
import { perfumeName } from "@/components/scent/catalogue-details";
import { useStore } from "@/data/context";
import { useLanguage } from "@/i18n/provider";
import * as api from "@/data/api";
import type { Ritual } from "@/data/types";
import { StateMessage } from "./shared";

export function CapsuleSave({ chartId, ritualId, ids }: { chartId: string; ritualId: string; ids: string[] }) {
  const { t } = useLanguage();
  const { user, notify } = useStore();
  const [busy,setBusy] = useState(false);
  const client = useQueryClient();
  return <div className="capsule-save">{user ? <Button variant="secondary" loading={busy} onClick={async () => {
    setBusy(true);
    try { await api.saveScentCapsule(chartId,ritualId,ids); await client.invalidateQueries({queryKey:["saved-capsules"]}); notify(t.capsuleSaved); }
    catch { notify(t.accountError,"error"); } finally { setBusy(false); }
  }}><Bookmark size={16}/>{t.saveCapsule}</Button> : <Button asChild variant="text"><Link to="/login">{t.capsuleGuest}</Link></Button>}</div>;
}
export function SavedCapsules() {
  const { t,lang } = useLanguage();
  const { user } = useStore();
  const q = useQuery({queryKey:["saved-capsules",lang,user],queryFn:()=>api.listSavedCapsules(lang),enabled:user});
  if (!user) return <Button asChild variant="text"><Link to="/login">{t.capsuleGuest}</Link></Button>;
  if (q.isError) return <StateMessage message={t.capsuleError} retry={()=>void q.refetch()}/>;
  if (q.isPending) return <p className="small muted">{t.loading}</p>;
  if (!q.data.length) return <p className="small muted">{t.noSavedCapsules}</p>;
  return <div className="stack">{q.data.map((r)=><div className="saved-capsule" key={r.id}><p className="label muted">{r.ritual?.title}</p><div className="stack-sm">{r.perfumes.map((p)=><Link key={p.id} to="/shop/$id" params={{id:p.id}} className="underlined">{perfumeName(p,lang)}</Link>)}</div><Button asChild variant="secondary"><Link to="/rituals/$id" params={{id:r.ritual_id}}>{t.beginRitual}</Link></Button></div>)}</div>;
}
export function RitualTracker({ ritual }: { ritual: Ritual }) {
  const { t } = useLanguage();
  const { user,notify } = useStore();
  const client = useQueryClient();
  const [local,setLocal] = useState(0);
  const [busy,setBusy] = useState(false);
  const q = useQuery({queryKey:["ritual-progress",ritual.id,user],queryFn:()=>api.ritualProgress(ritual.id),enabled:user});
  const done = user ? q.data ?? 0 : local;
  const update = async (n: number) => {
    if (!user) { setLocal(n); return; }
    setBusy(true);
    try { await api.setRitualProgress(ritual.id,n); client.setQueryData(["ritual-progress",ritual.id,user],n); await client.invalidateQueries({queryKey:["saved-rituals"]}); }
    catch { notify(t.accountError,"error"); } finally {setBusy(false);}
  };
  return <section className="ritual-tracker stack"><h2 className="label">{t.ritualProgress}</h2><p className="small muted">{t.progressCount.replace("{done}",String(done)).replace("{total}",String(ritual.steps.length))}</p>
    <div className="ritual-progress-steps">{ritual.steps.map((_,i)=><Button key={i} variant="secondary" size="icon" disabled={busy || i > done} aria-pressed={i < done} aria-label={t.stepDone.replace("{n}",String(i+1))} title={t.stepDone.replace("{n}",String(i+1))} onClick={()=>void update(i < done ? i : i+1)}>{i < done ? <Check size={18}/> : String(i+1)}</Button>)}</div>
    {done === ritual.steps.length && <p>{t.ritualComplete}</p>}{done > 0 && <Button variant="text" onClick={()=>void update(0)} disabled={busy}><RotateCcw size={16}/>{t.resetRitual}</Button>}
    {!user && <Link to="/login" className="small underlined">{t.ritualGuest}</Link>}
  </section>;
}
export function BirthSettings() {
  const { t } = useLanguage();
  const { profile,setProfile,prefs,setResult,notify } = useStore();
  const [open,setOpen] = useState(false);
  const [busy,setBusy] = useState(false);
  const client = useQueryClient();
  const valid = apiBirthValid(profile);
  return <section className="section stack"><SectionHeader>{t.birthDate} / {t.birthTime}</SectionHeader><p className="small muted">{t.birthLocal}</p><Button variant="secondary" onClick={()=>setOpen(!open)} aria-expanded={open}>{t.editBirth}</Button>
    {open && <div className="stack"><DatePicker profile={profile} onChange={setProfile} showError/><TimePicker profile={profile} onChange={setProfile}/><CitySearch value={profile.city} onSelect={(c)=>setProfile({...profile,city:c?.city??"",country:c?.country??"",lat:c?.lat,lon:c?.lon,timezone:c?.timezone,region:c?.region})}/><Button disabled={!valid} loading={busy} onClick={async()=>{
      setBusy(true);
      try {const chart=await api.computeChart(profile); const record=api.storeChart(profile.name || t.youTitle,chart,prefs);setResult({id:record.id,profile,chart,prefs,date:api.todayDate()});await client.invalidateQueries();setOpen(false);notify(t.saved);window.location.reload();}
      catch {notify(t.chartComputeError,"error");} finally {setBusy(false);}
    }}>{t.saveChanges}</Button></div>}
  </section>;
}
import { validateBirthDate } from "@/data/validation";
import type { BirthProfile } from "@/data/types";
const apiBirthValid = (p: BirthProfile) => validateBirthDate(p.day,p.month,p.year) === null && !!p.city && (p.hour === null || (p.hour >= 0 && p.hour <= 23 && (p.minute ?? 0) >= 0 && (p.minute ?? 0) <= 59));