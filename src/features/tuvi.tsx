import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/provider";
import { StateMessage } from "@/features/shared";
import { getPerfumes, safeGet, safeSet } from "@/data/api";
import type { Perfume } from "@/data/types";
import { PROVINCES } from "@/lib/tuvi/provinces";
import type { TuviChart, TuviInput, TuviPalace } from "@/lib/tuvi/types";
import { composeHooks, composeReading, TOPICS, tuviElements, type TopicKey } from "@/lib/tuvi/reading";
import { BRANCH_VI, BRIGHT_VI, BUREAU_VI, LINES, MUTAGEN_VI, PALACE, STAR_VI, STEM_VI } from "@/lib/tuvi/blocks";
import { rankForBalance } from "@/lib/reading/balance";
import { lipLine, lipName, pickLip } from "@/lib/lips";

const KEY = "natal-notes:tuvi";
const POS: Record<string, [number, number]> = {
  巳: [1, 1], 午: [1, 2], 未: [1, 3], 申: [1, 4], 辰: [2, 1], 酉: [2, 4],
  卯: [3, 1], 戌: [3, 4], 寅: [4, 1], 丑: [4, 2], 子: [4, 3], 亥: [4, 4],
};

export function TuviForm() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [f, setF] = useState<Omit<TuviInput, "lon">>({ name: "", gender: "female", date: "", time: "", province: "ha-noi" });
  const [error, setError] = useState("");
  useEffect(() => {
    const raw = safeGet(KEY);
    if (raw) try { const { lon: _lon, ...rest } = JSON.parse(raw) as TuviInput; setF(rest); } catch { /* ignore */ }
  }, []);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const p = PROVINCES.find((x) => x.id === f.province);
    if (!f.name.trim() || !f.date || !f.time || !p) return setError(t.tuviMissing);
    safeSet(KEY, JSON.stringify({ ...f, name: f.name.trim(), lon: p.lon }));
    navigate({ to: "/tu-vi/la-so" });
  };
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  return (
    <div className="page tuvi-page">
      <h1>{t.tuviTitle}</h1>
      <p className="muted">{t.tuviIntro}</p>
      <form className="tuvi-form" onSubmit={submit} noValidate>
        <label>{t.tuviName}<input className="tuvi-input" value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" /></label>
        <fieldset className="tuvi-gender">
          <legend>{t.tuviGender}</legend>
          {(["male", "female"] as const).map((g) => (
            <label key={g}><input type="radio" name="gender" checked={f.gender === g} onChange={() => set("gender", g)} />{g === "male" ? t.tuviMale : t.tuviFemale}</label>
          ))}
        </fieldset>
        <label>{t.tuviDate}<input className="tuvi-input" type="date" min="1900-01-01" max="2100-12-31" value={f.date} onChange={(e) => set("date", e.target.value)} /></label>
        <label>{t.tuviTime}<input className="tuvi-input" type="time" value={f.time} onChange={(e) => set("time", e.target.value)} /></label>
        <label>{t.tuviProvince}
          <select className="tuvi-input" value={f.province} onChange={(e) => set("province", e.target.value)}>
            {PROVINCES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        {error && <p role="alert" className="tuvi-error">{error}</p>}
        <Button type="submit">{t.tuviSubmit}</Button>
      </form>
    </div>
  );
}

type Status = { kind: "loading" } | { kind: "none" } | { kind: "error" } | { kind: "ready"; chart: TuviChart; year: number };

