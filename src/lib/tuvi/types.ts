export interface TuviInput {
  name: string;
  gender: "male" | "female";
  date: string; // YYYY-MM-DD clock date
  time: string; // HH:mm Vietnam clock time
  province: string;
  lon: number;
}
export interface TuviStar { name: string; brightness: string; mutagen: string }
export interface TuviPalace {
  name: string; // Chinese palace key from the engine, e.g. 命宫, 夫妻
  stem: string;
  branch: string;
  isBody: boolean;
  major: TuviStar[];
  minor: TuviStar[];
  decade: [number, number];
}
export interface TuviChart {
  input: TuviInput;
  solar: { date: string; time: string; offset: number; hourIndex: number };
  birthYear: number;
  lunarDate: string;
  pillars: string;
  bureau: string;
  soul: string;
  body: string;
  palaces: TuviPalace[];
}
