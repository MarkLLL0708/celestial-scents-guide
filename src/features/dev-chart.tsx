import { useId, useMemo, useState } from "react";
import { useLanguage } from "@/i18n/provider";
import { computeNatal, type NatalResult } from "@/lib/astro/chart";
import { aspectsBetween, aspectString } from "@/lib/astro/aspects";
import { BODIES, bodyLongitudes, signOf } from "@/lib/astro/placements";

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <div className="field dev-field">
      <label className="label muted" htmlFor={id}>
        {label}
      </label>
      <input id={id} className="input" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

const fmt = (n: number, d = 3) => n.toFixed(d);

export function DevChartPage() {
  const { t, word } = useLanguage();
  const [date, setDate] = useState("1992-02-14");
  const [time, setTime] = useState("08:30");
  const [lat, setLat] = useState("21.0285");
  const [lon, setLon] = useState("105.8542");
  const [zone, setZone] = useState("Asia/Bangkok");
  const [transitIso, setTransitIso] = useState("2026-10-14T12:00:00Z");

  const result = useMemo(() => {
    try {
      const [y, m, d] = date.split("-").map(Number);
      const [hh, mm] = time.trim() ? time.split(":").map(Number) : [NaN, NaN];
      const known = Number.isFinite(hh);
      const natal: NatalResult = computeNatal({
        year: y,
        month: m,
        day: d,
        hour: known ? hh : null,
        minute: known ? (Number.isFinite(mm) ? mm : 0) : null,
        lat: Number(lat),
        lon: Number(lon),
        timezone: zone.trim(),
      });
      const instant = new Date(transitIso);
      if (Number.isNaN(instant.getTime())) throw new Error("BAD_TRANSIT");
      const aspects = aspectsBetween(bodyLongitudes(instant), natal.longitudes, {
        skipNatal: natal.birthTimeKnown ? [] : ["moon"],
      });
      return { natal, instant, aspects };
    } catch {
      return null;
    }
  }, [date, time, lat, lon, zone, transitIso]);

  return (
    <div className="narrow stack dev-chart">
      <h1 className="xl">{t.devTitle}</h1>
      <p className="small muted">{t.devIntro}</p>
      <div className="dev-grid">
        <Field label={t.devDate} value={date} onChange={setDate} />
        <Field label={t.devTime} value={time} onChange={setTime} />
        <Field label={t.devLat} value={lat} onChange={setLat} />
        <Field label={t.devLon} value={lon} onChange={setLon} />
        <Field label={t.devZone} value={zone} onChange={setZone} />
        <Field label={t.devTransitUtc} value={transitIso} onChange={setTransitIso} />
      </div>

      {!result ? (
        <p className="field-error" role="alert">
          {t.devInvalid}
        </p>
      ) : (
        <>
          <dl className="dev-meta">
            <dt className="label muted">{t.devBirthUtc}</dt>
            <dd>{result.natal.utc.toISOString()}</dd>
            <dt className="label muted">{t.devInstant}</dt>
            <dd>{result.instant.toISOString()}</dd>
          </dl>
          <div className="dev-table-wrap">
            <table className="dev-table">
              <thead>
                <tr>
                  <th scope="col">{t.devBody}</th>
                  <th scope="col">{t.devLongitude}</th>
                  <th scope="col">{t.devSign}</th>
                  <th scope="col">{t.devDegree}</th>
                </tr>
              </thead>
              <tbody>
                {BODIES.map((b) => {
                  const l = result.natal.longitudes[b];
                  const s = signOf(l);
                  return (
                    <tr key={b}>
                      <th scope="row">{b}</th>
                      <td>{fmt(l)}</td>
                      <td>{word(s.sign)}</td>
                      <td>{fmt(s.degree, 2)}</td>
                    </tr>
                  );
                })}
                <tr>
                  <th scope="row">{t.devAscendant}</th>
                  {result.natal.ascendant === null ? (
                    <td colSpan={3}>{t.devNone}</td>
                  ) : (
                    <>
                      <td>{fmt(result.natal.ascendant)}</td>
                      <td>{word(signOf(result.natal.ascendant).sign)}</td>
                      <td>{fmt(signOf(result.natal.ascendant).degree, 2)}</td>
                    </>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
          {result.natal.moonAlternatives && (
            <p className="small muted">
              {t.moonEither
                .replace("{a}", word(result.natal.moonAlternatives[0]))
                .replace("{b}", word(result.natal.moonAlternatives[1]))}
            </p>
          )}
          <dl className="dev-meta">
            <dt className="label muted">{t.devElements}</dt>
            <dd>
              {Object.entries(result.natal.elements)
                .map(([k, v]) => `${k} ${v}`)
                .join(" · ")}
            </dd>
            <dt className="label muted">{t.devModalities}</dt>
            <dd>
              {Object.entries(result.natal.modalities)
                .map(([k, v]) => `${k} ${v}`)
                .join(" · ")}
            </dd>
          </dl>
          <h2 className="label section-heading">{t.devAspects}</h2>
          <div className="dev-table-wrap">
            <table className="dev-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">{t.devAspects}</th>
                  <th scope="col">{t.devOrb}</th>
                  <th scope="col">{t.devStrength}</th>
                  <th scope="col">{t.devTheme}</th>
                  <th scope="col">{t.devKind}</th>
                </tr>
              </thead>
              <tbody>
                {result.aspects.length === 0 ? (
                  <tr>
                    <td colSpan={6}>{t.devNone}</td>
                  </tr>
                ) : (
                  result.aspects.map((a, i) => (
                    <tr key={aspectString(a)}>
                      <td>{i + 1}</td>
                      <th scope="row">{aspectString(a)}</th>
                      <td>{fmt(a.orb, 2)}</td>
                      <td>{a.strength}</td>
                      <td>{a.theme}</td>
                      <td>{a.kind}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
