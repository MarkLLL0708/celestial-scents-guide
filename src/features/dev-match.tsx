import { useEffect, useId, useMemo, useState } from "react";
import { useLanguage } from "@/i18n/provider";
import * as api from "@/data/api";
import { ritualIds } from "@/data/astro-mock";
import { ritualNotes, weekScore } from "@/lib/match/shelf";
import type { Exclusion } from "@/lib/match/filters";

const f1 = (n: number) => n.toFixed(1);
const f2 = (n: number) => n.toFixed(2);

export function DevMatchPage() {
  const { t, lang, word } = useLanguage();
  const pickerId = useId();
  const [chartId, setChartId] = useState(api.DEMO_ID);
  const [ritualId, setRitualId] = useState(ritualIds[0]);
  useEffect(() => setChartId(api.currentChartId()), []);
  const data = useMemo(() => {
    try {
      return api.getMatchDebug(chartId, ritualId, lang);
    } catch {
      return null;
    }
  }, [chartId, ritualId, lang]);

  const why = (x: Exclusion | null) =>
    !x
      ? "—"
      : x.kind === "soldOut"
        ? t.excludedSoldOut
        : x.kind === "avoid"
          ? t.excludedAvoid.replace("{term}", x.term)
          : x.kind === "style"
            ? t.excludedStyle
            : t.excludedBudget;

  return (
    <div className="narrow stack dev-chart">
      <h1 className="xl">{t.devMatchTitle}</h1>
      <p className="small muted">{t.devMatchIntro}</p>
      <div className="field dev-field">
        <label className="label muted" htmlFor={pickerId}>
          {t.devRitual}
        </label>
        <select
          id={pickerId}
          className="input"
          value={ritualId}
          onChange={(e) => setRitualId(e.target.value)}
        >
          {ritualIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>
      {!data ? (
        <p className="field-error" role="alert">
          {t.devInvalid}
        </p>
      ) : (
        <>
          <p className="small">
            {(["sun", "moon", "rising", "venus", "mars"] as const)
              .map((k) => `${k} ${data.chart[k] ? word(data.chart[k] ?? "") : "—"}`)
              .join(" · ")}
          </p>
          <p className="small muted">
            {t.devShadowTotal}:{" "}
            {(["sun", "moon", "rising", "venus", "mars"] as const)
              .map((k) => `${k} ${data.shadow[k] ? word(data.shadow[k] ?? "") : "—"}`)
              .join(" · ")}
          </p>
          <h2 className="label section-heading">{t.devShelf}</h2>
          <dl className="dev-meta">
            {(["forChart", "forWeek", "forShadow"] as const).map((k) => {
              const e = data.shelf[k];
              return (
                <div key={k}>
                  <dt className="label muted">{k}</dt>
                  <dd>
                    {e ? `${e.perfume.name} · ${f1(e.score)} · ${e.evidence}` : t.devNone}
                    {e && <span className="small muted block">{e.reason}</span>}
                  </dd>
                </div>
              );
            })}
          </dl>
          <div className="dev-table-wrap">
            <table className="dev-table">
              <thead>
                <tr>
                  <th scope="col">{t.devPerfume}</th>
                  <th scope="col">{t.devPlacement}</th>
                  <th scope="col">{t.devFamily}</th>
                  <th scope="col">{t.devNotes}</th>
                  <th scope="col">{t.devMood}</th>
                  <th scope="col">{t.devChartScore}</th>
                  <th scope="col">{t.devIntensity}</th>
                  <th scope="col">{t.devTotal}</th>
                  <th scope="col">{t.devWeek}</th>
                  <th scope="col">{t.devShadowTotal}</th>
                  <th scope="col">{t.devExcluded}</th>
                </tr>
              </thead>
              <tbody>
                {[...data.rows]
                  .sort((a, b) => b.breakdown.total - a.breakdown.total)
                  .map((r) => {
                    const week = weekScore(r.breakdown.total, ritualNotes(r.perfume, data.ritual).score);
                    return r.breakdown.placements.map((pl, i) => (
                      <tr key={`${r.perfume.id}-${pl.placement}`}>
                        {i === 0 && (
                          <th scope="row" rowSpan={r.breakdown.placements.length}>
                            {r.perfume.name}
                          </th>
                        )}
                        <td>
                          {pl.placement} ({pl.weight}) {pl.signs.map((s) => s.sign).join("/")}
                        </td>
                        <td>{pl.signs.map((s) => f2(s.familyScore)).join("/")}</td>
                        <td>{pl.signs.map((s) => f2(s.noteScore)).join("/")}</td>
                        <td>{pl.signs.map((s) => f2(s.moodScore)).join("/")}</td>
                        {i === 0 && (
                          <>
                            <td rowSpan={r.breakdown.placements.length}>{f1(r.breakdown.chartScore)}</td>
                            <td rowSpan={r.breakdown.placements.length}>{f1(r.breakdown.intensityBonus)}</td>
                            <td rowSpan={r.breakdown.placements.length}>{f1(r.breakdown.total)}</td>
                            <td rowSpan={r.breakdown.placements.length}>{f1(week)}</td>
                            <td rowSpan={r.breakdown.placements.length}>{f1(r.shadowTotal)}</td>
                            <td rowSpan={r.breakdown.placements.length}>{why(r.excluded)}</td>
                          </>
                        )}
                      </tr>
                    ));
                  })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
