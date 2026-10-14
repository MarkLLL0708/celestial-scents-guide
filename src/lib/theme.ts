export type Theme = "dark" | "light";

/** One theme on every route, including unknown/error pages, before hydration. */
export function themeFor(_path: string): Theme {
  return "dark";
}

export const bareRoutes = ["/chart/loading", "/chart/reveal", "/ask"];
