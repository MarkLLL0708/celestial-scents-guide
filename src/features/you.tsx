import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/provider";
import type { Dictionary } from "@/i18n/en";
import * as api from "@/data/api";
import { signs } from "@/lib/library/keys";
import type { Block, Chart, Planet } from "@/data/types";
import { Bottle } from "@/components/scent/artwork";
import { perfumeName } from "@/components/scent/catalogue-details";
import { glyphs, transitText, FeedbackRow } from "./chart-result";
import { StateMessage } from "./shared";
import { Skeleton } from "@/components/scent/controls";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const planetKey = (p: Planet) => `planet${cap(p)}` as keyof Dictionary;
const ORDER: Planet[] = ["rising", "sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];

/** Whole-sign house of a sign, counted from the rising sign; null without a birth time. */
export function wholeSignHouse(sign: string, rising: string | null): number | null {
  if (!rising) return null;
  const s = signs.indexOf(sign as (typeof signs)[number]);
  const r = signs.indexOf(rising as (typeof signs)[number]);
  if (s < 0 || r < 0) return null;
  return ((s - r + 12) % 12) + 1;
}

export function useYouChart() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => setId(api.currentChartId()), []);
  const q = useQuery({
    queryKey: ["chart", id],
    queryFn: () => { if (!id) throw new Error("No chart"); return api.getChartById(id); },
    enabled: !!id,
  });
  return { id, isDemo: id === api.DEMO_ID, ...q };
}

