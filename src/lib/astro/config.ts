import type { Sign } from "./placements";

/** Weights for element and modality totals. Rising is dropped and the rest rescaled when unknown. */
export const PLACEMENT_WEIGHTS = {
  sun: 25,
  moon: 25,
  rising: 20,
  venus: 15,
  mars: 10,
  mercury: 5,
} as const;
export type WeightedPlacement = keyof typeof PLACEMENT_WEIGHTS;

export const ELEMENT_OF: Record<Sign, "fire" | "earth" | "air" | "water"> = {
  Aries: "fire",
  Leo: "fire",
  Sagittarius: "fire",
  Taurus: "earth",
  Virgo: "earth",
  Capricorn: "earth",
  Gemini: "air",
  Libra: "air",
  Aquarius: "air",
  Cancer: "water",
  Scorpio: "water",
  Pisces: "water",
};
export const MODALITY_OF: Record<Sign, "cardinal" | "fixed" | "mutable"> = {
  Aries: "cardinal",
  Cancer: "cardinal",
  Libra: "cardinal",
  Capricorn: "cardinal",
  Taurus: "fixed",
  Leo: "fixed",
  Scorpio: "fixed",
  Aquarius: "fixed",
  Gemini: "mutable",
  Virgo: "mutable",
  Sagittarius: "mutable",
  Pisces: "mutable",
};
