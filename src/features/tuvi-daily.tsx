import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/provider";
import { StateMessage } from "@/features/shared";
import { getPerfumes, safeGet } from "@/data/api";
import type { Perfume } from "@/data/types";
import type { TuviChart } from "@/lib/tuvi/types";
import { tuviElements } from "@/lib/tuvi/reading";
import { composeAsk, composeToday, type AskAnswer } from "@/lib/tuvi/daily";
import { balanceMatches, rankForBalance } from "@/lib/reading/balance";
import { lipLine, lipName, pairLine, pickLip } from "@/lib/lips";
import { TUVI_KEY } from "./tuvi";

type Status = { kind: "loading" } | { kind: "none" } | { kind: "error" } | { kind: "ready"; chart: TuviChart };
function useTuviChart(state?: string) {
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  useEffect(() => {
    if (state === "loading") return;
    if (state === "error") return setStatus({ kind: "error" });
    const raw = safeGet(TUVI_KEY);
    if (!raw || state === "empty") return setStatus({ kind: "none" });
    let alive = true;
    import("@/lib/tuvi/engine")
      .then(({ buildChart }) => alive && setStatus({ kind: "ready", chart: buildChart(JSON.parse(raw)) }))
      .catch(() => alive && setStatus({ kind: "error" }));
    getPerfumes().then((p) => alive && setPerfumes(p)).catch(() => {});
    return () => { alive = false; };
  }, [state]);
  return { status, perfumes };
}
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const smellsFor = (p: Perfume, e: ReturnType<typeof tuviElements>) => {
  const hit = balanceMatches(p, e);
  return { smells: hit.length ? hit : p.smell_words ?? [], matched: hit.length > 0 };
};
const pname = (p: Perfume, lang: "en" | "vi") => (lang === "vi" && p.name_vi ? p.name_vi : p.name);

function Gate({ status, title, children }: { status: Status; title: string; children: (c: TuviChart) => React.ReactNode }) {
  const { t } = useLanguage();
  if (status.kind === "loading") return <div className="page tuvi-page"><h1>{title}</h1><p className="muted" role="status">{t.tuviLoading}</p></div>;
  if (status.kind === "error") return <div className="page tuvi-page"><h1>{title}</h1><StateMessage message={t.tuviError}><Link to="/tu-vi">{t.tuviEdit}</Link></StateMessage></div>;
  if (status.kind === "none") return <div className="page tuvi-page"><h1>{title}</h1><StateMessage message={t.tvNeedChart}><Link to="/tu-vi">{t.readChart}</Link></StateMessage></div>;
  return <>{children(status.chart)}</>;
}

export function TuviTodayPage({ state }: { state?: string }) {
  const { t } = useLanguage();
  const { status, perfumes } = useTuviChart(state);
  return <Gate status={status} title={t.tvTodayTitle}>{(c) => <TodayView chart={c} perfumes={perfumes} />}</Gate>;
}
function TodayView({ chart, perfumes }: { chart: TuviChart; perfumes: Perfume[] }) {
  const { t, lang } = useLanguage();
  const date = today();
  const elements = useMemo(() => tuviElements(chart), [chart]);
  const plan = useMemo(() => composeToday(chart, date, lang, elements), [chart, date, lang, elements]);
  const ranked = useMemo(() => rankForBalance(perfumes, elements).slice(0, 3), [perfumes, elements]);
  const scent = ranked.length ? ranked[Number(date.slice(-2)) % ranked.length] : undefined;
  const lip = useMemo(() => pickLip(elements, date), [elements, date]);
  return (
    <div className="page tuvi-page">
      <p className="label muted">{t.tvTodayEyebrow}</p>
      <h1>{t.tvTodayTitle}</h1>
      <p className="muted">{t.tvTodayIntro}</p>
      <dl className="tuvi-facts">
        <div><dt>{t.tvDayGanZhi}</dt><dd>{plan.ganZhi}</dd></div>
        <div><dt>{t.tvDayPalace}</dt><dd>{plan.palace}{plan.stars ? ` · ${plan.stars}` : ""}</dd></div>
      </dl>
      <section className="tuvi-article">{plan.lines.map((l) => <p key={l}>{l}</p>)}</section>
      <section className="tuvi-balance" aria-labelledby="tv-day-scent">
        <h2 id="tv-day-scent">{t.tvDayScent}</h2>
        {scent && <p><Link to="/shop/$id" params={{ id: scent.id }}>{pname(scent, lang)}</Link><span className="muted"> — {(scent.smell_words ?? []).slice(0, 3).join(", ")}</span></p>}
        <h3>{t.tuviLip}</h3>
        <p><strong>{lipName(lip)}</strong></p>
        <p>{lipLine(lang, elements, lip)}</p>
        <h3>{t.tvDayRitual}</h3>
        <p>{plan.ritual.action}</p>
        <Link to="/rituals/$id" params={{ id: plan.ritual.id }} className="quiet-link">{t.tvOpenRitual}</Link>
      </section>
      <Link to="/tu-vi/la-so" className="quiet-link">{t.tvSeeChart}</Link>
    </div>
  );
}

