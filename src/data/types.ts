export interface Perfume {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  size_ml: number;
  scent_family: string;
  style: "feminine" | "masculine" | "unisex";
  intensity: number;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  mood_tags: string[];
  sold_out: boolean;
}
export interface BirthProfile {
  name: string;
  day: number;
  month: number;
  year: number;
  hour: number | null;
  minute: number | null;
  city: string;
  country: string;
}
export interface Chart {
  sun: string;
  moon: string;
  rising: string | null;
  venus: string;
  mars: string;
  mercury: string;
  jupiter: string;
  saturn: string;
  degrees: Partial<Record<Planet, number>>;
  elements: { fire: number; earth: number; air: number; water: number };
}
export interface Prefs {
  avoid: string[];
  style: string;
  budget: "any" | "low" | "mid" | "high";
}
export interface Evidence {
  planet: "sun" | "moon" | "rising" | "venus" | "mars" | "mercury";
  sign: string;
  why: string;
}
export interface Match {
  perfume: Perfume;
  score: number;
  reason: string;
  evidence?: Evidence;
}
export interface AskAnswer {
  evidence: string;
  answer: string;
  perfumeId: string;
}
export interface Recs {
  signature: Match;
  others: Match[];
  shadow: Match;
}
export interface ChartResult {
  id: string;
  profile: BirthProfile;
  chart: Chart;
  prefs: Prefs;
  recs: Recs;
  date: string;
}
export interface CartItem {
  perfume: Perfume;
  quantity: number;
}
export type Planet =
  "sun" | "moon" | "rising" | "venus" | "mars" | "mercury" | "jupiter" | "saturn";
export type Aspect = "conjunct" | "sextile" | "square" | "trine" | "opposite";
export type Theme = "self" | "love" | "work" | "luck";
export type Topic = "you" | "love" | "work" | "luck";
export interface Transit {
  transiting: Planet;
  aspect: Aspect;
  natal: Planet;
  orb: number;
  theme: Theme;
  strength: 1 | 2 | 3 | 4 | 5;
}
export interface Block {
  transit: Transit;
  text: string;
}
export interface Today {
  date: string;
  summary: string;
  tone: Record<Theme, number>;
  working: Block;
  pushing: Block;
  protect: Block;
  ritualId: string;
}
export interface Reading {
  topic: Topic;
  title: string;
  sections: { title: string; body: string }[];
}
export interface AstroAnswer {
  transit: Transit;
  answer: string;
  ritualId: string;
}
export interface Ritual {
  id: string;
  theme: Theme;
  title: string;
  intention: string;
  timing: string;
  minutes: number;
  steps: string[];
}
export interface ChartRecord {
  id: string;
  name: string;
  chart: Chart;
}
