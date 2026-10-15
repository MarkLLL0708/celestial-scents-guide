import * as Astronomy from "astronomy-engine";

export const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;
export type Sign = (typeof SIGNS)[number];
export const BODIES = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"] as const;
export type Body = (typeof BODIES)[number];
export type Longitudes = Record<Body, number>;

export const norm = (d: number) => ((d % 360) + 360) % 360;

/** Geocentric, tropical (equinox of date) ecliptic longitude, in degrees. */
function tropicalLongitude(v: Astronomy.Vector, time: Astronomy.AstroTime): number {
  const rot = Astronomy.Rotation_EQJ_ECT(time);
  return norm(Astronomy.SphereFromVector(Astronomy.RotateVector(rot, v)).lon);
}

export function bodyLongitudes(utc: Date): Longitudes {
  const time = Astronomy.MakeTime(utc);
  const g = (b: Astronomy.Body) => tropicalLongitude(Astronomy.GeoVector(b, time, true), time);
  return {
    sun: g(Astronomy.Body.Sun),
    moon: tropicalLongitude(Astronomy.GeoMoon(time), time),
    mercury: g(Astronomy.Body.Mercury),
    venus: g(Astronomy.Body.Venus),
    mars: g(Astronomy.Body.Mars),
    jupiter: g(Astronomy.Body.Jupiter),
    saturn: g(Astronomy.Body.Saturn),
  };
}

/** Ascendant longitude; east longitude is positive. Null above 66° latitude. */
export function ascendant(utc: Date, lat: number, lon: number): number | null {
  if (Math.abs(lat) > 66) return null;
  const time = Astronomy.MakeTime(utc);
  const lst = (((Astronomy.SiderealTime(time) * 15 + lon) % 360) * Math.PI) / 180;
  const T = time.tt / 36525;
  const eps = ((23.439291 - 0.0130042 * T) * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  return norm(
    (Math.atan2(
      Math.cos(lst),
      -(Math.sin(lst) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)),
    ) *
      180) /
      Math.PI,
  );
}

export const signOf = (lon: number): { sign: Sign; degree: number } => ({
  sign: SIGNS[Math.floor(norm(lon) / 30)],
  degree: norm(lon) % 30,
});
