import { MOOD_TAGS, SCENT_FAMILIES, STYLES } from "@/config/scentMap";
import type { Perfume } from "@/data/types";

export type ImportError = { row: number; field: string; value: string };

/** CSV parser that supports escaped quotes and quoted commas. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  row.push(field);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

const list = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);

/** Validates rows against the controlled vocabularies. Row numbers count the header as 1. */
export function parseCatalogue(text: string): { perfumes: Perfume[]; errors: ImportError[] } {
  const rows = parseCsv(text);
  const headers = (rows.shift() ?? []).map((h) => h.trim());
  const perfumes: Perfume[] = [];
  const errors: ImportError[] = [];
  rows.forEach((r, i) => {
    const row = i + 2;
    const o = Object.fromEntries(headers.map((h, j) => [h, r[j]?.trim() ?? ""]));
    const bad: ImportError[] = [];
    const err = (field: string) => bad.push({ row, field, value: o[field] ?? "" });
    if (!o.name) err("name");
    if (!(SCENT_FAMILIES as readonly string[]).includes(o.scent_family)) err("scent_family");
    if (!(STYLES as readonly string[]).includes(o.style)) err("style");
    const price = Number(o.price);
    if (!Number.isFinite(price) || price <= 0) err("price");
    const intensity = Number(o.intensity);
    if (!Number.isInteger(intensity) || intensity < 1 || intensity > 5) err("intensity");
    const moods = list(o.mood_tags ?? "");
    moods
      .filter((m) => !(MOOD_TAGS as readonly string[]).includes(m))
      .forEach((m) => bad.push({ row, field: "mood_tags", value: m }));
    if (bad.length) {
      errors.push(...bad);
      return;
    }
    const sample = Number(o.sample_price);
    perfumes.push({
      id: o.id || `import-${row}`,
      name: o.name,
      brand: o.brand || "",
      price,
      currency: o.currency || "USD",
      size_ml: Number(o.size_ml) || 0,
      scent_family: o.scent_family,
      style: o.style as Perfume["style"],
      intensity,
      top_notes: list(o.top_notes ?? ""),
      heart_notes: list(o.heart_notes ?? ""),
      base_notes: list(o.base_notes ?? ""),
      mood_tags: moods,
      sold_out: o.sold_out?.toLowerCase() === "true",
      image_url: o.image_url || undefined,
      sample_price: o.sample_price && Number.isFinite(sample) ? sample : undefined,
    });
  });
  return { perfumes, errors };
}
