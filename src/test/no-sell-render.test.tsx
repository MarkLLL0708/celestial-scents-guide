import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { perfumes } from "@/data/seed";

let path = "/";
vi.mock("@tanstack/react-router", () => ({
  useRouterState: ({ select }: { select: (s: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: path } }),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));
vi.mock("@/data/context", () => ({
  useStore: () => ({ cartItems: [], add: async () => {}, notify: () => {} }),
}));

const { ProductCard } = await import("@/components/scent/product");

describe("no product card or price on astrology screens", () => {
  it.each(["/", "/today", "/ask", "/chart/result/demo", "/chart/result/demo/read/love"])(
    "%s renders nothing",
    (p) => {
      path = p;
      const { container } = render(<ProductCard perfume={perfumes[0]} />);
      expect(container.querySelector(".product")).toBeNull();
      expect(container.textContent).not.toContain("$");
    },
  );
  it("the shelf still shows the card", () => {
    path = "/chart/result/demo/shelf";
    const { container } = render(<ProductCard perfume={perfumes[0]} />);
    expect(container.querySelector(".product")).not.toBeNull();
  });
});