export function TuviChartPage({ state }: { state?: string }) {
  const { t, lang } = useLanguage();
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [topic, setTopic] = useState<TopicKey>("overview");
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  useEffect(() => {
    if (state === "loading") return;
    if (state === "error") return setStatus({ kind: "error" });
    const raw = safeGet(KEY);
    if (!raw || state === "empty") return setStatus({ kind: "none" });
    let alive = true;
    import("@/lib/tuvi/engine")
      .then(({ buildChart }) => { if (alive) setStatus({ kind: "ready", chart: buildChart(JSON.parse(raw)), year: new Date().getFullYear() }); })
      .catch(() => alive && setStatus({ kind: "error" }));
    getPerfumes().then((p) => alive && setPerfumes(p)).catch(() => {});
    return () => { alive = false; };
  }, [state]);

  if (status.kind === "loading") return <div className="page tuvi-page"><p className="muted" role="status">{t.tuviLoading}</p></div>;
  if (status.kind === "error") return <div className="page tuvi-page"><StateMessage message={t.tuviError}><Link to="/tu-vi">{t.tuviEdit}</Link></StateMessage></div>;
  if (status.kind === "none") return <div className="page tuvi-page"><StateMessage message={t.tuviNone}><Link to="/tu-vi">{t.tuviStart}</Link></StateMessage></div>;
  return <ChartView chart={status.chart} year={status.year} topic={topic} setTopic={setTopic} perfumes={perfumes} lang={lang} />;
}

