import type { Perfume, Prefs } from "@/data/types";

export type Exclusion =
  { kind: "soldOut" } | { kind: "avoid"; term: string } | { kind: "style" } | { kind: "budget" };

/** Linear-interpolated quantile of sorted numbers. */
function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return Infinity;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

/** Lower and upper price tertiles of the non-sold-out catalogue. */
export function priceTertiles(catalogue: Perfume[]): { low: number; mid: number } {
  const prices = catalogue
    .filter((p) => !p.sold_out && !p.details_pending)
    .map((p) => p.price)
    .sort((a, b) => a - b);
  return { low: quantile(prices, 1 / 3), mid: quantile(prices, 2 / 3) };
}

const searchText = (p: Perfume) =>
  [p.scent_family, ...p.top_notes, ...p.heart_notes, ...p.base_notes].join(" ").toLowerCase();

/** Why a perfume is excluded, or null when it passes. */
export function exclusionFor(
  p: Perfume,
  prefs: Prefs | undefined,
  tertiles: { low: number; mid: number },
): Exclusion | null {
  if (p.sold_out) return { kind: "soldOut" };
  if (!prefs) return null;
  const text = searchText(p);
  const term = prefs.avoid.map((a) => a.trim().toLowerCase()).find((a) => a && text.includes(a));
  if (term) return { kind: "avoid", term };
  if (!p.details_pending && prefs.style && prefs.style !== "any" && p.style !== prefs.style && p.style !== "unisex")
    return { kind: "style" };
  if (!p.details_pending && prefs.budget === "low" && p.price > tertiles.low) return { kind: "budget" };
  if (!p.details_pending && prefs.budget === "mid" && p.price > tertiles.mid) return { kind: "budget" };
  return null;
}

export function applyFilters(catalogue: Perfume[], prefs?: Prefs) {
  const tertiles = priceTertiles(catalogue);
  const eligible: Perfume[] = [];
  const excluded: { perfume: Perfume; why: Exclusion }[] = [];
  for (const p of catalogue) {
    const why = exclusionFor(p, prefs, tertiles);
    if (why) excluded.push({ perfume: p, why });
    else eligible.push(p);
  }
  return { eligible, excluded, tertiles };
}
