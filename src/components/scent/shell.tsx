import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Flame, MessageCircle, Orbit, ShoppingBag, Sun, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import * as api from "@/data/api";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/provider";
import { useStore } from "@/data/context";
import { Logo } from "./artwork";
export function PageBack() {
  const router = useRouter();
  const { t } = useLanguage();
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path === "/" || path === "/chart/new" || path === "/ask" || path.includes("/read/")) return null;
  return (
    <div className="relative z-10 mx-auto w-full max-w-[1100px] px-6 py-3">
      <Button
        variant="text"
        aria-label={t.back}
        title={t.back}
        onClick={() => {
          if (router.history.canGoBack()) router.history.back();
          else void router.navigate({ to: "/" });
        }}
      >
        <ArrowLeft size={20} aria-hidden="true" /> {t.back}
      </Button>
    </div>
  );
}
export function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();
  return (
    <div className="language" role="group" aria-label={t.language}>
      <Button
        variant="text"
        className="lang-button"
        aria-pressed={lang === "en"}
        onClick={() => setLang("en")}
      >
        EN
      </Button>
      <span className="small muted" aria-hidden="true">
        /
      </span>
      <Button
        variant="text"
        className="lang-button"
        aria-pressed={lang === "vi"}
        onClick={() => setLang("vi")}
      >
        VI
      </Button>
    </div>
  );
}
const tabs = [
  { to: "/today", key: "tabToday", nav: "navToday", match: "/today", Icon: Sun },
  { to: "/tu-vi", key: "tabChart", nav: "navChart", match: "/tu-vi", Icon: Orbit },
  { to: "/ask", key: "tabAsk", nav: "navAsk", match: "/ask", Icon: MessageCircle },
  { to: "/rituals", key: "tabRituals", nav: "navRituals", match: "/rituals", Icon: Flame },
] as const;
function useNav() {

  const path = useRouterState({ select: (s) => s.location.pathname });
  return tabs.map((tab) => ({
    ...tab,
    href: tab.to,
    active: path.startsWith(tab.match),
  }));
}
export function Header() {
  const { t } = useLanguage();
  const { cartItems } = useStore();
  const count = cartItems.reduce((n, p) => n + p.quantity, 0);
  const nav = useNav();
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="site-header">
      <Link to="/" className="wordmark">
        <Logo />
        {t.brand}
      </Link>
      <Link to="/" className="label mobile-wordmark">
        {t.brand}
      </Link>
      <nav className="header-nav" aria-label={t.tabsLabel}>
        {nav.map((n) => (
          <Link key={n.to} to={n.href} aria-current={n.active ? "page" : undefined}>
            {t[n.nav]}
          </Link>
        ))}
      </nav>
      <div className="header-tools">
        <Link
          to="/shop"
          className="shop-link"
          aria-current={path.startsWith("/shop") ? "page" : undefined}
        >
          {t.navShop}
        </Link>
        <LanguageToggle />
        <Link to="/you" className="cart-link" aria-label={t.navYou}>
          <User size={19} />
        </Link>
        <Link to="/cart" className="cart-link" aria-label={`${t.navCart} (${count})`}>
          <ShoppingBag size={19} />
          <span className="label">{String(count).padStart(2, "0")}</span>
        </Link>
      </div>
    </header>
  );
}
export function TabBar() {
  const { t } = useLanguage();
  const nav = useNav();
  return (
    <nav className="tab-bar" aria-label={t.tabsLabel}>
      {nav.map((n) => (
        <Link
          key={n.to}
          to={n.href}
          className={`label tab ${n.active ? "tab-active" : ""}`}
          aria-current={n.active ? "page" : undefined}
        >
          <n.Icon size={24} strokeWidth={1.25} aria-hidden="true" />
          <span>{t[n.key]}</span>
        </Link>
      ))}
    </nav>
  );
}
export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="site-footer">
      <p className="muted">{t.disclaimer}</p>
      <LanguageToggle />
    </footer>
  );
}
export function Toast() {
  const { notice, dismiss } = useStore();
  const { t } = useLanguage();
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(dismiss, 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  return notice ? (
    <div className="toast-stack">
      <div className="toast-item" role={notice.kind === "error" ? "alert" : "status"}>
        <p className="small">{notice.text}</p>
        <Button variant="text" size="icon" aria-label={t.close} onClick={dismiss}>
          <X size={18} />
        </Button>
      </div>
    </div>
  ) : null;
}

/** Diagnostics shown only with ?debug=1. Shows no birth details, only ids, timings and errors. */
export function DebugPanel() {
  const href = useRouterState({ select: (s) => s.location.href });
  const [open, setOpen] = useState(false);
  const [, tick] = useState(0);
  const [start] = useState(() => (typeof performance === "undefined" ? 0 : performance.now()));
  const [nav, setNav] = useState<string[]>([]);
  useEffect(() => {
    setOpen(new URLSearchParams(window.location.search).get("debug") === "1" || sessionStorageFlag());
    setNav((n) => [`${Math.round(performance.now() - start)}ms ${window.location.pathname}`, ...n].slice(0, 6));
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [href, start]);
  if (!open) return null;
  return (
    <aside className="debug-panel small" aria-label="Debug">
      <p>chart: {api.currentChartId()}</p>
      <p>storage: {api.storageEngine}</p>
      {nav.map((n) => <p key={n}>{n}</p>)}
      {api.debugLog.map((l) => <p key={l.at + l.msg}>{l.at} {l.msg}</p>)}
    </aside>
  );
}
function sessionStorageFlag() {
  if (new URLSearchParams(window.location.search).get("debug") === "1") api.safeSet("natal-notes:debug", "1");
  return api.safeGet("natal-notes:debug") === "1";
}
