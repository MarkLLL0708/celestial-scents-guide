export type Theme = "dark" | "light";

const darkExact = ["/chart/loading", "/chart/reveal", "/today", "/ask", "/rituals"];

/** Route → theme table. Sub-pages of a result (read/shelf) stay light. */
export function themeFor(path: string): Theme {
  const p = path.replace(/\/+$/, "") || "/";
  if (darkExact.includes(p)) return "dark";
  if (/^\/rituals\/[^/]+$/.test(p)) return "dark";
  if (/^\/chart\/result\/[^/]+$/.test(p)) return "dark";
  if (p === "/share" || p.startsWith("/share/")) return "dark";
  return "light";
}

export const bareRoutes = ["/chart/loading", "/chart/reveal", "/ask"];
