import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/provider";
import { useStore } from "@/data/context";
import * as api from "@/data/api";
import { StateMessage } from "./shared";

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
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(false);
  const { profile, prefs } = useStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    // Runs in the browser only; birth details never leave the device.
    void (async () => {
      try {
        const started = performance.now();
        const chart = await api.computeChart(profile);
        if (cancelled) return;
        const rec = api.storeChart(profile.name, chart, prefs, profile);
        api.logDebug(`chart ${rec.id} in ${Math.round(performance.now() - started)}ms (${api.storageEngine})`);
        // Drop any cached chart reads so every screen shows the new chart.
        await queryClient.invalidateQueries({ queryKey: ["chart"] });
        if (cancelled) return;
        setReady(true);
      } catch (e) {
        api.logDebug(`compute failed: ${e instanceof Error ? e.message : "unknown"}`);
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile, prefs, attempt, queryClient]);

  useEffect(() => {
    if (failed) return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const msg = setInterval(() => {
      setIndex((i) => (i + 1) % 3);
      setLetters(0);
    }, 2000);
    const f = setInterval(() => setFact((i) => (i + 1) % 4), 4000);
    return () => {
      clearInterval(msg);
      clearInterval(f);
    };
  }, [failed]);

  // Advance once the chart is really ready, with a short minimum so the screen doesn't flash.
  useEffect(() => {
    if (!ready) return;
    const done = setTimeout(() => navigate({ to: "/chart/reveal" }), 700);
    return () => clearTimeout(done);
  }, [ready, navigate]);

  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => setLetters((n) => n + 1), 35);
    return () => clearInterval(timer);
  }, [index, reduced]);

  const message = messages[index];
  if (failed)
    return (
      <div className="ink chart-loading">
        <StateMessage
          message={t.chartComputeError}
          retry={() => {
            setFailed(false);
            setAttempt((n) => n + 1);
          }}
        />
      </div>
    );
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
