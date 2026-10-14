import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { CartPage } from "@/features/store-pages";
function Page() {
  const { state } = Route.useSearch();
  return <CartPage state={state} />;
}
export const Route = createFileRoute("/cart")({
  validateSearch: validatePreview,
  head: () => metadata("cart", "Your cart."),
  component: Page,
});
