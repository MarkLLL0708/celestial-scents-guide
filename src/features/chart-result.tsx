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
import { ritualForTheme, ritualThemes, themeForTopic, topics } from "@/data/astro-mock";
import type {
  Aspect,
  Chart,
  Perfume,
  Planet,
  RitualTheme,
  ShelfEntry,
  Theme,
  Topic,
  Transit,
} from "@/data/types";
import { Bottle } from "@/components/scent/artwork";
import { Notes, AddButton } from "@/components/scent/product";
import { ScentDialog } from "@/components/scent/dialog";
import { PlacementBadge, PlacementRow, ElementBar, Skeleton } from "@/components/scent/controls";
import {
  Orb,
  OrbitDiagram,
  NoteIcon,
  CellGrid,
  Cell,
  type NoteName,
} from "@/components/scent/cosmos";
import { StarField } from "@/components/scent/cosmos";
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

function HandleLine({ chart, heading = false }: { chart: Chart; heading?: boolean }) {
  const { word } = useLanguage();
  const text = `☉ ${word(chart.sun)} ☽ ${word(chart.moon)} ↑ ${chart.rising ? word(chart.rising) : "—"}`;
  return heading ? <h1 className="label">{text}</h1> : <p className="label">{text}</p>;
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
        <HandleLine chart={chart} heading />
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
  const { profile, journey, markJourney } = useStore();
  const [shareOpen, setShareOpen] = useState(false);
  useEffect(() => markJourney("chartSeen"), [markJourney]);
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
    {
      p: "saturn",
      sign: chart.saturn,
      label: t.saturn,
      text: t.saturnReading,
      tag: t.tagDiscipline,
    },
  ];
  const teasers: Record<Topic, string> = {
    you: t.teaserYou,
    love: t.teaserLove,
    work: t.teaserWork,
    luck: t.teaserLuck,
  };

  return (
    <div className="narrow sky-page">
      <h1 className="label muted">{record.name}</h1>
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
      {(journey.readingOpened || journey.ritualOpened) && (
        <Link to="/chart/result/$id/shelf" params={{ id }} className="quiet-link">
          {t.shelfStrip} →
        </Link>
      )}
      <div className="mt-10">
        <Button variant="secondary" onClick={() => setShareOpen(true)}>
          {t.share}
        </Button>
      </div>
      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} name={record.name} chart={chart} />
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
  const { markJourney } = useStore();
  useEffect(() => markJourney("readingOpened"), [markJourney]);
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
          <Accordion.Root type="multiple" defaultValue={["s0"]} className="reading-accordion">
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
              {data.ritual.timing} / {t.minutes.replace("{n}", String(data.ritual.durationMin))}
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
  self: ["qSelf1", "qSelf2", "qSelf3", "qSelf4", ],
  love: ["qLove1", "qLove2", "qLove3", "qLove4", ],
  work: ["qWork1b", "qWork2b", "qWork3b", "qWork4b", ],
  luck: ["qLuck1", "qLuck2", "qLuck3", "qLuck4", ],
};

export function AspectGlyph({ aspect }: { aspect: Aspect }) {
  return (
    <svg
      className="aspect-glyph"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
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
        <Button
          type="submit"
          className="ask-submit"
          disabled={!question.trim() || phase === "loading"}
        >
          {t.askButton}
        </Button>
      </form>
    </div>
  );
}

/* ---------- rituals ---------- */
const themeLabel = (t: Dictionary, th: RitualTheme) => t[`theme${cap(th)}` as keyof Dictionary];

