import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, ThumbsUp, ThumbsDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/provider";
import { useStore } from "@/data/context";
import * as api from "@/data/api";
import { demoChart, perfumes } from "@/data/seed";
import type { Chart, ChartResult, Evidence, Match } from "@/data/types";
import { ProductCard } from "@/components/scent/product";
import {
  PlacementBadge,
  PlacementRow,
  ElementBar,
  SectionHeader,
  Skeleton,
} from "@/components/scent/controls";
import { ScentDialog } from "@/components/scent/dialog";
import { CrescentSpinner } from "./chart-loading";
import { StateMessage } from "./shared";

const glyphs: Record<Evidence["planet"], string> = {
  sun: "☉",
  moon: "☽",
  rising: "↑",
  venus: "♀",
  mars: "♂",
  mercury: "☿",
};

export function GrainDisc() {
  return (
    <svg className="grain-disc" viewBox="0 0 160 160" fill="none" aria-hidden="true">
      <defs>
        <pattern id="grain" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.5" fill="currentColor" opacity="0.5" />
          <circle cx="4" cy="3.5" r="0.4" fill="currentColor" opacity="0.35" />
          <circle cx="2.5" cy="5" r="0.35" fill="currentColor" opacity="0.4" />
        </pattern>
      </defs>
      <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="1" opacity="0.9" />
      <circle cx="80" cy="80" r="66" fill="url(#grain)" stroke="currentColor" strokeWidth="0.5" />
      <path d="M22 62A62 62 0 0 1 96 20" stroke="currentColor" strokeWidth="2" opacity="0.8" />
    </svg>
  );
}

