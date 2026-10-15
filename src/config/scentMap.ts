// Tuning tables for scent matching. Edit numbers and lists here; no code changes needed.

export const SCENT_FAMILIES = [
  "Citrus",
  "Floral",
  "Woody",
  "Oriental",
  "Fresh",
  "Gourmand",
  "Aromatic",
  "Musk",
  "Leather",
  "Green",
] as const;
export type ScentFamily = (typeof SCENT_FAMILIES)[number];

export const MOOD_TAGS = [
  "bold",
  "energetic",
  "sensual",
  "grounded",
  "playful",
  "bright",
  "comforting",
  "soft",
  "radiant",
  "clean",
  "calm",
  "elegant",
  "romantic",
  "mysterious",
  "intense",
  "adventurous",
  "warm",
  "refined",
  "serious",
  "unusual",
  "cool",
  "dreamy",
  "fresh",
] as const;
export type MoodTag = (typeof MOOD_TAGS)[number];

export const STYLES = ["feminine", "masculine", "unisex"] as const;

export type Element = "fire" | "earth" | "air" | "water";

/** Weight 0..1 of each family per element. A family not listed is 0. */
export const elementFamilies: Record<Element, Partial<Record<ScentFamily, number>>> = {
  fire: { Oriental: 1, Leather: 0.7, Citrus: 0.6, Aromatic: 0.2 },
  earth: { Woody: 1, Green: 0.7, Musk: 0.6, Leather: 0.3 },
  air: { Fresh: 1, Aromatic: 0.7, Citrus: 0.6, Floral: 0.3 },
  water: { Floral: 1, Gourmand: 0.7, Musk: 0.6, Fresh: 0.2 },
};

export const SIGN_ORDER = [
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
export type SignName = (typeof SIGN_ORDER)[number];

export const signs: Record<SignName, { element: Element; notes: string[]; moods: MoodTag[] }> = {
  Aries: { element: "fire", notes: ["ginger", "pepper", "cardamom", "leather"], moods: ["bold", "energetic"] },
  Taurus: { element: "earth", notes: ["sandalwood", "rose", "vanilla", "fig"], moods: ["sensual", "grounded"] },
  Gemini: { element: "air", notes: ["bergamot", "mint", "tea", "lavender"], moods: ["playful", "bright"] },
  Cancer: { element: "water", notes: ["jasmine", "musk", "vanilla", "sea salt"], moods: ["comforting", "soft"] },
  Leo: { element: "fire", notes: ["amber", "saffron", "orange blossom", "vanilla"], moods: ["radiant", "bold"] },
  Virgo: { element: "earth", notes: ["lavender", "vetiver", "tea", "cedar"], moods: ["clean", "calm"] },
  Libra: { element: "air", notes: ["rose", "peony", "neroli", "musk"], moods: ["elegant", "romantic"] },
  Scorpio: { element: "water", notes: ["oud", "incense", "dark rose", "patchouli"], moods: ["mysterious", "intense"] },
  Sagittarius: { element: "fire", notes: ["bergamot", "cardamom", "tobacco", "cedar"], moods: ["adventurous", "warm"] },
  Capricorn: { element: "earth", notes: ["vetiver", "cedar", "leather", "oakmoss"], moods: ["refined", "serious"] },
  Aquarius: { element: "air", notes: ["violet", "mint", "pink pepper", "iris"], moods: ["unusual", "cool"] },
  Pisces: { element: "water", notes: ["jasmine", "lily", "vanilla", "sea salt"], moods: ["dreamy", "soft"] },
};

export const placementWeights = { venus: 30, moon: 25, sun: 20, rising: 15, mars: 10 } as const;
export type MatchPlacement = keyof typeof placementWeights;

export const intensityTargets: Record<Element, number> = { fire: 4.5, earth: 3.5, air: 2.5, water: 3 };

/** signScore = family * a + notes * b + mood * c */
export const signScoreParts = { family: 0.4, notes: 0.4, mood: 0.2 } as const;
/** Note matches needed for a full note score, and mood matches for a full mood score. */
export const fullNoteMatches = 3;
export const fullMoodMatches = 2;
export const intensityBonusMax = 8;
/** forWeek = ritual * a + total * b; ritual notes needed for a full ritual score. */
export const weekMix = { ritual: 0.6, total: 0.4 } as const;
export const fullRitualMatches = 2;
/** Signs moved forward for the shadow chart. */
export const shadowShift = 6;
/** Ritual used when there is no today ritual and none was given. */
export const fallbackRitualId = "three-breath-doorway";
