import { describe, expect, it } from "vitest";
import { RITUAL_ACTIONS } from "@/lib/reading/balance";
import { firstRitualOfTheme, ritualFor, ritualIds, ritualThemes } from "@/data/astro-mock";

describe("reading ritual destinations", () => {
  it.each(["en", "vi"] as const)("resolves all 24 generated actions in %s", (lang) => {
    expect(RITUAL_ACTIONS).toHaveLength(24);
    for (const action of RITUAL_ACTIONS) {
      expect(ritualIds).toContain(action.id);
      const ritual = ritualFor(action.id, lang);
      expect(ritual).not.toBeNull();
      expect(ritual?.id).toBe(action.id);
      expect(ritual?.steps).toContain(action[lang]);
    }
  });
  it("every theme resolves without assuming new actions have legacy metadata", () => {
    for (const theme of ritualThemes) {
      const id = firstRitualOfTheme(theme);
      expect(ritualFor(id, "en")?.theme).toBe(theme);
    }
  });
  it("keeps unknown destinations missing instead of silently substituting an action", () => {
    expect(ritualFor("does-not-exist", "en")).toBeNull();
    expect(ritualFor("does-not-exist", "vi")).toBeNull();
  });
});