function SunMark({ sign }: { sign: string }) {
  const i = Math.max(0, signs.indexOf(sign as (typeof signs)[number]));
  return (
    <svg className="you-avatar" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="31" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
      {Array.from({ length: 12 }, (_, k) => {
        const a = (k / 12) * Math.PI * 2 - Math.PI / 2;
        const on = k === i;
        return (
          <circle
            key={k}
            cx={32 + Math.cos(a) * 22}
            cy={32 + Math.sin(a) * 22}
            r={on ? 3 : 1}
            fill="currentColor"
            opacity={on ? 1 : 0.5}
          />
        );
      })}
      <circle cx="32" cy="32" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="32" cy="32" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function YouHeader({ chart, name, handle }: { chart: Chart | null; name: string; handle?: string }) {
  const { t, word } = useLanguage();
  return (
    <header className="you-header">
      <SunMark sign={chart?.sun ?? "Aries"} />
      <div className="you-id">
        <h1 className="xl you-name">
          {name || t.youTitle.replace(".", "")}
          {handle && <span className="muted you-handle"> @{handle}</span>}
        </h1>
        {chart && (
          <p className="label you-big3">
            <span>☉ {word(chart.sun)}</span>
            <span>☽ {word(chart.moon)}</span>
            <span>↑ {chart.rising ? word(chart.rising) : "—"}</span>
          </p>
        )}
      </div>
    </header>
  );
}

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function TensionIcon({ kind }: { kind: "power" | "pressure" | "trouble" }) {
  return (
    <svg className="tension-icon" viewBox="0 0 20 20" aria-hidden="true">
      {kind === "power" && (
        <path d="M10 18V9M10 11C10 6 6 4 3 4c0 4 3 7 7 7Zm0-2c0-4 3-6 7-6 0 4-3 6-7 6Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      )}
      {kind === "pressure" && (
        <path d="M10 2c1 4 6 6 6 10a6 6 0 0 1-12 0c0-2 1-4 3-5 0 2 1 3 2 3 0-3-1-5 1-8Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      )}
      {kind === "trouble" && (
        <>
          <circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M4.8 4.8l10.4 10.4" stroke="currentColor" strokeWidth="1.2" />
        </>
      )}
    </svg>
  );
}

export function UpdatesPanel({ chartId }: { chartId: string }) {
  const { t, lang, word } = useLanguage();
  const [days, setDays] = useState<{ iso: string; d: Date; offset: number }[]>([]);
  const [date, setDate] = useState("");
  useEffect(() => {
    const now = new Date();
    const list = [-2, -1, 0, 1, 2].map((o) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + o);
      return { iso: iso(d), d, offset: o };
    });
    setDays(list);
    setDate(list[2].iso);
  }, []);
  const today = useQuery({
    queryKey: ["you-today", chartId, date, lang],
    queryFn: () => api.getToday(chartId, date, lang),
    enabled: !!date,
  });
  const ritual = useQuery({
    queryKey: ["ritual", today.data?.ritualId, lang],
    queryFn: () => { const ritualId = today.data?.ritualId; if (!ritualId) throw new Error("No ritual"); return api.getRitual(ritualId, lang); },
    enabled: !!today.data?.ritualId,
  });
  const chart = useQuery({ queryKey: ["chart", chartId], queryFn: () => api.getChartById(chartId) });
  const scent = useQuery({ queryKey: ["daily-scent", chartId, date, today.data?.ritualId, lang], queryFn: () => api.getCapsule(chartId, lang, today.data?.ritualId), enabled: !!today.data });
  const pick = scent.data?.[0];
  const weekday = new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-GB", { weekday: "short" });
  const rows: { kind: "power" | "pressure" | "trouble"; label: string; block: Block | null }[] = today.data
    ? [
        { kind: "power", label: t.youPower, block: today.data.working },
        { kind: "pressure", label: t.youPressure, block: today.data.pushing },
        { kind: "trouble", label: t.youTrouble, block: today.data.protect },
      ]
    : [];
  return (
    <div className="stack">
      <div className="day-strip" role="group" aria-label={t.youDays}>
        {days.map((d) => (
          <Button variant="text"
            key={d.iso}
            type="button"
            className="day-pill"
            aria-pressed={date === d.iso}
            onClick={() => setDate(d.iso)}
          >
            <span className="label">{d.offset === 0 ? t.youToday : weekday.format(d.d).toUpperCase()}</span>
            <span className={`day-num ${d.offset === 0 ? "day-today" : ""}`}>{d.d.getDate()}</span>
          </Button>
        ))}
      </div>
      {today.isError ? (
        <StateMessage message={t.youError} retry={() => today.refetch()} />
      ) : !today.data ? (
        <div className="stack" aria-busy="true">
          <Skeleton />
        </div>
      ) : (
        <article className="stack you-update">
          <h2 className="lg you-headline">{today.data.summary}</h2>
          {today.data.quiet ? (
            <p>{t.youQuietDay}</p>
          ) : (
            <ul className="tension-list">
              {rows
                .flatMap((r) => r.block ? [r as { kind: "power" | "pressure" | "trouble"; label: string; block: Block }] : [])
                .map((r) => (
                  <li key={r.kind} className="tension-row">
                    <TensionIcon kind={r.kind} />
                    <div className="stack-sm">
                      <p>
                         {r.label} <span className="underlined">{transitText(t, r.block.transit)}</span>
                      </p>
                       <p className="small muted">{r.block.text}</p>
                    </div>
                  </li>
                ))}
            </ul>
          )}
          {chart.data && <section className="daily-reading stack">
            <h3 className="label muted">{t.youDailyReading}</h3>
            {rows.flatMap((r) => r.block ? [r.block] : []).map((block) => <div className="stack-sm" key={transitText(t,block.transit)}>
              {api.interpretDaily(chart.data.chart, block.transit, lang).map((text,i) => <p key={i} className={i === 0 ? "small muted" : ""}>{text}</p>)}
            </div>)}
          </section>}
          {ritual.data && (
            <div className="you-ground">
              <p className="label muted">{t.dailyScent}</p>
              {pick && <div className="daily-pairing"><Bottle family={pick.perfume.scent_family} name={perfumeName(pick.perfume,lang)} /><div className="stack-sm"><h3 className="question">{perfumeName(pick.perfume,lang)}</h3><p>{t.dailyScentLine.replace("{perfume}",perfumeName(pick.perfume,lang)).replace("{ritual}",ritual.data.title).replace("{notes}",pick.perfume.heart_notes.slice(0,3).map(word).join(", "))}</p><p className="small muted">{pick.reason}</p></div></div>}
              {!pick && <p>{ritual.data.title}</p>}
              <Button asChild>
                <Link to="/rituals/$id" params={{ id: ritual.data.id }}>
                  {t.youSeeRitual}
                </Link>
              </Button>
            </div>
          )}
          <FeedbackRow />
        </article>
      )}
    </div>
  );
}

export function ChartGrid({ chart }: { chart: Chart }) {
  const { t, word, lang } = useLanguage();
  const [active, setActive] = useState<Planet>("sun");
  const rows = ORDER.flatMap((p) => {
    const sign = p === "rising" ? chart.rising : chart[p];
    if (!sign) return [];
    const degree = p === "rising" ? chart.details.rising?.degree : chart.details[p]?.degree;
    return [{ p, sign, degree, house: wholeSignHouse(sign, chart.rising) }];
  });
  const sel = rows.find((r) => r.p === active) ?? rows[0];
  return (
    <div className="stack">
      <div className="grid-frame">
        <span className="grid-side label muted" aria-hidden="true">
          {t.youSigns}
        </span>
        <table className="planet-grid">
          <thead className="sr-only">
            <tr>
              <th>{t.youSigns}</th>
              <th>{t.youPlanets}</th>
              <th>{t.youHouses}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.p} className={r.p === sel?.p ? "grid-active" : ""}>
                <td>{word(r.sign)}</td>
                <td>
                  <Button variant="text"
                    type="button"
                    className="label grid-planet"
                    aria-pressed={r.p === sel?.p}
                    onClick={() => setActive(r.p)}
                  >
                    <span aria-hidden="true">{glyphs[r.p]}</span> {t[planetKey(r.p)]}
                    {r.degree !== undefined && <span className="muted"> {Math.floor(r.degree)}°</span>}
                  </Button>
                </td>
                <td className="grid-house">{r.house ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <span className="grid-side grid-side-end label muted" aria-hidden="true">
          {t.youHouses}
        </span>
      </div>
      {sel && (
        <section className="placement-card stack" aria-live="polite">
          <h2 className="lg">{api.inspectPlacement(chart, sel.p, lang).title}</h2>
          {api.inspectPlacement(chart, sel.p, lang).paragraphs.map((p,i) => <p key={i} className={i === 2 ? "muted" : ""}>{p}</p>)}
        </section>
      )}
    </div>
  );
}
