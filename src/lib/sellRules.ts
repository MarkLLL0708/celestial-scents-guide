// Soft-sell rules: astrology first, perfume last. Screens and ProductCard read these.
const clean = (path: string) => path.replace(/\/+$/, "") || "/";

/** Screens where no price, add-to-cart or product card may appear. */
export function isNoSellScreen(path: string): boolean {
  const p = clean(path);
  if (p === "/" || p === "/today" || p === "/ask") return true;
  if (/^\/chart\/result\/[^/]+$/.test(p)) return true;
  if (/^\/chart\/result\/[^/]+\/read\/[^/]+$/.test(p)) return true;
  if (p.startsWith("/chart/")) return !/\/shelf$/.test(p);
  return false;
}

export function allowsPrice(path: string): boolean {
  return !isNoSellScreen(path);
}

/** Most product cards a screen may show. */
export function maxProductCards(path: string): number {
  const p = clean(path);
  if (isNoSellScreen(p)) return 0;
  if (/^\/chart\/result\/[^/]+\/shelf$/.test(p)) return 3;
  if (p === "/shop" || p === "/design" || p.startsWith("/admin")) return Infinity;
  return 1;
}

export const RITUAL_WORKS_WITH_ANY_PERFUME = true;
