import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import * as Accordion from "@radix-ui/react-accordion";
import { ArrowRight, ChevronDown, ChevronLeft, ThumbsUp, ThumbsDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/provider";
import type { Dictionary } from "@/i18n/en";
import { useStore } from "@/data/context";
import * as api from "@/data/api";
import { demoChart } from "@/data/seed";
import { ritualForTheme, themeForTopic, topics } from "@/data/astro-mock";
import type { Aspect, Chart, Planet, Theme, Topic, Transit } from "@/data/types";
import { PlacementBadge, PlacementRow, ElementBar, Skeleton } from "@/components/scent/controls";
import { Orb, OrbitDiagram, NoteIcon, CellGrid, Cell, type NoteName } from "@/components/scent/cosmos";
import { StateMessage } from "./shared";

export const glyphs: Record<Planet, string> = {
  sun: "☉",
  moon: "☽",
  rising: "↑",
  venus: "♀",
  mars: "♂",
  mercury: "☿",
  jupiter: "♃",
  saturn: "♄",
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const planetKey = (p: Planet) => `planet${cap(p)}` as keyof Dictionary;
const aspectKey = (a: Aspect) => `aspect${cap(a)}` as keyof Dictionary;
const topicKey = (x: Topic) => `topic${cap(x)}` as keyof Dictionary;

export function transitText(t: Dictionary, x: Transit) {
  return t.transitFormat
    .replace("{a}", t[planetKey(x.transiting)])
    .replace("{aspect}", t[aspectKey(x.aspect)])
    .replace("{b}", t[planetKey(x.natal)]);
}

function HandleLine({ chart }: { chart: Chart }) {
  const { word } = useLanguage();
  return (
    <p className="label">
      ☉ {word(chart.sun)} ☽ {word(chart.moon)} ↑ {chart.rising ? word(chart.rising) : "—"}
    </p>
  );
}

export function FeedbackRow({ thanks }: { thanks?: string }) {
  const { t } = useLanguage();
  const { notify } = useStore();
  const [choice, setChoice] = useState<"up" | "down" | null>(null);
  const pick = (v: "up" | "down") => {
    setChoice(v);
    notify(thanks ?? t.feedbackThanks);
  };
  return (
    <div className="feedback-row">
      <span className="label">{t.feedbackQuestion}</span>
      <div className="feedback-buttons">
        <Button
          variant="text"
          size="icon"
          aria-label={t.good}
          aria-pressed={choice === "up"}
          onClick={() => pick("up")}
        >
          <ThumbsUp size={18} fill={choice === "up" ? "currentColor" : "none"} />
        </Button>
        <Button
          variant="text"
          size="icon"
          aria-label={t.notGood}
          aria-pressed={choice === "down"}
          onClick={() => pick("down")}
        >
          <ThumbsDown size={18} fill={choice === "down" ? "currentColor" : "none"} />
        </Button>
      </div>
    </div>
  );
}

function Disclaimer() {
  const { t } = useLanguage();
  return <p className="small muted italic disclaimer-line">{t.tendencies}</p>;
}

/* ---------- reveal ---------- */
export function RevealPage({ state = "" }: { state?: string }) {
  const { t } = useLanguage();
  const { profile } = useStore();
  const [forced, setForced] = useState(state);
  useEffect(() => setForced(state), [state]);
  const unknownTime = profile.hour === null || forced === "unknown-time";
  const chart = { ...demoChart, rising: unknownTime ? null : demoChart.rising };

  if (forced === "loading")
    return (
      <div className="chart-loading">
        <Orb variant="sun" size="lg" />
        <div className="w-full max-w-xs">
          <Skeleton />
        </div>
      </div>
    );
  if (forced === "error")
    return (
      <div className="chart-loading">
        <Orb variant="disc" size="md" />
        <StateMessage message={t.revealError} retry={() => setForced("")} />
      </div>
    );

  return (
    <div className="reveal-screen">
      <div className="reveal-top">
        <Orb variant="sun" size="lg" />
        <HandleLine chart={chart} />
        <div className="reveal-traits">
          <p>{t.trait1}</p>
          <p>{t.trait2}</p>
          <p>{t.trait3}</p>
        </div>
        {unknownTime && <p className="label muted">{t.noRising}</p>}
        <p className="label muted reveal-caption">{t.revealCaption}</p>
      </div>
      <div className="reveal-bottom">
        <Button asChild>
          <Link to="/chart/result/$id" params={{ id: "demo" }}>
            {t.continue}
          </Link>
        </Button>
        <Button asChild variant="text">
          <Link to="/chart/new" search={{ step: 1, state: "" }}>
            {t.back}
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* ---------- your sky ---------- */
export function ResultPage({ id, state = "" }: { id: string; state?: string }) {
  const { t, word } = useLanguage();
  const { profile } = useStore();
  const q = useQuery({ queryKey: ["chart", id], queryFn: () => api.getChartById(id) });
  const [forced, setForced] = useState(state);
  useEffect(() => setForced(state), [state]);

  if (forced === "loading" || (!forced && q.isPending))
    return (
      <div className="narrow stack">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  if (forced === "error" || (!forced && q.isError))
    return (
      <div className="narrow">
        <StateMessage
          message={t.skyError}
          retry={() => {
            setForced("");
            void q.refetch();
          }}
        />
      </div>
    );
  const record = q.data ?? { id, name: "An", chart: demoChart };
  const unknownTime = forced === "unknown-time" || profile.hour === null;
  const chart = { ...record.chart, rising: unknownTime ? null : record.chart.rising };
  const deg = (p: Planet) => (chart.degrees[p] !== undefined ? ` ${chart.degrees[p]}°` : "");
  const rows: { p: Planet; sign: string; label: string; text: string; tag?: string }[] = [
    { p: "venus", sign: chart.venus, label: t.venus, text: t.venusReading },
    { p: "mars", sign: chart.mars, label: t.mars, text: t.marsReading },
    { p: "mercury", sign: chart.mercury, label: t.mercury, text: t.mercuryReading },
    { p: "jupiter", sign: chart.jupiter, label: t.jupiter, text: t.jupiterReading, tag: t.tagLuck },
    { p: "saturn", sign: chart.saturn, label: t.saturn, text: t.saturnReading, tag: t.tagDiscipline },
  ];
  const teasers: Record<Topic, string> = {
    you: t.teaserYou,
    love: t.teaserLove,
    work: t.teaserWork,
    luck: t.teaserLuck,
  };

  return (
    <div className="narrow sky-page">
      <p className="label muted">{record.name}</p>
      <div className="placement-grid">
        <PlacementBadge label={t.sun} sign={chart.sun} index={0} />
        <PlacementBadge label={t.moon} sign={chart.moon} index={1} />
        <PlacementBadge label={t.rising} sign={chart.rising} index={2} />
      </div>
      {unknownTime && <p className="small muted">{t.noRising}</p>}

      <section className="sky-section">
        <h2 className="label section-heading">{t.chart}</h2>
        {rows.map((r) => (
          <div key={r.p}>
            <PlacementRow
              label={`${glyphs[r.p]} ${r.label}`}
              value={`${word(r.sign)}${deg(r.p)}`}
              explanation={r.text}
            />
            {r.tag && <p className="label muted sky-tag">{r.tag}</p>}
          </div>
        ))}
      </section>

      <section className="sky-section">
        <h2 className="label section-heading">{t.elementsTitle}</h2>
        <ElementBar label={t.fire} value={chart.elements.fire} />
        <ElementBar label={t.earth} value={chart.elements.earth} />
        <ElementBar label={t.air} value={chart.elements.air} />
        <ElementBar label={t.water} value={chart.elements.water} />
      </section>

      <section className="sky-section">
        <h2 className="label section-heading">{t.readMore}</h2>
        <ul className="read-more">
          {topics.map((topic) => (
            <li key={topic}>
              <Link
                to="/chart/result/$id/read/$topic"
                params={{ id, topic }}
                className="read-more-row"
              >
                <span>
                  <span className="question">{t[topicKey(topic)]}</span>
                  <span className="read-more-teaser muted">{teasers[topic]}</span>
                </span>
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Link to="/today" className="today-strip">
        <span className="label">{t.movingToday}</span>
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </div>
  );
}

/* ---------- reading ---------- */
export function ReadingPage({
  id,
  topic,
  state = "",
}: {
  id: string;
  topic: Topic;
  state?: string;
}) {
  const { t, lang } = useLanguage();
  const q = useQuery({
    queryKey: ["reading", id, topic, lang],
    queryFn: () => api.getReading(id, topic, lang),
  });
  const [forced, setForced] = useState(state);
  useEffect(() => setForced(state), [state]);
  const title = t[topicKey(topic)];

  return (
    <div className="narrow reading-page">
      <div className="reading-head">
        <Button asChild variant="text" size="icon">
          <Link to="/chart/result/$id" params={{ id }} aria-label={t.back}>
            <ChevronLeft size={22} />
          </Link>
        </Button>
        <p className="label muted">{t.readingLabel.replace("{topic}", title.toUpperCase())}</p>
      </div>
      {forced === "loading" || (!forced && q.isPending) ? (
        <div className="stack">
          <Skeleton />
          <Skeleton />
        </div>
      ) : forced === "error" || (!forced && q.isError) || !q.data ? (
        <StateMessage
          message={t.readingError}
          retry={() => {
            setForced("");
            void q.refetch();
          }}
        />
      ) : (
        <>
          <h1 className="xl">{q.data.title}</h1>
          <HandleLine chart={demoChart} />
          <Accordion.Root
            type="multiple"
            defaultValue={["s0"]}
            className="reading-accordion"
          >
            {q.data.sections.map((s, i) => (
              <Accordion.Item key={s.title} value={`s${i}`} className="reading-item">
                <Accordion.Header>
                  <Accordion.Trigger className="reading-trigger">
                    <span className="question">{s.title}</span>
                    <ChevronDown size={18} aria-hidden="true" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="reading-content">
                  <p>{s.body}</p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
          <FeedbackRow thanks={t.readingThanks} />
          <Disclaimer />
          <Link
            to="/rituals/$id"
            params={{ id: ritualForTheme[themeForTopic[topic]] }}
            className="quiet-link"
          >
            {t.ritualForThis} →
          </Link>
        </>
      )}
    </div>
  );
}

/* ---------- today ---------- */
export function TodayPage({ state = "" }: { state?: string }) {
  const { t, lang } = useLanguage();
  const q = useQuery({
    queryKey: ["today", lang],
    queryFn: async () => {
      const date = new Date().toISOString().slice(0, 10);
      const today = await api.getToday("demo", date, lang);
      const ritual = await api.getRitual(today.ritualId, lang);
      return { today, ritual };
    },
  });
  const [forced, setForced] = useState(state);
  useEffect(() => setForced(state), [state]);
  const loading = forced === "loading" || (!forced && q.isPending);
  const failed = forced === "error" || (!forced && q.isError);

  if (failed)
    return (
      <div className="narrow">
        <StateMessage
          message={t.todayError}
          retry={() => {
            setForced("");
            void q.refetch();
          }}
        />
      </div>
    );
  const data = loading ? null : q.data;
  const tones: { key: Theme; label: string }[] = [
    { key: "self", label: t.toneSelf },
    { key: "love", label: t.toneLove },
    { key: "work", label: t.toneWork },
    { key: "luck", label: t.toneLuck },
  ];
  const blocks = data
    ? [
        { label: t.working, b: data.today.working },
        { label: t.pushing, b: data.today.pushing },
        { label: t.protect, b: data.today.protect },
      ]
    : [];

  return (
    <div className="narrow today-page">
      <header className="today-head">
        <p className="label muted">
          {data
            ? new Date(data.today.date).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })
            : t.sampleToday}
        </p>
        <OrbitDiagram size="sm" />
        {data ? <h1 className="question">{data.today.summary}</h1> : <Skeleton />}
      </header>

      <section aria-label={t.toneCaption} className="tone-strip">
        {tones.map((x) => {
          const v = data?.today.tone[x.key] ?? 0;
          return (
            <div key={x.key} className="tone">
              <div
                className="tone-track"
                role="meter"
                aria-label={x.label}
                aria-valuemin={0}
                aria-valuemax={5}
                aria-valuenow={v}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={n <= v ? "tone-on" : ""} />
                ))}
              </div>
              <span className="label">{x.label}</span>
            </div>
          );
        })}
        <p className="label muted tone-caption">{t.toneCaption}</p>
      </section>

      <CellGrid columns={1}>
        {data
          ? blocks.map(({ label, b }) => (
              <Cell key={label}>
                <p className="label">{label}</p>
                <p className="label muted cell-evidence">{transitText(t, b.transit)}</p>
                <p>{b.text}</p>
              </Cell>
            ))
          : [0, 1, 2].map((i) => (
              <Cell key={i}>
                <Skeleton />
              </Cell>
            ))}
      </CellGrid>

      {data && (
        <Link to="/rituals/$id" params={{ id: data.ritual.id }} className="ritual-card">
          <span className="label muted">{t.todayRitual}</span>
          <span className="question">{data.ritual.title}</span>
          <span className="ritual-intention">{data.ritual.intention}</span>
          <span className="ritual-meta">
            <span className="label muted">
              {data.ritual.timing} / {t.minutes.replace("{n}", String(data.ritual.minutes))}
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </span>
        </Link>
      )}

      <FeedbackRow thanks={t.readingThanks} />
      <Disclaimer />
    </div>
  );
}

/* ---------- ask ---------- */
const categories: { theme: Theme; key: keyof Dictionary; note: NoteName }[] = [
  { theme: "self", key: "catSelf", note: "bergamot" },
  { theme: "love", key: "catLove", note: "rose" },
  { theme: "work", key: "catWork", note: "vetiver" },
  { theme: "luck", key: "catLuck", note: "amber" },
];
const questionKeys: Record<Theme, (keyof Dictionary)[]> = {
  self: ["qSelf1", "qSelf2", "qSelf3", "qSelf4", "qSelf5", "qSelf6"],
  love: ["qLove1", "qLove2", "qLove3", "qLove4", "qLove5", "qLove6"],
  work: ["qWork1b", "qWork2b", "qWork3b", "qWork4b", "qWork5b", "qWork6b"],
  luck: ["qLuck1", "qLuck2", "qLuck3", "qLuck4", "qLuck5", "qLuck6"],
};

export function AspectGlyph({ aspect }: { aspect: Aspect }) {
  return (
    <svg className="aspect-glyph" viewBox="0 0 48 48" fill="none" stroke="currentColor" aria-hidden="true">
      {aspect === "square" && <rect x="12" y="12" width="24" height="24" />}
      {aspect === "trine" && <path d="M24 10L38 36H10Z" />}
      {aspect === "sextile" && <path d="M24 8V40M10 16L38 32M10 32L38 16" />}
      {aspect === "conjunct" && (
        <>
          <circle cx="20" cy="28" r="9" />
          <path d="M26 21L36 11" />
        </>
      )}
      {aspect === "opposite" && (
        <>
          <circle cx="13" cy="35" r="6" />
          <circle cx="35" cy="13" r="6" />
          <path d="M17 31L31 17" />
        </>
      )}
    </svg>
  );
}

export function AskPage({ state = "" }: { state?: string }) {
  const { t, lang } = useLanguage();
  const [category, setCategory] = useState<Theme>("self");
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "answered" | "error">(
    state === "loading" || state === "error" ? state : "idle",
  );
  const [answer, setAnswer] = useState<api.AstroAnswer | null>(null);
  const [asked, setAsked] = useState("");

  const ask = async (q: string, theme = category) => {
    if (!q.trim()) return;
    setAsked(q);
    setPhase("loading");
    try {
      setAnswer(await api.askNotes(q, theme, "demo", lang));
      setPhase("answered");
    } catch {
      setPhase("error");
    }
  };
  useEffect(() => {
    if (state === "answered") void ask(t.qSelf1, "self");
    // preview only: run once for ?state=answered
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="ask-screen">
      <header className="ask-header">
        <Button
          variant="text"
          size="icon"
          className="ask-close"
          aria-label={t.close}
          onClick={() => window.history.back()}
        >
          <X size={20} />
        </Button>
        <h1 className="label">{t.askTitle}</h1>
        <span className="chart-step-spacer" aria-hidden="true" />
      </header>

      <div className="ask-body">
        <div className="ask-tabs" role="tablist" aria-label={t.categories}>
          {categories.map((c) => (
            <button
              key={c.theme}
              role="tab"
              aria-selected={category === c.theme}
              className={`label ask-tab ${category === c.theme ? "ask-tab-active" : ""}`}
              onClick={() => {
                setCategory(c.theme);
                if (phase !== "loading") setPhase("idle");
              }}
            >
              <NoteIcon name={c.note} label="" />
              {t[c.key]}
            </button>
          ))}
        </div>

        {phase === "loading" ? (
          <div className="ask-loading" aria-live="polite">
            <OrbitDiagram />
            <p className="label muted">{t.askLoading}</p>
          </div>
        ) : phase === "error" ? (
          <StateMessage message={t.askError} retry={() => ask(asked || question)} />
        ) : phase === "answered" && answer ? (
          <div className="ask-answer">
            <CellGrid columns={1}>
              <Cell>
                <p className="label muted">{t.youAsked}</p>
                <p className="question">“{asked}”</p>
              </Cell>
              <div className="cell cell-split">
                <AspectGlyph aspect={answer.transit.aspect} />
                <p className="label">{transitText(t, answer.transit).toUpperCase()}</p>
              </div>
              <Cell>
                <p>{answer.answer}</p>
              </Cell>
              <Cell>
                <FeedbackRow thanks={t.readingThanks} />
                <Disclaimer />
              </Cell>
            </CellGrid>
            <div className="ask-after">
              <Link to="/rituals/$id" params={{ id: answer.ritualId }} className="quiet-link">
                {t.askRitual} →
              </Link>
              <Button
                variant="text"
                onClick={() => {
                  setPhase("idle");
                  setQuestion("");
                }}
              >
                {t.askAnother}
              </Button>
            </div>
          </div>
        ) : (
          <div className="ask-list">
            <p className="label muted">{t.suggested}</p>
            {state === "empty" ? (
              <p className="small muted">{t.askEmpty}</p>
            ) : (
              <ul>
                {questionKeys[category].map((k) => (
                  <li key={k}>
                    <button className="label ask-question" onClick={() => setQuestion(t[k])}>
                      {t[k]}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <form
        className="ask-bar"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(question);
        }}
      >
        <label className="sr-only" htmlFor="ask-input">
          {t.askQuestionLabel}
        </label>
        <input
          id="ask-input"
          className="ask-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t.askPlaceholder}
        />
        <Button type="submit" className="ask-submit" disabled={!question.trim() || phase === "loading"}>
          {t.askButton}
        </Button>
      </form>
    </div>
  );
}

/* ---------- rituals (library; perfume pairing arrives in part 3) ---------- */
export function RitualsPage({ state = "" }: { state?: string }) {
  const { t, lang } = useLanguage();
  const q = useQuery({ queryKey: ["rituals", lang], queryFn: () => api.listRituals(lang) });
  const loading = state === "loading" || (!state && q.isPending);
  const failed = state === "error" || (!state && q.isError);
  return (
    <div className="narrow">
      <h1 className="xl">{t.ritualsTitle}</h1>
      <p className="muted mt-4">{t.ritualsIntro}</p>
      <div className="mt-10">
        {loading ? (
          <Skeleton />
        ) : failed ? (
          <StateMessage message={t.ritualsError} retry={() => void q.refetch()} />
        ) : state === "empty" || !q.data?.length ? (
          <StateMessage message={t.askEmpty} />
        ) : (
          <ul className="read-more">
            {q.data.map((r) => (
              <li key={r.id}>
                <Link to="/rituals/$id" params={{ id: r.id }} className="read-more-row">
                  <span>
                    <span className="question">{r.title}</span>
                    <span className="read-more-teaser muted">{r.intention}</span>
                  </span>
                  <ArrowRight size={20} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function RitualPage({ id, state = "" }: { id: string; state?: string }) {
  const { t, lang } = useLanguage();
  const q = useQuery({ queryKey: ["ritual", id, lang], queryFn: () => api.getRitual(id, lang) });
  if (state === "loading" || (!state && q.isPending))
    return (
      <div className="narrow">
        <Skeleton />
      </div>
    );
  if (state === "error" || (!state && q.isError) || !q.data)
    return (
      <div className="narrow">
        <StateMessage message={t.ritualsError} retry={() => void q.refetch()} />
      </div>
    );
  const r = q.data;
  return (
    <div className="narrow ritual-page">
      <Link to="/rituals" className="label muted">
        ← {t.allRituals}
      </Link>
      <Orb variant="moon" size="md" />
      <h1 className="xl">{r.title}</h1>
      <p className="ritual-intention">{r.intention}</p>
      <CellGrid columns={2}>
        <Cell>
          <p className="label muted">{t.timingLabel}</p>
          <p>{r.timing}</p>
        </Cell>
        <Cell>
          <p className="label muted">{t.minutes.replace("{n}", "")}</p>
          <p>{r.minutes}</p>
        </Cell>
      </CellGrid>
      <h2 className="label section-heading mt-10">{t.stepsLabel}</h2>
      <ol className="ritual-steps">
        {r.steps.map((s, i) => (
          <li key={s}>
            <span className="label muted">0{i + 1}</span>
            <p>{s}</p>
          </li>
        ))}
      </ol>
      <p className="small muted mt-8">{t.anyPerfume}</p>
      <p className="small muted italic mt-2">{t.ritualClaim}</p>
    </div>
  );
}
