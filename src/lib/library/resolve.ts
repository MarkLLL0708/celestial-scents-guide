import { approvedTexts } from "@/data/library.functions";
export async function resolveTexts(
  kind: import("./keys").LibraryKind,
  keys: string[],
  lang: "en" | "vi",
): Promise<Map<string, string>> {
  try {
    const rows = await approvedTexts({ data: { kind, keys, lang } });
    return new Map(rows.map((r) => [r.key, r.body]));
  } catch {
    return new Map();
  }
}