export function TuviAskPage({ state }: { state?: string }) {
  const { t } = useLanguage();
  const { status, perfumes } = useTuviChart(state);
  return <Gate status={status} title={t.tvAskTitle}>{(c) => <AskView chart={c} perfumes={perfumes} />}</Gate>;
}
function AskView({ chart, perfumes }: { chart: TuviChart; perfumes: Perfume[] }) {
  const { t, lang } = useLanguage();
  const [q, setQ] = useState("");
  const [asked, setAsked] = useState("");
  const [error, setError] = useState("");
  const elements = useMemo(() => tuviElements(chart), [chart]);
  const answer: (AskAnswer & { scent?: Perfume }) | null = useMemo(() => {
    if (!asked) return null;
    const ranked = rankForBalance(perfumes, elements).slice(0, 3);
    const hash = [...asked].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 0);
    const scent = ranked.length ? ranked[hash % ranked.length] : undefined;
    const lip = pickLip(elements, asked);
    const name = scent ? pname(scent, lang) : "";
    const pair = scent ? pairLine(lang, elements, lip, name) : lipLine(lang, elements, lip);
    return { ...composeAsk(chart, asked, lang, new Date().getFullYear(), elements, scent ? { name, ...smellsFor(scent, elements) } : null, pair), scent };
  }, [asked, chart, elements, perfumes, lang]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return setError(t.tvAskEmpty);
    setError("");
    setAsked(q.trim());
  };
  const starters = [t.tvAskQ1, t.tvAskQ2, t.tvAskQ3, t.tvAskQ4];
  return (
    <div className="page tuvi-page">
      <p className="label muted">{t.tvAskEyebrow}</p>
      <h1>{t.tvAskTitle}</h1>
      <p className="muted">{t.tvAskIntro}</p>
      <div className="chips">
        {starters.map((s) => <Button key={s} variant="outline" type="button" onClick={() => { setQ(s); setAsked(s); setError(""); }}>{s}</Button>)}
      </div>
      <form className="tuvi-form" onSubmit={submit} noValidate>
        <label>{t.tvAskLabel}
          <textarea className="tuvi-input" rows={3} maxLength={300} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.tvAskPlaceholder} />
        </label>
        {error && <p role="alert" className="tuvi-error">{error}</p>}
        <Button type="submit">{t.tvAskSubmit}</Button>
      </form>
      {answer && (
        <section className="tuvi-article ask-paragraphs" aria-live="polite">
          <h2>{t.tvAskAnswer} · {answer.palace}</h2>
          {answer.paragraphs.map((p) => <p key={p}>{p}</p>)}
          {answer.scent && <Link to="/shop/$id" params={{ id: answer.scent.id }} className="quiet-link">{pname(answer.scent, lang)}</Link>}
          <Link to="/rituals/$id" params={{ id: answer.ritual.id }} className="quiet-link">{t.tvOpenRitual}</Link>
        </section>
      )}
    </div>
  );
}
