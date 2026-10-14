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


export function ResultPage({ id, state = "" }: { id: string; state?: string }) {
  const { t } = useLanguage();
  const store = useStore();
  const name = store.result && store.result.id === id ? store.result.profile?.name : undefined;
  if (state === "loading")
    return (
      <div className="narrow stack">
        <Skeleton />
      </div>
    );
  if (state === "error")
    return (
      <div className="narrow">
        <StateMessage message={t.revealError} retry={() => window.location.reload()} />
      </div>
    );
  return (
    <div className="narrow result-simple">
      {name && <p className="label muted">{name}</p>}
      <h1 className="question">{t.resultTitle}</h1>
      <Link to="/today" className="nn-button nn-primary">
        {t.continue}
      </Link>
    </div>
  );
}

const categories = ["catDaily", "catDate", "catWork", "catEvening"] as const;
const questionKeys: Record<(typeof categories)[number], string[]> = {
  catDaily: [
    "qDaily1",
    "qDaily2",
    "qDaily3",
    "qDaily4",
    "qDaily5",
    "qDaily6",
    "qDaily7",
    "qDaily8",
  ],
  catDate: ["qDate1", "qDate2", "qDate3", "qDate4", "qDate5", "qDate6", "qDate7", "qDate8"],
  catWork: ["qWork1", "qWork2", "qWork3", "qWork4", "qWork5", "qWork6", "qWork7", "qWork8"],
  catEvening: [
    "qEvening1",
    "qEvening2",
    "qEvening3",
    "qEvening4",
    "qEvening5",
    "qEvening6",
    "qEvening7",
    "qEvening8",
  ],
};

export function AskPage({ state = "" }: { state?: string }) {
  const { t } = useLanguage();
  const store = useStore();

  const [category, setCategory] = useState<(typeof categories)[number]>("catDaily");
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "answered" | "error">(
    state === "loading"
      ? "loading"
      : state === "answered"
        ? "answered"
        : state === "error"
          ? "error"
          : "idle",
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
                    <button
                      className="label ask-question"
                      onClick={() => setQuestion(t[k as keyof typeof t])}
                    >
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