export function RitualsPage({ state = "" }: { state?: string }) {
  const { t, lang } = useLanguage();
  const [theme, setTheme] = useState<RitualTheme | undefined>(undefined);
  const q = useQuery({
    queryKey: ["rituals", lang, theme],
    queryFn: () => api.listRituals(lang, theme),
  });
  const loading = state === "loading" || (!state && q.isPending);
  const failed = state === "error" || (!state && q.isError);
  return (
    <div className="narrow">
      <h1 className="xl">{t.ritualsTitle}</h1>
      <p className="muted mt-4">{t.ritualsIntro}</p>
      <div className="chips mt-8" role="group" aria-label={t.ritualThemes}>
        {ritualThemes.map((th) => (
          <Button
            key={th}
            variant="secondary"
            className="chip label"
            aria-pressed={theme === th}
            onClick={() => setTheme(theme === th ? undefined : th)}
          >
            {themeLabel(t, th)}
          </Button>
        ))}
      </div>
      <div className="mt-8">
        {loading ? (
          <Skeleton />
        ) : failed ? (
          <StateMessage message={t.ritualsError} retry={() => void q.refetch()} />
        ) : state === "empty" || !q.data?.length ? (
          <StateMessage message={t.ritualsEmpty} />
        ) : (
          <ul className="read-more">
            {q.data.map((r) => (
              <li key={r.id}>
                <Link to="/rituals/$id" params={{ id: r.id }} className="read-more-row">
                  <span>
                    <span className="question">{r.title}</span>
                    <span className="label muted">
                      {themeLabel(t, r.theme)} / {t.minutes.replace("{n}", String(r.durationMin))} /{" "}
                      {r.timing}
                    </span>
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

function ScentThatFits({ perfume, reason }: { perfume: Perfume; reason: string }) {
  const { t, word } = useLanguage();
  const { add, notify } = useStore();
  const [busy, setBusy] = useState(false);
  return (
    <section className="scent-fit">
      <h2 className="label section-heading">{t.scentThatFits}</h2>
      <article className="fit-card">
        <div className="product-image">
          <Bottle family={perfume.scent_family} name={perfume.name} />
        </div>
        <div className="fit-body">
          <p className="label muted">{word(perfume.scent_family)}</p>
          <h3 className="question">{perfume.name}</h3>
          <p className="label muted">{perfume.brand}</p>
          <p>
            ${perfume.price} · {perfume.size_ml} ml
          </p>
          <p className="fit-reason">{reason}</p>
          <Notes perfume={perfume} />
          <div className="fit-actions">
            <Link to="/shop/$id" params={{ id: perfume.id }} className="quiet-link">
              {t.seeScent} →
            </Link>
            <Button
              variant="secondary"
              disabled={perfume.sold_out}
              loading={busy}
              onClick={async () => {
                setBusy(true);
                await add(perfume.id);
                notify(t.added);
                setBusy(false);
              }}
            >
              {perfume.sold_out ? t.soldOut : t.add}
            </Button>
          </div>
        </div>
      </article>
      <p className="small muted mt-4">{t.noPerfume}</p>
    </section>
  );
}

export function RitualPage({ id, state = "" }: { id: string; state?: string }) {
  const { t, lang } = useLanguage();
  const store = useStore();
  const [saved, setSaved] = useState(false);
  const q = useQuery({
    queryKey: ["ritual-full", id, lang],
    queryFn: async () => {
      const ritual = await api.getRitual(id, lang);
      const perfume = await api.getPerfume(ritual.perfumeId);
      return { ritual, perfume };
    },
    retry: false,
  });
  const { markJourney } = store;
  useEffect(() => markJourney("ritualOpened"), [markJourney]);

  if (state === "loading" || (!state && q.isPending))
    return (
      <div className="narrow stack">
        <Orb variant="moon" size="md" />
        <Skeleton />
      </div>
    );
  const notFoundErr = q.error instanceof Error && q.error.message === "NOT_FOUND";
  if (state === "not-found" || (!state && notFoundErr))
    return (
      <div className="narrow">
        <StateMessage message={t.ritualNotFound}>
          <Link to="/rituals" className="quiet-link">
            {t.allRituals}
          </Link>
        </StateMessage>
      </div>
    );
  if (state === "error" || (!state && q.isError) || !q.data)
    return (
      <div className="narrow">
        <StateMessage message={t.ritualsError} retry={() => void q.refetch()} />
      </div>
    );
  const r = q.data.ritual;
  const basePerfume = state === "perfume-missing" ? null : q.data.perfume;
  const perfume =
    basePerfume && state === "sold-out" ? { ...basePerfume, sold_out: true } : basePerfume;

  return (
    <div className="narrow ritual-page">
      <Link to="/rituals" className="label muted">
        ← {t.allRituals}
      </Link>
      <div className="ritual-hero">
        <Orb variant="moon" size="lg" />
        <h1 className="xl">{r.title}</h1>
        <p className="question ritual-intention-lg">{r.intention}</p>
      </div>
      <dl className="ritual-meta-row">
        <div>
          <dt className="label muted">{t.timingLabel}</dt>
          <dd className="label">{r.timing}</dd>
        </div>
        <div>
          <dt className="label muted">{t.durationLabel}</dt>
          <dd className="label">{t.minutes.replace("{n}", String(r.durationMin))}</dd>
        </div>
        <div>
          <dt className="label muted">{t.needsLabel}</dt>
          <dd className="label">{r.needs.join(", ")}</dd>
        </div>
      </dl>
      <ol className="ritual-steps">
        {r.steps.map((s, i) => (
          <li key={s}>
            <span className="label">0{i + 1}</span>
            <p>{s}</p>
          </li>
        ))}
      </ol>
      <p className="muted italic">{r.why}</p>
      <p className="small muted">{t.anyPerfume}</p>

      {perfume && <ScentThatFits perfume={perfume} reason={r.reason} />}

      <div className="stack">
        <Button
          disabled={saved}
          onClick={async () => {
            await api.saveRitual(r.id);
            setSaved(true);
            store.notify(t.ritualSaved);
          }}
        >
          {t.saveRitual}
        </Button>
        {!store.user && (
          <Link to="/login" className="small muted underline">
            {t.ritualGuest}
          </Link>
        )}
      </div>
      <p className="small muted italic">{t.ritualClaim}</p>
      {store.journey.readingOpened && (
        <Link to="/chart/result/$id/shelf" params={{ id: "demo" }} className="today-strip">
          <span className="label">{t.shelfStrip}</span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/* ---------- shelf ---------- */
export function ShelfPage({ id, state = "" }: { id: string; state?: string }) {
  const { t, lang, word } = useLanguage();
  const q = useQuery({ queryKey: ["shelf", id, lang], queryFn: () => api.getShelf(id, lang) });
  const loading = state === "loading" || (!state && q.isPending);
  const failed = state === "error" || (!state && q.isError);
  const entries: { key: string; label: string; note: NoteName; e: ShelfEntry | null }[] = q.data
    ? [
        { key: "chart", label: t.shelfChart, note: "musk", e: q.data.forChart },
        { key: "week", label: t.shelfWeek, note: "bergamot", e: q.data.forWeek },
        {
          key: "shadow",
          label: t.shelfShadow,
          note: "amber",
          e: state === "two" ? null : q.data.forShadow,
        },
      ]
    : [];
  return (
    <div className="narrow shelf-page">
      <Link to="/chart/result/$id" params={{ id }} className="label muted">
        ← {t.back}
      </Link>
      <h1 className="xl">{t.shelfTitle}</h1>
      <p className="muted">{t.shelfLine}</p>
      {loading ? (
        <div className="stack">
          <Skeleton product />
          <Skeleton product />
        </div>
      ) : failed ? (
        <StateMessage message={t.shelfError} retry={() => void q.refetch()} />
      ) : (
        entries
          .filter((x) => x.e)
          .map(({ key, label, note, e }) =>
            e ? (
              <article key={key} className="shelf-entry">
                <div className="shelf-entry-head">
                  <NoteIcon name={note} label="" />
                  <p className="label">{label}</p>
                </div>
                <div className="evidence-cell">
                  <span className="label">
                    {glyphs[e.evidence?.planet ?? "sun"]}{" "}
                    {t[planetKey(e.evidence?.planet ?? "sun")]}{" "}
                    {word(e.evidence?.sign ?? "").toUpperCase()}
                  </span>
                  <span className="small">{e.reason}</span>
                </div>
                <div className="shelf-body">
                  <div className="product-image">
                    <Bottle family={e.perfume.scent_family} name={e.perfume.name} />
                  </div>
                  <div className="stack">
                    <Link to="/shop/$id" params={{ id: e.perfume.id }} className="question">
                      {e.perfume.name}
                    </Link>
                    <p className="label muted">
                      {t.pairsWith}:{" "}
                      <Link to="/rituals/$id" params={{ id: e.ritualId }} className="underline">
                        {e.ritualTitle}
                      </Link>
                    </p>
                    <Notes perfume={e.perfume} />
                    <p>
                      ${e.perfume.price} · {e.perfume.size_ml} ml
                    </p>
                    <AddButton perfume={e.perfume} />
                  </div>
                </div>
              </article>
            ) : null,
          )
      )}
      <Link to="/shop" className="quiet-link">
        {t.browseEverything} →
      </Link>
    </div>
  );
}

/* ---------- share card ---------- */
export function ShareDialog({
  open,
  onOpenChange,
  name,
  chart,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  name: string;
  chart: Chart;
}) {
  const { t, lang } = useLanguage();
  const { notify } = useStore();
  const [busy, setBusy] = useState(false);
  const q = useQuery({
    queryKey: ["today", lang],
    enabled: open,
    queryFn: async () => {
      const date = new Date().toISOString().slice(0, 10);
      const today = await api.getToday("demo", date, lang);
      const ritual = await api.getRitual(today.ritualId, lang);
      return { today, ritual };
    },
  });
  const download = async () => {
    const node = document.getElementById("share-card");
    if (!node) return;
    setBusy(true);
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(node, {
        width: 1080,
        height: 1920,
        style: { transform: "none" },
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = "natal-notes.png";
      a.click();
    } catch {
      notify(t.shareFailed, "error");
    }
    setBusy(false);
  };
  return (
    <ScentDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.shareTitle}
      description={t.shareDescription}
    >
      <div className="share-frame">
        <div id="share-card" className="share-card" data-theme="dark">
          <div className="share-stars">
            <StarField />
          </div>
          <div className="share-inner">
            <p className="label">{t.brand}</p>
            <div className="share-mid">
              <Orb variant="sun" size="lg" />
              <h3 className="share-name">{name}</h3>
              <HandleLine chart={chart} />
              {q.data && (
                <>
                  <p className="label muted">{t.shareSummaryLabel}</p>
                  <p className="share-line">{q.data.today.summary}</p>
                  <p className="label muted">{t.shareRitualLabel}</p>
                  <p className="share-line">{q.data.ritual.title}</p>
                </>
              )}
            </div>
            <p className="label muted">{t.chartUrl}</p>
          </div>
        </div>
      </div>
      <div className="stack mt-6">
        <Button onClick={download} loading={busy}>
          {busy ? t.generating : t.download}
        </Button>
        <Button
          variant="secondary"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href);
              notify(t.copied);
            } catch {
              notify(t.copyError, "error");
            }
          }}
        >
          {t.copyLink}
        </Button>
      </div>
    </ScentDialog>
  );
}
