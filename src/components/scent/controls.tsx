import { useEffect, useId, useRef, useState, type InputHTMLAttributes } from "react";
import { Command } from "cmdk";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/provider";
import { cities, cityLabel } from "@/data/seed";
import { searchCities } from "@/data/api";
import type { CityHit } from "@/data/types";
import type { BirthProfile } from "@/data/types";
import { validateBirthDate } from "@/data/validation";
export function UnderlineInput({
  label,
  error,
  question = true,
  answer = false,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  question?: boolean;
  answer?: boolean;
}) {
  const id = useId();
  return (
    <div className={`field ${answer ? "answer-field" : ""}`}>
      <label className={answer ? "label muted" : question ? "question" : "label"} htmlFor={id}>
        {label}
      </label>
      <input
        {...props}
        id={id}
        className={`underline-input ${answer ? "answer-input" : ""}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
const ROW = 44;
/** One drum column: scroll-snap list with keyboard support; the centred row is the value. */
export function Wheel({
  label,
  values,
  value,
  onChange,
  format = (v) => String(v).padStart(2, "0"),
  disabled = false,
}: {
  label: string;
  values: number[];
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  disabled?: boolean;
}) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const index = Math.max(0, values.indexOf(value));
  useEffect(() => {
    const el = ref.current;
    if (el && Math.abs(el.scrollTop - index * ROW) > 2) el.scrollTop = index * ROW;
  }, [index]);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const pick = (i: number) => {
    const next = values[Math.min(values.length - 1, Math.max(0, i))];
    if (next !== undefined && next !== value) onChange(next);
  };
  return (
    <div className="wheel">
      <span className="label muted wheel-label" id={`${id}-label`}>
        {label}
      </span>
      <div className="wheel-window">
        <div className="wheel-highlight" aria-hidden="true" />
        <div
          ref={ref}
          className="wheel-scroll"
          role="listbox"
          tabIndex={disabled ? -1 : 0}
          aria-labelledby={`${id}-label`}
          aria-activedescendant={`${id}-${index}`}
          aria-disabled={disabled}
          onScroll={(e) => {
            const el = e.currentTarget;
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => pick(Math.round(el.scrollTop / ROW)), 90);
          }}
          onKeyDown={(e) => {
            const step: Record<string, number> = {
              ArrowUp: -1,
              ArrowDown: 1,
              PageUp: -5,
              PageDown: 5,
              Home: -values.length,
              End: values.length,
            };
            if (step[e.key] === undefined) return;
            e.preventDefault();
            pick(index + step[e.key]);
          }}
        >
          {values.map((v, i) => (
            <div
              key={v}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === index}
              className={`wheel-row ${i === index ? "wheel-row-active" : ""}`}
              onClick={() => !disabled && pick(i)}
            >
              {format(v)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const daysIn = (m: number, y: number) => new Date(y || 2000, m || 1, 0).getDate();
export function DatePicker({
  profile,
  onChange,
  showError = false,
  disabled = false,
  answer = false,
}: {
  profile: BirthProfile;
  onChange: (p: BirthProfile) => void;
  showError?: boolean;
  disabled?: boolean;
  answer?: boolean;
}) {
  const { t, lang } = useLanguage();
  const error = validateBirthDate(profile.day, profile.month, profile.year);
  const thisYear = new Date().getFullYear();
  const month = profile.month || 1;
  const year = profile.year || 1995;
  const day = Math.min(profile.day || 1, daysIn(month, year));
  useEffect(() => {
    if (!profile.day || !profile.month || !profile.year) onChange({ ...profile, day, month, year });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const set = (p: Partial<BirthProfile>) => {
    const next = { ...profile, day, month, year, ...p };
    next.day = Math.min(next.day, daysIn(next.month, next.year));
    onChange(next);
  };
  const monthName = (m: number) =>
    new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-GB", { month: "short" })
      .format(new Date(2000, m - 1, 1))
      .toUpperCase();
  return (
    <fieldset className={`stack ${answer ? "answer-fieldset" : ""}`} disabled={disabled}>
      <legend className={answer ? "label muted answer-prompt" : "question mb-6"}>
        {t.dateQuestion}
      </legend>
      <div className="wheels">
        <Wheel label={t.day} values={range(1, daysIn(month, year))} value={day} onChange={(v) => set({ day: v })} disabled={disabled} />
        <Wheel label={t.month} values={range(1, 12)} value={month} onChange={(v) => set({ month: v })} format={monthName} disabled={disabled} />
        <Wheel label={t.year} values={range(1900, thisYear)} value={year} onChange={(v) => set({ year: v })} format={String} disabled={disabled} />
      </div>
      {showError && error && (
        <p className="field-error" role="alert">
          {t[error]}
        </p>
      )}
    </fieldset>
  );
}
export function TimePicker({
  profile,
  onChange,
  disabled = false,
  answer = false,
}: {
  profile: BirthProfile;
  onChange: (p: BirthProfile) => void;
  disabled?: boolean;
  answer?: boolean;
}) {
  const { t } = useLanguage();
  const id = useId();
  const unknown = profile.hour === null;
  return (
    <fieldset className={`stack ${answer ? "answer-fieldset" : ""}`} disabled={disabled}>
      <legend className={answer ? "label muted answer-prompt" : "question mb-6"}>
        {t.timeQuestion}
      </legend>
      {!unknown && (
        <div className="wheels wheels-time">
          <Wheel label={t.hour} values={range(0, 23)} value={profile.hour ?? 12} onChange={(v) => onChange({ ...profile, hour: v, minute: profile.minute ?? 0 })} disabled={disabled} />
          <Wheel label={t.minute} values={range(0, 59)} value={profile.minute ?? 0} onChange={(v) => onChange({ ...profile, minute: v })} disabled={disabled} />
        </div>
      )}
      <label className="check-row" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={unknown}
          onChange={(e) =>
            onChange({
              ...profile,
              hour: e.target.checked ? null : 12,
              minute: e.target.checked ? null : 0,
            })
          }
        />
        {t.unknown}
      </label>
      {unknown && <p className="small muted">{t.unknownNote}</p>}
    </fieldset>
  );
}
export function CitySearch({
  value,
  onSelect,
  error,
  disabled = false,
  answer = false,
}: {
  value: string;
  onSelect: (city: CityHit | null) => void;
  error?: string;
  disabled?: boolean;
  answer?: boolean;
}) {
  const { t, lang } = useLanguage();
  const id = useId();
  const [query, setQuery] = useState(() => {
    const c = cities.find((c) => c.city === value);
    return c ? cityLabel(c) : value;
  });
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<CityHit[]>([]);
  useEffect(() => {
    if (!open || !query.trim()) {
      setResults([]);
      return;
    }
    let live = true;
    const timer = setTimeout(() => {
      void searchCities(query, lang).then((r) => {
        if (live) setResults(r);
      });
    }, 300);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [query, lang, open]);
  return (
    <div className={`field ${answer ? "answer-field" : ""}`}>
      <label className={answer ? "label muted answer-prompt" : "question"} htmlFor={id}>
        {t.cityQuestion}
      </label>
      <Command className={`city-command ${answer ? "answer-city" : ""}`} shouldFilter={false}>
        <Command.Input
          id={id}
          disabled={disabled}
          value={query}
          onValueChange={(q) => {
            setQuery(q);
            setOpen(true);
            onSelect(null);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t.city}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <Command.List>
          {open && query && (
            <>
              <Command.Empty>{t.noCities}</Command.Empty>
              {results.map((c) => (
                <Command.Item
                  key={`${c.city}-${c.lat}-${c.lon}`}
                  value={`${c.city}-${c.lat}-${c.lon}`}
                  onSelect={() => {
                    setQuery(cityLabel(c));
                    onSelect(c);
                    setOpen(false);
                  }}
                >
                  {cityLabel(c)}
                </Command.Item>
              ))}
            </>
          )}
        </Command.List>
      </Command>
      {open && query && (
        <span className="sr-only" role="status">
          {t.cityResults.replace("{count}", String(results.length))}
        </span>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
export function ProgressLabel({ step = 2 }: { step?: number }) {
  const { t } = useLanguage();
  return (
    <p className="label muted" aria-label={t.stepAria.replace("{step}", String(step))}>
      {String(step).padStart(2, "0")} / 06
    </p>
  );
}
export function LoadingLine() {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [letters, setLetters] = useState(0);
  const [reduced, setReduced] = useState(false);
  const messages = [t.loading1, t.loading2, t.loading3];
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    if (m.matches) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % 3);
      setLetters(0);
    }, 2000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => setLetters((n) => Math.min(n + 1, messages[index].length)), 35);
    return () => clearInterval(timer);
  }, [index, reduced, t]);
  return (
    <div className="loading-message">
      <p className="label" aria-hidden="true">
        {reduced ? messages[0] : messages[index].slice(0, letters)}
      </p>
      <span className="sr-only" aria-live="polite">
        {messages[reduced ? 0 : index]}
      </span>
    </div>
  );
}
export function PlacementBadge({
  label,
  sign,
  index = 0,
}: {
  label: string;
  sign: string | null;
  index?: number;
}) {
  const { word } = useLanguage();
  return (
    <div className="placement-badge">
      <p className="label muted">{label}</p>
      <p className="question">{sign ? word(sign) : "—"}</p>
      <svg className="placement-glyph" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        {index === 0 ? (
          <>
            <circle cx="20" cy="20" r="12" stroke="currentColor" />
            <circle cx="20" cy="20" r="3" fill="currentColor" />
          </>
        ) : index === 1 ? (
          <path d="M27 8A13 13 0 1 0 27 32A14 14 0 0 1 27 8Z" stroke="currentColor" />
        ) : (
          <path d="M7 28H33M7 23H13A8 8 0 1 1 27 23H33" stroke="currentColor" />
        )}
      </svg>
    </div>
  );
}
export function PlacementRow({
  label,
  value,
  explanation,
}: {
  label: string;
  value: string;
  explanation: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button
        variant="text"
        className="placement-expand"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="label">{label}</span>
        <span className="flex items-center gap-4">
          {value}
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </Button>
      {open && <p className="small muted py-4">{explanation}</p>}
    </div>
  );
}
export function ElementBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="element">
      <span className="label">{label}</span>
      <div
        className="meter-track"
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={`meter-fill meter-${value}`} />
      </div>
      <span className="small">{value}%</span>
    </div>
  );
}
export function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h2 className="label section-heading">{children}</h2>;
}
export function Skeleton({ product = false }: { product?: boolean }) {
  return (
    <div className="skeleton" aria-busy="true">
      {product && (
        <div className="skeleton-image">
          <div className="skeleton-line" />
        </div>
      )}
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-line" />
    </div>
  );
}
export function ReadingBlock({
  heading,
  text,
  state = "filled",
  onRetry,
}: {
  heading: string;
  text: string;
  state?: string;
  onRetry?: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="reading">
      <h3 className="label">{heading}</h3>
      {state === "loading" ? (
        <div className="mt-6">
          <Skeleton />
        </div>
      ) : state === "error" ? (
        <>
          <p className="field-error" role="alert">
            {t.readingError}
          </p>
          <Button variant="text" onClick={onRetry}>
            {t.retry}
          </Button>
        </>
      ) : (
        <p>{text}</p>
      )}
    </div>
  );
}