function ChartView({ chart, year, topic, setTopic, perfumes, lang }: { chart: TuviChart; year: number; topic: TopicKey; setTopic: (k: TopicKey) => void; perfumes: Perfume[]; lang: "en" | "vi" }) {
  const { t } = useLanguage();
  const hooks = useMemo(() => composeHooks(chart, year), [chart, year]);
  const reading = useMemo(() => composeReading(chart, topic, year), [chart, topic, year]);
  const elements = useMemo(() => tuviElements(chart), [chart]);
  const picks = useMemo(() => rankForBalance(perfumes, elements).slice(0, 3), [perfumes, elements]);
  const lip = useMemo(() => pickLip(elements, chart.pillars + topic), [elements, chart.pillars, topic]);
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  const activePalace = TOPICS.find((x) => x.key === topic)!.palace;
  const pickPalace = (p: TuviPalace) => { const k = TOPICS.find((x) => x.palace === p.name)?.key; if (k) setTopic(k); };
  const p = PROVINCES.find((x) => x.id === chart.input.province);

  return (
    <div className="wide tuvi-page">
      <header className="tuvi-head">
        <h1>{chart.input.name}</h1>
        <dl className="tuvi-facts">
          <div><dt>{t.tuviDate}</dt><dd>{chart.input.date} · {chart.input.time} · {p?.name}</dd></div>
          <div><dt>{t.tuviSolar}</dt><dd>{chart.solar.date} {chart.solar.time} ({chart.solar.offset >= 0 ? "+" : ""}{chart.solar.offset}′)</dd></div>
          <div><dt>{t.tuviLunar}</dt><dd lang="zh">{chart.lunarDate}</dd></div>
          <div><dt>{t.tuviPillars}</dt><dd>{chart.pillars.split(" ").map((g) => `${STEM_VI[g[0]] ?? g[0]} ${BRANCH_VI[g[1]] ?? g[1]}`).join(" · ")}</dd></div>
          <div><dt>{t.tuviBureau}</dt><dd>{BUREAU_VI[chart.bureau] ?? chart.bureau}</dd></div>
        </dl>
        <Link to="/tu-vi" className="quiet-link">{t.tuviEdit}</Link>
      </header>

      <section className="tuvi-hooks" aria-labelledby="tuvi-hooks-h">
        <h2 id="tuvi-hooks-h">{t.tuviHooks}</h2>
        <p lang="vi">{LINES.decadeQ(hooks.decade.year, hooks.decade.age, hooks.decade.past)}</p>
        {hooks.decade.past && (
          <div className="tuvi-yesno">
            <Button variant={answer === "yes" ? "default" : "outline"} aria-pressed={answer === "yes"} onClick={() => setAnswer("yes")}>{t.tuviYes}</Button>
            <Button variant={answer === "no" ? "default" : "outline"} aria-pressed={answer === "no"} onClick={() => setAnswer("no")}>{t.tuviNo}</Button>
          </div>
        )}
        {answer && <p lang="vi" aria-live="polite">{answer === "yes" ? LINES.decadeYes(hooks.decade.palace, hooks.decade.domain) : LINES.decadeNo(hooks.decade.domain)}</p>}
        <p lang="vi">{hooks.contradiction}</p>
        <p lang="vi">{LINES.yearLine(hooks.yearPalace.year, hooks.yearPalace.ganZhi, hooks.yearPalace.palace, hooks.yearPalace.domain)}</p>
      </section>

      <section aria-label={t.tuviPalaceGrid} className="tuvi-grid">
        {chart.palaces.map((pl) => {
          const [r, c] = POS[pl.branch];
          return (
            <button key={pl.branch} type="button" className="tuvi-cell" data-active={pl.name === activePalace || undefined} style={{ gridRow: r, gridColumn: c }} onClick={() => pickPalace(pl)} aria-pressed={pl.name === activePalace}>
              <span className="tuvi-major">
                {pl.major.length ? pl.major.map((s) => (
                  <span key={s.name}>{STAR_VI[s.name]}{s.brightness && <small> {BRIGHT_VI[s.brightness]}</small>}{s.mutagen && <em> {MUTAGEN_VI[s.mutagen]}</em>}</span>
                )) : <span className="muted">VCD</span>}
              </span>
              <span className="tuvi-minor">{pl.minor.map((s) => STAR_VI[s.name] ?? s.name).join(" · ")}</span>
              <span className="tuvi-foot">
                <strong>{PALACE[pl.name]?.vi}{pl.isBody ? ` · ${t.tuviBody}` : ""}</strong>
                <span>{STEM_VI[pl.stem]} {BRANCH_VI[pl.branch]} · {pl.decade[0]}–{pl.decade[1]}</span>
              </span>
            </button>
          );
        })}
        <div className="tuvi-center" style={{ gridRow: "2 / 4", gridColumn: "2 / 4" }}>
          <strong>{chart.input.name}</strong>
          <span>{chart.input.gender === "male" ? t.tuviMale : t.tuviFemale}</span>
          <span>{BUREAU_VI[chart.bureau]}</span>
          <span>{chart.pillars.split(" ").map((g) => `${STEM_VI[g[0]]} ${BRANCH_VI[g[1]]}`).join(" · ")}</span>
        </div>
      </section>

      <section className="tuvi-reading">
        <h2 className="sr-only">{t.tuviTopics}</h2>
        {lang === "en" && <p className="muted">{t.tuviViOnly}</p>}
        <div role="tablist" aria-label={t.tuviTopics} className="tuvi-tabs">
          {TOPICS.map((x) => (
            <button key={x.key} role="tab" type="button" aria-selected={topic === x.key} onClick={() => setTopic(x.key)} lang="vi">{x.label}</button>
          ))}
        </div>
        <article role="tabpanel" lang="vi" className="tuvi-article">
          <h3>{TOPICS.find((x) => x.key === topic)!.label}</h3>
          <p><strong>{reading.diagHead}.</strong> {reading.diag}</p>
          <p><strong>{reading.adviceHead}.</strong> {reading.advice}</p>
          <h4>{t.tuviVerdict}</h4>
          <blockquote className="tuvi-verdict">{reading.verdict}</blockquote>
          <details>
            <summary>{t.tuviCore}</summary>
            <ul>{reading.core.map((l) => <li key={l}>{l}</li>)}</ul>
          </details>
          <details>
            <summary>{t.tuviRules}</summary>
            <ul>{reading.rules.map((l) => <li key={l}>{l}</li>)}</ul>
          </details>
          <details>
            <summary>{t.tuviGlossary}</summary>
            <dl className="tuvi-gloss">{reading.glossary.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </details>
        </article>
      </section>

      <section className="tuvi-balance" aria-labelledby="tuvi-bal-h">
        <h2 id="tuvi-bal-h">{t.tuviBalance}</h2>
        <p className="muted">{t.tuviBalanceLine}</p>
        <h3>{t.tuviPerfumes}</h3>
        <ul className="tuvi-picks">
          {picks.map((pf) => (
            <li key={pf.id}>
              <Link to="/shop/$id" params={{ id: pf.id }}>{lang === "vi" && pf.name_vi ? pf.name_vi : pf.name}</Link>
              <span className="muted"> — {[...pf.top_notes, ...pf.heart_notes].slice(0, 3).join(", ")}</span>
            </li>
          ))}
        </ul>
        <h3>{t.tuviLip}</h3>
        <p><strong>{lipName(lip)}</strong></p>
        <p>{lipLine(lang, elements, lip)}</p>
      </section>
    </div>
  );
}