export function FeedbackRow() {
  const { t } = useLanguage();
  const { notify } = useStore();
  const [choice, setChoice] = useState<"up" | "down" | null>(null);
  const pick = (v: "up" | "down") => {
    setChoice(v);
    notify(t.feedbackThanks);
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

export function EvidenceCell({ evidence }: { evidence: Evidence }) {
  const { t, word } = useLanguage();
  return (
    <div className="evidence-cell">
      <span className="label">
        {glyphs[evidence.planet]} {t[evidence.planet]} {word(evidence.sign).toUpperCase()}
      </span>
      <span className="label">{t[evidence.why as keyof typeof t]}</span>
    </div>
  );
}

function MatchCard({ match, variant = "grid" }: { match: Match; variant?: "grid" | "signature" | "shadow" }) {
  return (
    <div className="match-card">
      <ProductCard
        perfume={match.perfume}
        variant={variant}
        score={match.score}
        reason={match.reason}
      />
      {match.evidence && <EvidenceCell evidence={match.evidence} />}
    </div>
  );
}

export function RevealPage({ state = "" }: { state?: string }) {
  const { t, word } = useLanguage();
  const { profile } = useStore();
  const [forced, setForced] = useState(state);
  useEffect(() => setForced(state), [state]);
  const unknownTime = profile.hour === null || forced === "unknown-time";
  const rising = unknownTime ? null : demoChart.rising;

  if (forced === "loading")
    return (
      <div className="ink chart-loading">
        <GrainDisc />
        <Skeleton />
      </div>
    );
  if (forced === "error")
    return (
      <div className="ink chart-loading">
        <GrainDisc />
        <StateMessage message={t.revealError} retry={() => setForced("")} />
      </div>
    );

  return (
    <div className="ink reveal-screen">
      <div className="reveal-top">
        <GrainDisc />
        <p className="label reveal-line">
          ☉ {word(demoChart.sun)} ☽ {word(demoChart.moon)} ↑ {rising ? word(rising) : "—"}
        </p>
        <div className="reveal-traits">
          <p>{t.trait1}</p>
          <p>{t.trait2}</p>
          <p>{t.trait3}</p>
        </div>
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

function buildDemoResult(): ChartResult {
  return {
    id: "demo",
    profile: { name: "Demo", day: 1, month: 2, year: 1995, hour: 12, minute: 0, city: "Hanoi", country: "Vietnam" },
    chart: demoChart,
    prefs: { avoid: [], style: "any", budget: "any" },
    recs: {
      signature: { perfume: perfumes[0], score: 94, reason: "", evidence: { planet: "sun", sign: demoChart.sun, why: "why1" } },
      others: perfumes.slice(1, 5).map((p, i) => ({
        perfume: p,
        score: [88, 84, 79, 73][i],
        reason: "",
        evidence: { planet: (["moon", "rising", "venus", "mars"] as const)[i], sign: [demoChart.moon, demoChart.rising ?? demoChart.sun, demoChart.venus, demoChart.mars][i], why: `why${i + 2}` },
      })),
      shadow: { perfume: perfumes[5], score: 61, reason: "", evidence: { planet: "mercury", sign: demoChart.mercury, why: "why6" } },
    },
    date: "2026-10-14",
  };
}

function ShareDialog({
  open,
  onOpenChange,
  result,
  reasons,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  result: ChartResult;
  reasons: Record<string, string>;
}) {
  const { t, word, lang } = useLanguage();
  const { notify } = useStore();
  const [phase, setPhase] = useState<"generating" | "ready" | "failed">("generating");
  useEffect(() => {
    if (!open) return;
    setPhase("generating");
    const timer = setTimeout(() => setPhase("ready"), 1200);
    return () => clearTimeout(timer);
  }, [open]);
  const download = async () => {
    try {
      const { toPng } = await import("html-to-image");
      const node = document.querySelector<HTMLElement>(".share-card");
      if (!node) throw new Error("missing");
      const url = await toPng(node, { width: 1080, height: 1920 });
      const a = document.createElement("a");
      a.href = url;
      a.download = "natal-notes-chart.png";
      a.click();
    } catch {
      setPhase("failed");
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify(t.copied);
    } catch {
      notify(t.copyError, "error");
    }
  };
  return (
    <ScentDialog open={open} onOpenChange={onOpenChange} title={t.shareTitle} description={t.shareDescription}>
      {phase === "generating" ? (
        <div className="stack" aria-busy="true">
          <p className="label muted">{t.generating}</p>
          <Skeleton />
        </div>
      ) : phase === "failed" ? (
        <StateMessage message={t.shareFailed} retry={() => setPhase("generating")} />
      ) : (
        <>
          <div className="share-preview">
            <div className="share-scaled">
              <div className="share-card">
                <div>
                  <p className="label">{result.profile.name.toUpperCase()}</p>
                  <p className="share-sign">
                    {word(result.chart.sun)} / {word(result.chart.moon)} /{" "}
                    {result.chart.rising ? word(result.chart.rising) : "—"}
                  </p>
                </div>
                <div>
                  <p className="share-perfume">{result.recs.signature.perfume.name}</p>
                  <p>{reasons[result.recs.signature.perfume.id] ?? t.acc1Text}</p>
                </div>
                <p className="label">{t.brand.toUpperCase()} — {t.chartUrl}</p>
              </div>
            </div>
          </div>
          <div className="stack">
            <Button onClick={download}>{t.download}</Button>
            <Button variant="secondary" onClick={copy}>
              {t.copyLink}
            </Button>
          </div>
        </>
      )}
    </ScentDialog>
  );
}

export function ResultPage({ id, state = "" }: { id: string; state?: string }) {
  const { t, word, lang } = useLanguage();
  const store = useStore();
  const [forced, setForced] = useState(state);
  const [shareOpen, setShareOpen] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  useEffect(() => setForced(state), [state]);

  const result = store.result && store.result.id === id ? store.result : buildDemoResult();
  const readingQuery = useQuery({
    queryKey: ["reading", lang, id],
    queryFn: () => api.getReading(result.chart, result.recs, lang),
  });

  if (forced === "loading")
    return (
      <div className="narrow stack">
        <Skeleton />
        <Skeleton />
      </div>
    );
  if (forced === "no-matches")
    return (
      <div className="narrow">
        <StateMessage message={t.noMatches}>
          <Button asChild>
            <Link to="/chart/new" search={{ step: 5, state: "" }}>
              {t.edit}
            </Link>
          </Button>
        </StateMessage>
      </div>
    );

  const { chart, recs } = result;
  const unknownTime = result.profile.hour === null || forced === "unknown-time";
  const reading = readingQuery.data;
  const readingError = forced === "error" || readingQuery.isError;
  const reasons = reading?.reasons ?? {};
  const reason = (m: Match) => reasons[m.perfume.id] ?? m.reason;

  const sections = [
    { key: "acc1", text: "acc1Text" },
    { key: "acc2", text: "acc2Text" },
    { key: "acc3", text: "acc3Text" },
    { key: "acc4", text: "acc4Text" },
    { key: "acc5", text: "acc5Text" },
  ] as const;

  return (
    <div className="narrow">
      <section className="result-section">
        <p className="label">{result.profile.name}</p>
        <div className="placement-grid">
          <PlacementBadge label={t.sun} sign={chart.sun} index={0} />
          <PlacementBadge label={t.moon} sign={chart.moon} index={1} />
          <PlacementBadge label={t.rising} sign={unknownTime ? null : chart.rising} index={2} />
        </div>
        {unknownTime && <p className="small muted">{t.noRising}</p>}
      </section>

      <section className="result-section">
        <SectionHeader>{t.chart}</SectionHeader>
        <PlacementRow label={t.venus} value={word(chart.venus)} explanation={t.venusReading} />
        <PlacementRow label={t.mars} value={word(chart.mars)} explanation={t.marsReading} />
        <PlacementRow label={t.mercury} value={word(chart.mercury)} explanation={t.mercuryReading} />
      </section>

      <section className="result-section">
        <SectionHeader>{t.nose}</SectionHeader>
        <ElementBar label={t.fire} value={chart.elements.fire} />
        <ElementBar label={t.earth} value={chart.elements.earth} />
        <ElementBar label={t.air} value={chart.elements.air} />
        <ElementBar label={t.water} value={chart.elements.water} />
        <p className="label muted mt-8">{t.dominant}</p>
        <p className="question">{word(recs.signature.perfume.scent_family)}</p>
        <div className="chips mt-6">
          {t.keywords.split(", ").map((k) => (
            <span className="label" key={k}>
              {k}
            </span>
          ))}
        </div>
      </section>

      <section className="result-section">
        {readingQuery.isPending ? (
          <Skeleton />
        ) : readingError ? (
          <StateMessage message={t.readingError} retry={() => readingQuery.refetch()} />
        ) : (
          <Accordion.Root type="single" defaultValue="acc1" collapsible className="reading-accordion">
            {sections.map((s) => (
              <Accordion.Item value={s.key} key={s.key} className="reading-item">
                <Accordion.Header>
                  <Accordion.Trigger className="reading-trigger">
                    <span>{t[s.key]}</span>
                    <ChevronDown size={18} aria-hidden="true" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="reading-content">
                  <p>{t[s.text]}</p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        )}
        <FeedbackRow />
      </section>

      <section className="result-section">
        <SectionHeader>{t.signature}</SectionHeader>
        <MatchCard match={{ ...recs.signature, reason: reason(recs.signature) }} variant="signature" />
        <p className="small muted mt-4">{t.signatureSub}</p>
        <FeedbackRow />
        <p className="small muted italic mt-6">{t.tendencies}</p>
        <Link to="/ask" className="ask-banner">
          <span className="label">{t.askBanner}</span>
        </Link>
      </section>

      <section className="result-section">
        <SectionHeader>{t.also}</SectionHeader>
        <div className="products result-products">
          {recs.others.map((m) => (
            <MatchCard key={m.perfume.id + m.score} match={{ ...m, reason: reason(m) }} />
          ))}
        </div>
      </section>

      <section className="result-section">
        <SectionHeader>{t.shadow}</SectionHeader>
        <p className="small muted mb-6">{t.shadowSub}</p>
        <MatchCard match={{ ...recs.shadow, reason: reason(recs.shadow) }} variant="shadow" />
      </section>

      <section className="result-section stack">
        {store.user ? (
          <Button
            variant="secondary"
            disabled={savedOnce}
            onClick={async () => {
              await api.saveChart(result);
              setSavedOnce(true);
              store.notify(t.saved);
            }}
          >
            {t.save}
          </Button>
        ) : (
          <p className="small muted">
            {t.guest}{" "}
            <Link to="/login" className="underline">
              {t.navLogin}
            </Link>
          </p>
        )}
        <Button variant="secondary" onClick={() => setShareOpen(true)}>
          {t.share}
        </Button>
        <Button asChild variant="text">
          <Link to="/chart/new" search={{ step: 1, state: "" }}>
            {t.again}
          </Link>
        </Button>
        <p className="small muted">{t.disclaimer}</p>
      </section>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} result={result} reasons={reasons} />
    </div>
  );
}

const categories = ["catDaily", "catDate", "catWork", "catEvening"] as const;
const questionKeys: Record<(typeof categories)[number], string[]> = {
  catDaily: ["qDaily1", "qDaily2", "qDaily3", "qDaily4", "qDaily5", "qDaily6", "qDaily7", "qDaily8"],
  catDate: ["qDate1", "qDate2", "qDate3", "qDate4", "qDate5", "qDate6", "qDate7", "qDate8"],
  catWork: ["qWork1", "qWork2", "qWork3", "qWork4", "qWork5", "qWork6", "qWork7", "qWork8"],
  catEvening: ["qEvening1", "qEvening2", "qEvening3", "qEvening4", "qEvening5", "qEvening6", "qEvening7", "qEvening8"],
};

export function AskPage({ state = "" }: { state?: string }) {
  const { t } = useLanguage();
  const store = useStore();

  const [category, setCategory] = useState<(typeof categories)[number]>("catDaily");
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "answered" | "error">(
    state === "loading" ? "loading" : state === "answered" ? "answered" : state === "error" ? "error" : "idle",
  );
  const [answer, setAnswer] = useState<api.AskAnswer | null>(null);
  const [asked, setAsked] = useState("");
  const chart: Chart = store.result?.chart ?? demoChart;
  const questions = questionKeys[category];
  const suggestedPerfume = answer ? perfumes.find((p) => p.id === answer.perfumeId) : null;

  const ask = async (q: string) => {
    if (!q.trim()) return;
    setAsked(q);
    setPhase("loading");
    try {
      setAnswer(await api.askNotes(q, chart));
      setPhase("answered");
    } catch {
      setPhase("error");
    }
  };

  return (
    <div className="ink ask-screen">
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
        <p className="label">{t.askTitle}</p>
        <span className="chart-step-spacer" aria-hidden="true" />
      </header>

      <div className="ask-body">
        <div className="ask-tabs" role="tablist" aria-label={t.categories}>
          {categories.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={category === c}
              className={`label ask-tab ${category === c ? "ask-tab-active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {t[c]}
            </button>
          ))}
        </div>

        {phase === "loading" ? (
          <div className="ask-loading">
            <CrescentSpinner />
            <p className="label muted">{t.askLoading}</p>
          </div>
        ) : phase === "error" ? (
          <StateMessage message={t.askError} retry={() => ask(asked || question)} />
        ) : phase === "answered" && answer ? (
          <div className="ask-answer">
            <div className="ask-cell">
              <p className="label muted">{t.youAsked}</p>
              <p className="question">“{asked}”</p>
            </div>
            <div className="ask-cell ask-evidence">
              <svg className="placement-glyph" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <path d="M27 8A13 13 0 1 0 27 32A14 14 0 0 1 27 8Z" stroke="currentColor" />
              </svg>
              <p className="label">{t.askEvidence}</p>
            </div>
            <div className="ask-cell">
              <p>{t.askAnswer}</p>
              {suggestedPerfume && (
                <div className="mt-8">
                  <p className="label muted mb-4">{t.suggestedPerfume}</p>
                  <ProductCard perfume={suggestedPerfume} compact />
                </div>
              )}
            </div>
            <div className="ask-cell">
              <FeedbackRow />
              <p className="small muted italic mt-4">{t.tendencies}</p>
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
                {questions.map((k) => (
                  <li key={k}>
                    <button className="label ask-question" onClick={() => setQuestion(t[k as keyof typeof t])}>
                      {t[k as keyof typeof t]}
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
          ask(question);
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
        <Button type="submit" disabled={!question.trim() || phase === "loading"}>
          {t.askButton}
        </Button>
      </form>
    </div>
  );
}
