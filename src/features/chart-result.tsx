import { signLine } from "@/lib/reading/fallback";
import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Accordion from "@radix-ui/react-accordion";
import { ArrowRight, ChevronDown, ChevronLeft, ThumbsUp, ThumbsDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/provider";
import type { Dictionary } from "@/i18n/en";
import { useStore } from "@/data/context";
import * as api from "@/data/api";
import { useAccount } from "@/data/auth";
import * as cloud from "@/data/cloud.functions";
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
  SolarSystem,
  NoteIcon,
  CellGrid,
  Cell,
  type NoteName,
} from "@/components/scent/cosmos";
import { StarField } from "@/components/scent/cosmos";
import { StateMessage } from "./shared";
import { AskEngraving } from "@/components/scent/ask-engraving";
import { PerfumePrice, PerfumeStory, perfumeName } from "@/components/scent/catalogue-details";
import { RitualTracker, CapsuleSave } from "./sanctuary-controls";

export const glyphs: Record<Planet, string> = {
  sun: "☉",
  moon: "☽",
  rising: "↑",
  venus: "♀",
  mars: "♂",
  mercury: "☿",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅", neptune: "♆", pluto: "♇",
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

/** Current chart id after hydration (demo during SSR), so links never mismatch. */
function useChartId() {
  const [id, setId] = useState(api.DEMO_ID);
  useEffect(() => setId(api.currentChartId()), []);
  return id;
}

function MoonNote({ chart }: { chart: Chart }) {
  const { t, word } = useLanguage();
  if (!chart.moonAlternatives) return null;
  return (
    <p className="small muted">
      {t.moonEither
        .replace("{a}", word(chart.moonAlternatives[0]))
        .replace("{b}", word(chart.moonAlternatives[1]))}
    </p>
  );
}

function PlacementLine({ items }: { items: { body: Planet; sign: string; degree: number }[] }) {
  const { t, word } = useLanguage();
  if (!items.length) return null;
  return (
    <p className="label muted placement-line">
      {items
        .map((p) => `${glyphs[p.body]} ${t[planetKey(p.body)]} ${p.degree}° ${word(p.sign)}`)
        .join(" · ")}
    </p>
  );
}

export function FeedbackRow({ thanks }: { thanks?: string }) {
  const { t, lang } = useLanguage();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { notify } = useStore();
  const [choice, setChoice] = useState<"up" | "down" | null>(null);
  const pick = async (v: "up" | "down") => {
    try {
      const kind =
        path === "/ask"
          ? "ask"
          : path === "/today"
            ? "today"
            : path.endsWith("/shelf")
              ? "match"
              : "reading";
      await api.submitFeedback(kind, path, v === "up" ? 1 : -1, lang);
      setChoice(v);
      notify(thanks ?? t.feedbackThanks);
    } catch {
      notify(t.accountError, "error");
    }
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

function LibrarySource({ fromLibrary }: { fromLibrary?: boolean }) {
  const { t } = useLanguage();
  const account = useAccount();
  const q = useQuery({
    queryKey: ["account", account.user?.id],
    queryFn: () => cloud.accountInfo(),
    enabled: !!account.user,
  });
  const [show, setShow] = useState(false);
  if (!q.data?.admin) return null;
  return (
    <span className="small muted">
      <Button
        variant="text"
        size="sm"
        aria-label={t.librarySources}
        aria-pressed={show}
        onClick={() => setShow(!show)}
      >
        {show ? (fromLibrary ? "●" : "○") : "◌"}
      </Button>
    </span>
  );
}

/* ---------- reveal ---------- */
export function RevealPage({ state = "" }: { state?: string }) {
  const { t, lang } = useLanguage();
  const [forced, setForced] = useState(state);
  useEffect(() => setForced(state), [state]);
  const q = useQuery({
    queryKey: ["chart", "current", api.currentChartId()],
    queryFn: () => api.getChartById(api.currentChartId()),
  });
  const record = q.data;
  const unknownTime = forced === "unknown-time" || (record ? !record.chart.birthTimeKnown : false);
  const chart = record
    ? { ...record.chart, rising: unknownTime ? null : record.chart.rising }
    : demoChart;
  const traits = useQuery({
    queryKey: ["reveal-traits", record?.id, lang, unknownTime],
    queryFn: () => api.getRevealTraits(chart, lang),
    enabled: !!record,
  });

  if (forced === "loading" || (!forced && q.isPending))
    return (
      <div className="chart-loading">
        <SolarSystem />
        <div className="w-full max-w-xs">
          <Skeleton />
        </div>
      </div>
    );
  if (forced === "error" || (!forced && q.isError))
    return (
      <div className="chart-loading">
        <Orb variant="disc" size="md" />
        <StateMessage
          message={t.revealError}
          retry={() => {
            setForced("");
            void q.refetch();
          }}
        />
      </div>
    );

  return (
    <div className="reveal-screen">
      <div className="reveal-top">
        <SolarSystem />
        <HandleLine chart={chart} heading />
        <div className="reveal-traits">
          {(
            traits.data ??
            [t.trait1, t.trait2, t.trait3].map((text) => ({ text, fromLibrary: false }))
          ).map((line, i) => (
            <p key={i} data-text-source={line.fromLibrary ? "library" : "fallback"}>
              {line.text}
              <LibrarySource fromLibrary={line.fromLibrary} />
            </p>
          ))}
        </div>
        {unknownTime && <p className="label muted">{t.noRising}</p>}
        <MoonNote chart={chart} />
        <p className="label muted reveal-caption">{t.revealCaption}</p>
      </div>
      <div className="reveal-bottom">
        <Button asChild>
          <Link to="/chart/result/$id" params={{ id: record?.id ?? api.DEMO_ID }}>
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

/* ---------- scent capsule: 3–5 perfumes after a reading ---------- */
export function ScentCapsule({
  chartId,
  ritualId,
  withPrice = false,
  compact = false,
  cta = "both",
}: {
  chartId: string;
  ritualId?: string;
  withPrice?: boolean;
  compact?: boolean;
  cta?: "both" | "ask" | "none";
}) {
  const { t, lang, word } = useLanguage();
  const { add, notify } = useStore();
  const q = useQuery({
    queryKey: ["capsule", chartId, ritualId ?? "", lang],
    queryFn: () => api.getCapsule(chartId, lang, ritualId),
    placeholderData: keepPreviousData,
  });
  const lead = ritualId ?? q.data?.[0]?.ritualId;
  return (
    <section className="sky-section capsule" aria-labelledby="capsule-title">
      <h2 id="capsule-title" className="label section-heading">
        {t.capsuleTitle}
      </h2>
      <p className="small muted">{t.capsuleLead.replace("{n}", String(q.data?.length ?? 5))}</p>
      {q.isPending ? (
        <div className="stack">
          <Skeleton />
          <Skeleton />
        </div>
      ) : q.isError || !q.data ? (
        <StateMessage message={t.capsuleError} retry={() => void q.refetch()} />
      ) : (
        <ol className="capsule-list">
          {q.data.map((e, i) => (
            <li key={e.perfume.id} className={`capsule-card${compact ? " capsule-compact" : ""}`}>
              <div className="capsule-art">
                <Bottle family={e.perfume.scent_family} name={perfumeName(e.perfume, lang)} />
              </div>
              <div className="capsule-body">
                <p className="label muted">
                  0{i + 1} · {word(e.perfume.scent_family)}
                </p>
                <h3 className="question">{perfumeName(e.perfume, lang)}</h3>
                <p className="label muted">{e.perfume.brand}</p>
                <p className="small">{e.reason}</p>
                <PerfumeStory perfume={e.perfume} />
                {!compact && <Notes perfume={e.perfume} />}
                {withPrice && (
                  <p className="label">
                    <PerfumePrice perfume={e.perfume} />
                  </p>
                )}
                <div className="capsule-actions">
                  <Button asChild>
                    <Link to="/rituals/$id" params={{ id: e.ritualId }}>
                      {t.capsuleRitual}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </Button>
                  <Link to="/shop/$id" params={{ id: e.perfume.id }} className="quiet-link">
                    {t.seeScent} →
                  </Link>
                  {withPrice && (
                    <Button
                      variant="secondary"
                      disabled={e.perfume.sold_out || e.perfume.details_pending}
                      onClick={async () => {
                        await add(e.perfume.id);
                        notify(t.added);
                      }}
                    >
                      {e.perfume.details_pending ? t.detailsPending : e.perfume.sold_out ? t.soldOut : t.add}
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
      {q.data && lead && q.data.length >= 3 && <CapsuleSave chartId={chartId} ritualId={lead} ids={q.data.map((e) => e.perfume.id)} />}
      {cta !== "none" && (
        <div className="capsule-cta">
          {cta === "both" && lead && (
            <Button asChild size="lg">
              <Link to="/rituals/$id" params={{ id: lead }}>
                {t.beginRitual}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
          )}
          <Button asChild variant="secondary" size="lg">
            <Link to="/ask">{t.askCta}</Link>
          </Button>
        </div>
      )}
      <Link to="/shop" className="small muted underline">
        {t.capsuleArchive}
      </Link>
    </section>
  );
}

/* ---------- your sky ---------- */
export function ResultPage({ id, state = "" }: { id: string; state?: string }) {
  const { t, word, lang } = useLanguage();
  const { journey, markJourney, user, notify } = useStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [shareOpen, setShareOpen] = useState(false);
  useEffect(() => markJourney("chartSeen"), [markJourney]);
  const q = useQuery({ queryKey: ["chart", id], queryFn: () => api.getChartById(id), retry: (n, e) => e.message !== "NOT_FOUND" && n < 2 });
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
  if (!forced && q.isError && q.error?.message === "NOT_FOUND")
    return (
      <div className="narrow stack">
        <p>{t.chartFirst}</p>
        <Button asChild><Link to="/chart/new">{t.chartFirstCta}</Link></Button>
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
  const unknownTime = forced === "unknown-time" || !record.chart.birthTimeKnown;
  const chart = { ...record.chart, rising: unknownTime ? null : record.chart.rising };
  const deg = (p: Planet) => (chart.degrees[p] !== undefined ? ` ${chart.degrees[p]}°` : "");
  const rows: { p: Planet; sign: string; label: string; text: string; tag?: string }[] = [
    { p: "venus", sign: chart.venus, label: t.venus, text: signLine(lang, chart.venus, 0) },
    { p: "mars", sign: chart.mars, label: t.mars, text: signLine(lang, chart.mars, 1) },
    { p: "mercury", sign: chart.mercury, label: t.mercury, text: signLine(lang, chart.mercury, 2) },
    { p: "jupiter", sign: chart.jupiter, label: t.jupiter, text: signLine(lang, chart.jupiter, 0), tag: t.tagLuck },
    {
      p: "saturn",
      sign: chart.saturn,
      label: t.saturn,
      text: signLine(lang, chart.saturn, 1),
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
      <MoonNote chart={chart} />

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

      {(journey.readingOpened || journey.ritualOpened) && <ScentCapsule chartId={id} compact />}

      <Link to="/today" className="today-strip">
        <span className="label">{t.movingToday}</span>
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
      {(journey.readingOpened || journey.ritualOpened) && (
        <Link to="/chart/result/$id/shelf" params={{ id }} className="quiet-link">
          {t.shelfStrip} →
        </Link>
      )}
      <div className="mt-10 flex flex-wrap gap-3">
        <Button
          variant="secondary"
          onClick={async () => {
            if (!user) {
              sessionStorage.setItem("natal-notes:save-after-login", "true");
              await navigate({ to: "/login" });
              return;
            }
            try {
              await api.saveChart(id);
              await queryClient.invalidateQueries({ queryKey: ["saved"] });
              notify(t.saved);
            } catch {
              notify(t.accountError, "error");
            }
          }}
        >
          {t.save}
        </Button>
        <Button variant="secondary" onClick={() => setShareOpen(true)}>
          {t.share}
        </Button>
        <Button
          variant="text"
          onClick={() => {
            api.clearChart();
            void navigate({ to: "/chart/new", search: { step: 1 } });
          }}
        >
          {t.takeAgain}
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
  const chartQ = useQuery({ queryKey: ["chart", id], queryFn: () => api.getChartById(id) });
  const q = useQuery({
    queryKey: ["reading", id, topic, lang],
    queryFn: () => api.getReading(id, topic, lang),
    retry: false,
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
          <PlacementLine items={q.data.placements ?? []} />
          <HandleLine chart={chartQ.data?.chart ?? demoChart} />
          {q.data.week && (
            <p className="label muted placement-line">
              {t.strongestWeek.replace("{transit}", transitText(t, q.data.week.transit)).replace(
                "{day}",
                new Date(q.data.week.date).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-GB", {
                  weekday: "long",
                }),
              )}
            </p>
          )}
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
                  {s.placement && <PlacementLine items={[s.placement]} />}
                  <div className="stack">{s.body.split("\n\n").map((text, i) => <p key={i} data-text-source={s.fromLibrary ? "library" : "editorial"}>{text}</p>)}<LibrarySource fromLibrary={s.fromLibrary} /></div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
          {q.data.voice && <PersonalCard value={q.data.voice} />}
          <FeedbackRow thanks={t.readingThanks} />
          <Disclaimer />
          <ScentCapsule chartId={id} ritualId={ritualForTheme[themeForTopic[topic]]} compact />
        </>
      )}
    </div>
  );
}

/* ---------- today ---------- */
const TIP_KEY = "natal-notes:today-tip";
function TodayTip() {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(
        !!api.currentChartId() &&
          api.currentChartId() !== api.DEMO_ID &&
          !localStorage.getItem(TIP_KEY),
      );
    } catch {
      /* storage blocked */
    }
  }, []);
  if (!show) return null;
  return (
    <div className="today-tip" role="note">
      <p>{t.todayTip}</p>
      <Button
        variant="text"
        size="icon"
        aria-label={t.close}
        onClick={() => {
          setShow(false);
          try {
            localStorage.setItem(TIP_KEY, "1");
          } catch {
            /* storage blocked */
          }
        }}
      >
        <X size={18} />
      </Button>
    </div>
  );
}
export function TodayPage({ state = "" }: { state?: string }) {
  const { t, lang } = useLanguage();
  const q = useQuery({
    queryKey: ["today", lang, api.todayDate(), api.currentChartId()],
    queryFn: async () => {
      const today = await api.getToday(api.currentChartId(), api.todayDate(), lang);
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
      <TodayTip />
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
        {data ? (
          <h1 className="question">
            {data.today.summary}
            <LibrarySource fromLibrary={data.today.summaryFromLibrary} />
          </h1>
        ) : (
          <Skeleton />
        )}
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
          ? blocks.map(({ label, b }) =>
              b === null ? (
                <Cell key={label}>
                  <p className="label">{label}</p>
                  <p>{data.today.quiet ?? t.quietDay}</p>
                </Cell>
              ) : (
                <Cell key={label}>
                  <p className="label">{label}</p>
                  <p className="label muted cell-evidence">{transitText(t, b.transit)}</p>
                  <p>
                    {b.text}
                    <LibrarySource fromLibrary={b.fromLibrary} />
                  </p>
                </Cell>
              ),
            )
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
  { theme: "luck", key: "catMood", note: "amber" },
];
const questionKeys: Record<Theme, (keyof Dictionary)[]> = {
  self: [
    "qSelf1",
    "qSelf2",
    "qSelf3",
    "qSelf4",
    "qSelf5",
    "qSelf6",
    "qSelf7",
    "qSelf8",
    "qSelf9",
    "qSelf10",
    "qSelf11",
    "qSelf12",
    "qSelf13",
    "qSelf14",
    "qSelf15",
    "qSelf16",
  ],
  love: [
    "qLove1",
    "qLove2",
    "qLove3",
    "qLove4",
    "qLove5",
    "qLove6",
    "qLove7",
    "qLove8",
    "qLove9",
    "qLove10",
    "qLove11",
    "qLove12",
    "qLove13",
    "qLove14",
    "qLove15",
    "qLove16",
  ],
  work: [
    "qWork1b",
    "qWork2b",
    "qWork3b",
    "qWork4b",
    "qWork5",
    "qWork6",
    "qWork7",
    "qWork8",
    "qWork9",
    "qWork10",
    "qWork11",
    "qWork12",
    "qWork13",
    "qWork14",
    "qWork15",
    "qWork16",
  ],
  luck: ["qMood1","qMood2","qMood3","qMood4","qMood5","qMood6","qMood7","qMood8","qMood9","qMood10","qMood11","qMood12","qMood13","qMood14","qMood15","qMood16"],

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
  const { word } = useLanguage();
  const chartId = useChartId();
  const own = chartId !== api.DEMO_ID || !!state;
  const chartQ = useQuery({
    queryKey: ["chart", chartId],
    queryFn: () => api.getChartById(chartId),
    enabled: own,
  });
  const c = chartQ.data?.chart;
  const tailored = c
    ? [
        t.qTailor1.replace("{sun}", word(c.sun)),
        t.qTailor2.replace("{moon}", word(c.moon)),
        t.qTailor3,
      ]
    : [];

  const ask = async (q: string, theme = category) => {
    if (!q.trim()) return;
    setAsked(q);
    setPhase("loading");
    try {
      setAnswer(await api.askNotes(q, theme, api.currentChartId(), lang));
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
      <div className="ask-stars" aria-hidden="true">
        <StarField />
      </div>
      <header className="ask-header">
        <Button asChild variant="text" size="icon" className="ask-close">
          <Link to="/today" aria-label={t.back} title={t.back}>
            <ChevronLeft size={20} />
          </Link>
        </Button>
        <h1 className="label">{t.askTitle}</h1>
        <span className="chart-step-spacer" aria-hidden="true" />
      </header>

      <div className="ask-body">
        <div className="ask-tabs" role="tablist" aria-label={t.categories}>
          {categories.map((c) => (
            <Button
              variant="text"
              key={c.theme}
              role="tab"
              aria-selected={category === c.theme}
              className={`label ask-tab ${category === c.theme ? "ask-tab-active" : ""}`}
              onClick={() => {
                setCategory(c.theme);
                if (phase !== "loading") setPhase("idle");
              }}
            >
              <AskEngraving kind={c.theme === "luck" ? "mood" : c.theme} />
              {t[c.key]}
            </Button>
          ))}
        </div>

        {!own ? (
          <StateMessage message={t.askGate}>
            <Button asChild>
              <Link to="/chart/new" search={{ step: 1, state: "" }}>
                {t.readChart}
              </Link>
            </Button>
          </StateMessage>
        ) : phase === "loading" ? (
          <div className="ask-loading" aria-live="polite">
            <SolarSystem size="md" />
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
                {answer.source === "ai" && <p className="label muted">{t.askLive}</p>}
                <div className="ask-paragraphs">{answer.answer.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
                {answer.source === "limited" && <p className="small muted">{t.askLimited}</p>}
              </Cell>
              <AskPairing chartId={chartId} ritualId={answer.ritualId} perfumeId={answer.perfumeId} />
              <Cell>
                <FeedbackRow thanks={t.readingThanks} />
                <Disclaimer />
              </Cell>
            </CellGrid>
            <div className="ask-after">
              <Button asChild>
                <Link to="/rituals/$id" params={{ id: answer.ritualId }}>
                  {t.askRitual}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </Button>
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
            {c && (
              <p className="label ask-context">
                {t.askContext.replace(
                  "{handle}",
                  `☉ ${word(c.sun)} ☽ ${word(c.moon)} ↑ ${c.rising ? word(c.rising) : "—"}`,
                )}
              </p>
            )}
            <p className="label muted">{t.suggested}</p>
            {state === "empty" ? (
              <p className="small muted">{t.askEmpty}</p>
            ) : (
              <ul>
                {[...tailored, ...questionKeys[category].map((k) => t[k])].map((text) => (
                  <li key={text}>
                    <Button
                      variant="text"
                      className="label ask-question"
                      onClick={() => setQuestion(text)}
                    >
                      {text}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {own && (
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
      )}
    </div>
  );
}

/* ---------- rituals ---------- */
const themeLabel = (t: Dictionary, th: RitualTheme) => t[`theme${cap(th)}` as keyof Dictionary];

export function RitualsPage({ state = "" }: { state?: string }) {
  const { t, lang } = useLanguage();
  const [theme, setTheme] = useState<RitualTheme | undefined>(undefined);
  const [forced, setForced] = useState(state);
  useEffect(() => setForced(state), [state]);
  const q = useQuery({
    queryKey: ["rituals", lang, theme],
    queryFn: () => api.listRituals(lang, theme),
    placeholderData: keepPreviousData,
  });
  const loading = forced === "loading" || (!forced && q.isPending);
  const failed = forced === "error" || (!forced && q.isError);
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
          <StateMessage
            message={t.ritualsError}
            retry={() => {
              setForced("");
              void q.refetch();
            }}
          />
        ) : forced === "empty" || !q.data?.length ? (
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
  const { t, word, lang } = useLanguage();
  const { add, notify } = useStore();
  const [busy, setBusy] = useState(false);
  return (
    <section className="scent-fit">
      <h2 className="label section-heading">{t.scentThatFits}</h2>
      <article className="fit-card">
        <div className="product-image">
          <Bottle family={perfume.scent_family} name={perfumeName(perfume, lang)} />
        </div>
        <div className="fit-body">
          <p className="label muted">{word(perfume.scent_family)}</p>
          <h3 className="question">{perfumeName(perfume, lang)}</h3>
          <p className="label muted">{perfume.brand}</p>
          <p>
            <PerfumePrice perfume={perfume} />
          </p>
          <p className="fit-reason">{reason}</p>
          <Notes perfume={perfume} />
          <div className="fit-actions">
            <Link to="/shop/$id" params={{ id: perfume.id }} className="quiet-link">
              {t.seeScent} →
            </Link>
            <Button
              variant="secondary"
              disabled={perfume.sold_out || perfume.details_pending}
              loading={busy}
              onClick={async () => {
                setBusy(true);
                await add(perfume.id);
                notify(t.added);
                setBusy(false);
              }}
            >
              {perfume.details_pending ? t.detailsPending : perfume.sold_out ? t.soldOut : t.add}
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
  const queryClient = useQueryClient();
  const chartId = useChartId();
  const [forced, setForced] = useState(state);
  useEffect(() => {
    setForced(state);
    setSaved(false);
  }, [state, id]);
  const [saved, setSaved] = useState(false);
  const q = useQuery({
    queryKey: ["ritual-full", id, lang, chartId],
    queryFn: async () => {
      const ritual = await api.getRitual(id, lang);
      const match = await api.getPerfumeForRitual(id, lang, chartId);
      return { ritual, perfume: match?.perfume ?? null, reason: match?.reason ?? "" };
    },
    retry: false,
  });
  const { markJourney } = store;
  useEffect(() => markJourney("ritualOpened"), [markJourney]);

  if (forced === "loading" || (!forced && q.isPending))
    return (
      <div className="narrow stack">
        <Orb variant="moon" size="md" />
        <Skeleton />
      </div>
    );
  const notFoundErr = q.error instanceof Error && q.error.message === "NOT_FOUND";
  if (forced === "not-found" || (!forced && notFoundErr))
    return (
      <div className="narrow">
        <StateMessage message={t.ritualNotFound}>
          <Link to="/rituals" className="quiet-link">
            {t.allRituals}
          </Link>
        </StateMessage>
      </div>
    );
  if (forced === "error" || (!forced && q.isError) || !q.data)
    return (
      <div className="narrow">
        <StateMessage
          message={t.ritualsError}
          retry={() => {
            setForced("");
            void q.refetch();
          }}
        />
      </div>
    );
  const r = q.data.ritual;
  const basePerfume = state === "perfume-missing" ? null : q.data.perfume;
  const perfume =
    basePerfume && state === "sold-out" ? { ...basePerfume, sold_out: true } : basePerfume;

  return (
    <div className="narrow ritual-page">
      <div className="ritual-hero">
        <SolarSystem />
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
      <RitualTracker ritual={r} />
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

      {perfume &&
        (state === "sold-out" ? (
          <ScentThatFits perfume={perfume} reason={q.data.reason || r.reason} />
        ) : (
          <ScentCapsule chartId={chartId} ritualId={r.id} withPrice cta="ask" />
        ))}

      <div className="stack">
        <Button
          disabled={saved}
          onClick={async () => {
            if (!store.user) {
              sessionStorage.setItem("natal-notes:ritual-after-login", r.id);
              store.notify(t.ritualGuest);
              return;
            }
            try {
              await api.saveRitual(r.id);
              await queryClient.invalidateQueries({ queryKey: ["saved-rituals"] });
              setSaved(true);
              store.notify(t.ritualSaved);
            } catch {
              store.notify(t.accountError, "error");
            }
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
        <Link to="/chart/result/$id/shelf" params={{ id: chartId }} className="today-strip">
          <span className="label">{t.shelfStrip}</span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/* ---------- shelf ---------- */
function SampleButton({ perfume }: { perfume: Perfume }) {
  const { t } = useLanguage();
  const { add, notify } = useStore();
  return (
    <Button
      variant="secondary"
      onClick={async () => {
        await add(perfume.id);
        notify(t.added);
      }}
    >
      {t.addSample}
    </Button>
  );
}
export function ShelfPage({ id, state = "" }: { id: string; state?: string }) {
  const { t, lang, word } = useLanguage();
  const [forced, setForced] = useState(state);
  useEffect(() => setForced(state), [state]);
  const q = useQuery({ queryKey: ["shelf", id, lang], queryFn: () => api.getShelf(id, lang) });
  const loading = forced === "loading" || (!forced && q.isPending);
  const failed = forced === "error" || (!forced && q.isError);
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
        <StateMessage
          message={t.shelfError}
          retry={() => {
            setForced("");
            void q.refetch();
          }}
        />
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
                  <span className="label">{e.evidence}</span>
                  <span className="small">{e.reason}</span>
                </div>
                <div className="shelf-body">
                  <div className="product-image">
                    <Bottle family={e.perfume.scent_family} name={perfumeName(e.perfume, lang)} />
                  </div>
                  <div className="stack">
                    <Link to="/shop/$id" params={{ id: e.perfume.id }} className="question">
                      {perfumeName(e.perfume, lang)}
                    </Link>
                    <p className="label muted">
                      {t.pairsWith}:{" "}
                      <Link to="/rituals/$id" params={{ id: e.ritualId }} className="underline">
                        {e.ritualTitle}
                      </Link>
                    </p>
                    <Notes perfume={e.perfume} />
                    <p>
                      <PerfumePrice perfume={e.perfume} />
                      {e.perfume.sample_price !== undefined &&
                        ` · ${t.samplePrice.replace("{price}", String(e.perfume.sample_price))}`}
                    </p>
                    <div className="fit-actions">
                      <AddButton perfume={e.perfume} />
                      {e.perfume.sample_price !== undefined && !e.perfume.sold_out && (
                        <SampleButton perfume={e.perfume} />
                      )}
                    </div>
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
    queryKey: ["today", lang, api.todayDate(), api.currentChartId()],
    enabled: open,
    queryFn: async () => {
      const today = await api.getToday(api.currentChartId(), api.todayDate(), lang);
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
              <SolarSystem />
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

/** Names the ritual and the top perfume picked for this chart under an Ask answer. */
function AskPairing({ chartId, ritualId, perfumeId }: { chartId: string; ritualId: string; perfumeId?: string }) {
  const { t, lang, word } = useLanguage();
  const ritualQ = useQuery({
    queryKey: ["ritual", ritualId, lang],
    queryFn: () => api.getRitual(ritualId, lang),
  });
  const capsuleQ = useQuery({
    queryKey: ["capsule", chartId, ritualId, lang],
    queryFn: () => api.getCapsule(chartId, lang, ritualId),
  });
  const pick = capsuleQ.data?.find((entry) => entry.perfume.id === perfumeId) ?? capsuleQ.data?.[0];
  if (!ritualQ.data || !pick) return null;
  const notes = [...pick.perfume.top_notes, ...pick.perfume.heart_notes].slice(0, 3).map(word).join(", ");
  return (
    <div className="cell ask-pairing">
      <p className="label muted">{t.askPairTitle}</p>
      <p>
        {t.askPairLine
          .replace("{ritual}", ritualQ.data.title)
          .replace("{perfume}", perfumeName(pick.perfume, lang))
          .replace("{notes}", notes)}
      </p>
      <p className="small muted">{pick.reason}</p>
      <Link to="/shop/$id" params={{ id: pick.perfume.id }} className="label">
        {t.askPairBottle}
      </Link>
    </div>
  );
}

export function PersonalCard({ value }: { value: api.VoiceReading }) {
  const { t } = useLanguage();
  return (
    <section className="personal-card stack">
      <div>
        <p className="label muted">{t.personalTruth}</p>
        <p>{value.truth}</p>
      </div>
      <div>
        <p className="label muted">{t.personalCost}</p>
        <p>{value.cost}</p>
      </div>
      <article className="personal-perfume">
        <p className="label muted">{t.personalScent}</p>
        <Link to="/shop/$id" params={{ id: value.perfume.id }} className="product-name">{value.perfume.name}</Link>
        <p>{value.scent}</p>
      </article>
      <p>{value.ritual}</p>
      <Button asChild><Link to="/rituals/$id" params={{ id: value.ritualId }}>{t.beginRitual}</Link></Button>
    </section>
  );
}
