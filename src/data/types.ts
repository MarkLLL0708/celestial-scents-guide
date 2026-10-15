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
  region?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
}
export interface CityHit {
  city: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
}
export type Body = "sun" | "moon" | "mercury" | "venus" | "mars" | "jupiter" | "saturn";
export interface PlacementDetail {
  sign: string;
  degree: number;
  longitude: number;
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
  modalities: { cardinal: number; fixed: number; mutable: number };
  details: Record<Body, PlacementDetail> & { rising: PlacementDetail | null };
  moonAlternatives?: [string, string];
  birthTimeKnown: boolean;
  lat: number;
  lon: number;
  timezone: string;
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
  kind?: "easy" | "hard" | "intense";
}
export interface Block {
  transit: Transit;
  text: string;
}
export interface Today {
  date: string;
  summary: string;
  tone: Record<Theme, number>;
  working: Block | null;
  pushing: Block | null;
  protect: Block | null;
  quiet?: string;
  ritualId: string;
}
export interface Reading {
  topic: Topic;
  title: string;
  sections: { title: string; body: string }[];
  placements?: { body: Planet; sign: string; degree: number }[];
  week?: { transit: Transit; date: string } | null;
}
export interface WeekEntry {
  date: string;
  transit: Transit | null;
}
export interface AstroAnswer {
  transit: Transit;
  answer: string;
  ritualId: string;
}
export type RitualTheme = "calm" | "love" | "work" | "luck" | "self" | "evening";
export interface Ritual {
  id: string;
  title: string;
  theme: RitualTheme;
  intention: string;
  timing: string;
  durationMin: number;
  needs: string[];
  steps: string[];
  why: string;
  noteFamily: string;
  perfumeId: string;
  reason: string;
}
export interface ShelfEntry extends Match {
  ritualId: string;
  ritualTitle: string;
}
export interface Shelf {
  forChart: ShelfEntry | null;
  forWeek: ShelfEntry | null;
  forShadow: ShelfEntry | null;
}
export interface ChartRecord {
  id: string;
  name: string;
  chart: Chart;
}
