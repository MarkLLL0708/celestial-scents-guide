import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  UnderlineInput,
  DatePicker,
  TimePicker,
  CitySearch,
  ProgressLabel,
} from "@/components/scent/controls";
import { useLanguage } from "@/i18n/provider";
import { useStore } from "@/data/context";
import { cityLabel } from "@/data/seed";
import { validateBirthDate } from "@/data/validation";
import type { BirthProfile, Prefs } from "@/data/types";

const TOTAL = 6;
export const clampStep = (step?: number) =>
  Math.min(TOTAL, Math.max(1, Math.floor(Number(step) || 1)));

export function timeIsValid(p: Pick<BirthProfile, "hour" | "minute">) {
  if (p.hour === null) return true;
  const m = p.minute ?? 0;
  return (
    Number.isInteger(p.hour) &&
    p.hour >= 0 &&
    p.hour <= 23 &&
    Number.isInteger(m) &&
    m >= 0 &&
    m <= 59
  );
}
export function stepIsValid(step: number, p: BirthProfile) {
  if (step === 1) return p.name.trim().length > 0;
  if (step === 2) return validateBirthDate(p.day, p.month, p.year) === null;
  if (step === 3) return timeIsValid(p);
  if (step === 4) return p.city.length > 0;
  return true;
}

function Chips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; text: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="stack answer-chips" role="group" aria-label={label}>
      <p className="label muted">{label}</p>
      <div className="chips">
        {options.map((o) => (
          <Button
            key={o.value}
            variant="secondary"
            size="sm"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.text}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function ChartFlow({ step: rawStep }: { step?: number }) {
  const step = clampStep(rawStep);
  const { t, word } = useLanguage();
  const { profile, setProfile, prefs, setPrefs } = useStore();
  const navigate = useNavigate();
  const [touched, setTouched] = useState<Record<number, boolean>>({});
  const [avoidText, setAvoidText] = useState(prefs.avoid.join(", "));
  const body = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const prompt = body.current?.querySelector<HTMLElement>(
      "[data-prompt], .answer-prompt, .label.muted",
    );
    if (prompt) {
      prompt.tabIndex = -1;
      prompt.focus({ preventScroll: true });
    }
  }, [step]);

  const go = (n: number) => navigate({ to: "/chart/new", search: { step: n }, resetScroll: false });
  const valid = stepIsValid(step, profile);
  const showError = !!touched[step];
  const touch = () => setTouched((v) => ({ ...v, [step]: true }));
  const updatePrefs = (p: Partial<Prefs>) => setPrefs({ ...prefs, ...p });

  const next = () => {
    if (!valid) {
      touch();
      return;
    }
    if (step === TOTAL) navigate({ to: "/chart/loading" });
    else go(step + 1);
  };

  const place = profile.region
    ? cityLabel({ city: profile.city, region: profile.region, country: profile.country })
    : profile.city;
  const time =
    profile.hour === null
      ? t.unknownTime
      : `${String(profile.hour).padStart(2, "0")}:${String(profile.minute ?? 0).padStart(2, "0")}`;
  const prefText = [
    prefs.avoid.join(", "),
    prefs.style && prefs.style !== "any" ? word(prefs.style) : "",
    prefs.budget !== "any" ? word(prefs.budget) : "",
  ]
    .filter(Boolean)
    .join(" · ");

  let content: ReactNode;
  if (step === 1)
    content = (
      <UnderlineInput
        answer
        label={t.nameQuestion}
        placeholder={t.firstName}
        value={profile.name}
        autoComplete="given-name"
        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        error={showError && !valid ? t.nameError : undefined}
      />
    );
  else if (step === 2)
    content = <DatePicker answer profile={profile} onChange={setProfile} showError={showError} />;
  else if (step === 3)
    content = (
      <>
        <TimePicker answer profile={profile} onChange={setProfile} />
        {showError && !valid && (
          <p className="field-error" role="alert">
            {t.timeError}
          </p>
        )}
      </>
    );
  else if (step === 4)
    content = (
      <CitySearch
        answer
        value={profile.city}
        onSelect={(c) =>
          setProfile({
            ...profile,
            city: c?.city ?? "",
            country: c?.country ?? "",
            region: c?.region,
            lat: c?.lat,
            lon: c?.lon,
            timezone: c?.timezone,
          })
        }
        error={showError && !valid ? t.cityError : undefined}
      />
    );
  else if (step === 5)
    content = (
      <div className="stack">
        <UnderlineInput
          answer
          label={t.preferencesQuestion}
          placeholder={t.avoidPlaceholder}
          value={avoidText}
          onChange={(e) => {
            setAvoidText(e.target.value);
            updatePrefs({
              avoid: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            });
          }}
        />
        <Chips
          label={t.style}
          value={prefs.style}
          onChange={(style) => updatePrefs({ style })}
          options={[
            { value: "feminine", text: t.feminine },
            { value: "masculine", text: t.masculine },
            { value: "unisex", text: t.unisex },
            { value: "any", text: t.noPreference },
          ]}
        />
        <Chips
          label={t.budget}
          value={prefs.budget}
          onChange={(budget) => updatePrefs({ budget })}
          options={(["any", "low", "mid", "high"] as const).map((v) => ({ value: v, text: t[v] }))}
        />
      </div>
    );
  else
    content = (
      <div className="stack">
        <p className="label muted" data-prompt>
          {t.review}
        </p>
        <dl className="review-rows">
          {(
            [
              [t.name, profile.name, 1],
              [t.birthDate, `${profile.day}/${profile.month}/${profile.year}`, 2],
              [t.birthTime, time, 3],
              [t.birthPlace, place, 4],
              [t.preferences, prefText || t.noPreference, 5],
            ] as const
          ).map(([label, value, target]) => (
            <div className="review-row" key={label}>
              <dt className="label muted">{label}</dt>
              <dd>{value}</dd>
              <Button variant="text" onClick={() => go(target)} aria-label={`${t.edit} ${label}`}>
                {t.edit}
              </Button>
            </div>
          ))}
        </dl>
      </div>
    );

  return (
    <div className="chart-step">
      <div className="chart-step-top">
        <Button
          variant="text"
          size="icon"
          aria-label={t.stepBack}
          onClick={() => (step === 1 ? void navigate({ to: "/" }) : go(step - 1))}
        >
          <ChevronLeft size={20} />
        </Button>
        <ProgressLabel step={step} />
        <span className="chart-step-spacer" aria-hidden="true" />
      </div>
      <div key={step} ref={body} className="chart-step-body" onBlur={touch}>
        {content}
      </div>
      <div className="chart-step-bottom">
        {[2, 3, 4].includes(step) && <p className="small muted chart-helper">{t.helperData}</p>}
        <Button onClick={next} disabled={!valid}>
          {step === TOTAL ? t.seeMatches : t.next}
        </Button>
        {step > 1 && (
          <Button variant="text" onClick={() => go(step - 1)}>
            {t.back}
          </Button>
        )}
      </div>
    </div>
  );
}
