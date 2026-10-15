import { describe, expect, it } from "vitest";
import { ascendant, bodyLongitudes, signOf, type Longitudes } from "@/lib/astro/placements";
import { aspectsBetween } from "@/lib/astro/aspects";
import { computeNatal } from "@/lib/astro/chart";
import { dayFor } from "@/lib/astro/today";

const close = (got: number, want: number) => expect(Math.abs(got - want)).toBeLessThanOrEqual(0.05);
const checkAll = (got: Longitudes, want: Longitudes) =>
  (Object.keys(want) as (keyof Longitudes)[]).forEach((k) => close(got[k], want[k]));

const A = new Date("1992-02-14T01:30:00Z");
const TRANSIT = new Date("2026-10-14T12:00:00Z");

describe("natal placements", () => {
  it("chart A", () => {
    const l = bodyLongitudes(A);
    checkAll(l, {
      sun: 324.607,
      moon: 85.204,
      mercury: 325.939,
      venus: 294.291,
      mars: 296.845,
      jupiter: 161.59,
      saturn: 311.04,
    });
    expect(signOf(l.sun).sign).toBe("Aquarius");
    expect(signOf(l.moon).sign).toBe("Gemini");
    expect(signOf(l.mercury).sign).toBe("Aquarius");
    expect(signOf(l.venus).sign).toBe("Capricorn");
    expect(signOf(l.mars).sign).toBe("Capricorn");
    expect(signOf(l.jupiter).sign).toBe("Virgo");
    expect(signOf(l.saturn).sign).toBe("Aquarius");
    const asc = ascendant(A, 21.0285, 105.8542)!;
    close(asc, 2.217);
    expect(signOf(asc).sign).toBe("Aries");
  });
  it("chart B", () => {
    const t = new Date("2000-01-01T12:00:00Z");
    checkAll(bodyLongitudes(t), {
      sun: 280.369,
      moon: 223.324,
      mercury: 271.889,
      venus: 241.565,
      mars: 327.964,
      jupiter: 25.254,
      saturn: 40.396,
    });
    close(ascendant(t, 51.5074, -0.1278)!, 24.017);
  });
  it("chart C, sun just past the libra boundary", () => {
    const t = new Date("1985-09-23T15:15:00Z");
    const l = bodyLongitudes(t);
    checkAll(l, {
      sun: 180.535,
      moon: 297.829,
      mercury: 181.209,
      venus: 151.845,
      mars: 158.594,
      jupiter: 307.275,
      saturn: 234.2,
    });
    expect(signOf(l.sun).sign).toBe("Libra");
    close(ascendant(t, 10.8231, 106.6297)!, 73.7);
  });
  it("transit instant", () => {
    const l = bodyLongitudes(TRANSIT);
    checkAll(l, {
      sun: 201.161,
      moon: 245.585,
      mercury: 226.043,
      venus: 216.03,
      mars: 129.361,
      jupiter: 141.869,
      saturn: 10.521,
    });
    expect(
      (["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"] as const).map(
        (b) => signOf(l[b]).sign,
      ),
    ).toEqual(["Libra", "Sagittarius", "Scorpio", "Scorpio", "Leo", "Leo", "Aries"]);
  });
});

describe("aspects and today", () => {
  const expected: [string, string, string, number, number, string, string][] = [
    ["saturn", "sextile", "saturn", 0.52, 5, "work", "easy"],
    ["mars", "opposite", "saturn", 1.68, 4, "work", "hard"],
    ["jupiter", "opposite", "sun", 2.74, 3, "luck", "hard"],
    ["sun", "square", "venus", 3.13, 2, "love", "hard"],
    ["sun", "trine", "sun", 3.45, 2, "self", "easy"],
    ["jupiter", "opposite", "mercury", 4.07, 2, "luck", "hard"],
    ["sun", "trine", "moon", 4.04, 1, "self", "easy"],
    ["sun", "trine", "mercury", 4.78, 1, "work", "easy"],
  ];
  it("transit against natal A, exact order", () => {
    const hits = aspectsBetween(bodyLongitudes(TRANSIT), bodyLongitudes(A));
    expect(hits).toHaveLength(expected.length);
    hits.forEach((h, i) => {
      const [tb, asp, nb, orb, strength, theme, kind] = expected[i];
      expect([h.transiting, h.aspect, h.natal, h.strength, h.theme, h.kind]).toEqual([
        tb,
        asp,
        nb,
        strength,
        theme,
        kind,
      ]);
      close(h.orb, orb);
    });
  });
  it("today for natal A", () => {
    const d = dayFor(bodyLongitudes(A), TRANSIT);
    expect(d.working && [d.working.transiting, d.working.aspect, d.working.natal]).toEqual([
      "saturn",
      "sextile",
      "saturn",
    ]);
    expect(d.pushing && [d.pushing.transiting, d.pushing.aspect, d.pushing.natal]).toEqual([
      "mars",
      "opposite",
      "saturn",
    ]);
    expect(d.protect && [d.protect.transiting, d.protect.aspect, d.protect.natal]).toEqual([
      "jupiter",
      "opposite",
      "sun",
    ]);
    expect(d.tone).toEqual({ self: 2, love: 2, work: 5, luck: 3 });
    expect(d.ritualTheme).toBe("calm");
  });
});

describe("computeNatal", () => {
  const hanoi = { lat: 21.0285, lon: 105.8542, timezone: "Asia/Bangkok" };
  it("Hanoi 14 Oct 2000, 11:10 to 13:00 local", () => {
    for (const [hour, minute] of [
      [11, 10],
      [12, 0],
      [13, 0],
    ]) {
      const c = computeNatal({ year: 2000, month: 10, day: 14, hour, minute, ...hanoi });
      expect(c.details.sun.sign).toBe("Libra");
      expect(c.details.moon.sign).toBe("Taurus");
      expect(c.details.rising?.sign).toBe("Capricorn");
    }
  });
  it("test A through the local-time path", () => {
    const c = computeNatal({ year: 1992, month: 2, day: 14, hour: 8, minute: 30, ...hanoi });
    expect(c.utc.toISOString()).toBe("1992-02-14T01:30:00.000Z");
    expect(c.details.rising?.sign).toBe("Aries");
  });
  it("unknown birth time: no rising, natal moon skipped", () => {
    const c = computeNatal({ year: 2000, month: 10, day: 14, hour: null, minute: null, ...hanoi });
    expect(c.details.rising).toBeNull();
    expect(c.birthTimeKnown).toBe(false);
    const hits = aspectsBetween(bodyLongitudes(TRANSIT), c.longitudes, { skipNatal: ["moon"] });
    expect(hits.some((h) => h.natal === "moon")).toBe(false);
  });
  it("element and modality totals equal 100", () => {
    for (const hour of [null, 8]) {
      const c = computeNatal({ year: 1992, month: 2, day: 14, hour, minute: 30, ...hanoi });
      expect(Object.values(c.elements).reduce((a, b) => a + b, 0)).toBe(100);
      expect(Object.values(c.modalities).reduce((a, b) => a + b, 0)).toBe(100);
    }
  });
  it("latitude 70 gives no rising", () => {
    expect(ascendant(A, 70, 20)).toBeNull();
    const c = computeNatal({
      year: 1992,
      month: 2,
      day: 14,
      hour: 8,
      minute: 30,
      lat: 70,
      lon: 25,
      timezone: "Europe/Oslo",
    });
    expect(c.details.rising).toBeNull();
  });
});
