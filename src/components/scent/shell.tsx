import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag, X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/provider";
import { useStore } from "@/data/context";
import { Logo } from "./artwork";
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
  { to: "/", key: "tabHome" },
  { to: "/chart/new", key: "tabChart" },
  { to: "/shop", key: "tabShop" },
  { to: "/cart", key: "tabCart" },
  { to: "/you", key: "tabYou" },
] as const;
export function Header() {
  const { t } = useLanguage();
  const { cartItems } = useStore();
  const count = cartItems.reduce((n, p) => n + p.quantity, 0);
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
        <Link to="/shop">{t.navShop}</Link>
        <Link to="/you">{t.navYou}</Link>
        <Link to="/login">{t.navLogin}</Link>
      </nav>
      <div className="header-tools">
        <LanguageToggle />
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
  const { cartItems } = useStore();
  const count = cartItems.reduce((n, p) => n + p.quantity, 0);
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="tab-bar" aria-label={t.tabsLabel}>
      {tabs.map((tab) => {
        const active =
          tab.to === "/" ? path === "/" : path.startsWith(tab.to === "/chart/new" ? "/chart" : tab.to);
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`label tab ${active ? "tab-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {t[tab.key]}
            {tab.key === "tabCart" && count > 0 && <span className="tab-count"> {count}</span>}
          </Link>
        );
      })}
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
