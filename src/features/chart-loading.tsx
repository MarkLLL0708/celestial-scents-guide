import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useLanguage } from "@/i18n/provider";

export function CrescentSpinner() {
  return (
    <svg className="crescent-spinner" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M24 4A20 20 0 1 1 6.7 34"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="24" cy="4" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function ChartLoading() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const messages = [t.loading1, t.loading2, t.loading3];
  const facts = [t.fact1, t.fact2, t.fact3, t.fact4];
  const [index, setIndex] = useState(0);
  const [letters, setLetters] = useState(0);
  const [fact, setFact] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const msg = setInterval(() => {
      setIndex((i) => (i + 1) % 3);
      setLetters(0);
    }, 2000);
    const f = setInterval(() => setFact((i) => (i + 1) % 4), 4000);
    const done = setTimeout(() => navigate({ to: "/chart/reveal" }), 3000);
    return () => {
      clearInterval(msg);
      clearInterval(f);
      clearTimeout(done);
    };
  }, [navigate]);

  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => setLetters((n) => n + 1), 35);
    return () => clearInterval(timer);
  }, [index, reduced]);

  const message = messages[index];
  return (
    <div className="ink chart-loading">
      <CrescentSpinner />
      <p className="label" aria-hidden="true">
        {reduced ? message : message.slice(0, letters)}
      </p>
      <span className="sr-only" aria-live="polite">
        {message}
      </span>
      <p className="label muted chart-fact">{facts[fact]}</p>
    </div>
  );
}
