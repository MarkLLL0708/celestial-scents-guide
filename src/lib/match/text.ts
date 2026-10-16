import type { Dictionary } from "@/i18n/en";
import type { MatchPlacement } from "@/config/scentMap";
import { strongestPlacement } from "./score";
import type { Pick } from "./shelf";

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const planetName = (d: Dictionary, p: MatchPlacement) =>
  d[`planet${cap(p)}` as keyof Dictionary];
const signName = (d: Dictionary, s: string) => d[s as keyof Dictionary] ?? s;
const familyName = (d: Dictionary, f: string) => (d[f as keyof Dictionary] ?? f).toLowerCase();
const noteName = (d: Dictionary, s: string) => d[`note${s.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/[^a-zA-Z]/g, "")}` as keyof Dictionary] ?? d[s as keyof Dictionary] ?? s;

function list(d: Dictionary, xs: string[]): string {
  if (xs.length <= 1) return xs.join("");
  return `${xs.slice(0, -1).join(", ")}${d.listAnd}${xs[xs.length - 1]}`;
}
const fill = (tpl: string, v: Record<string, string>) =>
  Object.entries(v).reduce((s, [k, x]) => s.replaceAll(`{${k}}`, x), tpl);

/** Small evidence label, upper case, and one reason sentence. */
export function describePick(d: Dictionary, pick: Pick): { evidence: string; reason: string } {
  if (pick.kind === "week") {
    const notes = pick.matched.slice(0, 3).map((n) => noteName(d,n));
    const shown = notes.length ? notes : [familyName(d, pick.perfume.scent_family)];
    return {
      evidence: fill(d.evidenceWeek, {
        ritual: pick.ritual.title,
        notes: shown.join(", "),
      }).toUpperCase(),
      reason: fill(d.matchWeekReason, { ritual: pick.ritual.title, notes: list(d, shown) }),
    };
  }
  if (!pick.breakdown.placements.length) return { evidence: "", reason: "" };
  const { placement, parts } = strongestPlacement(pick.breakdown);
  const planet = planetName(d, placement);
  const sign = signName(d, parts.sign);
  const notes = parts.matchedNotes.slice(0, 3).map((n) => noteName(d,n));
  const family = familyName(d, pick.perfume.scent_family);
  if (pick.kind === "shadow")
    return {
      evidence: fill(d.evidenceShadow, { planet, sign }).toUpperCase(),
      reason: fill(d.matchShadowReason, {
        planet,
        sign,
        notes: notes.length ? list(d, notes) : family,
      }),
    };
  if (!notes.length)
    return {
      evidence: fill(d.evidenceFamily, { planet, sign, family }).toUpperCase(),
      reason: fill(d.matchChartFamily, { planet, sign, family }),
    };
  const count = [d.matchHasOne, d.matchHasTwo, d.matchHasThree][notes.length - 1];
  return {
    evidence: fill(d.evidenceChart, { planet, sign, notes: notes.join(", ") }).toUpperCase(),
    reason: fill(d.matchChartReason, { planet, sign, notes: list(d, notes), count }),
  };
}
