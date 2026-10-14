import { describe, expect, it } from "vitest";
import { themeFor } from "@/lib/theme";

describe("route theme", () => {
  it.each([
    "/chart/loading",
    "/chart/reveal",
    "/chart/result/demo",
    "/today",
    "/ask",
    "/rituals",
    "/rituals/abc",
  ])("%s is dark", (p) => expect(themeFor(p)).toBe("dark"));

  it.each([
    "/",
    "/chart/new",
    "/chart/result/demo/read/love",
    "/chart/result/demo/shelf",
    "/shop",
    "/shop/x",
    "/cart",
    "/login",
    "/you",
    "/admin/perfumes",
    "/design",
  ])("%s is light", (p) => expect(themeFor(p)).toBe("light"));
});
