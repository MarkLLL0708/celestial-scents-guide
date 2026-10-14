import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { Shop } from "@/features/store-pages";
function Page() {
  const { state } = Route.useSearch();
  return <Shop state={state} />;
}
export const Route = createFileRoute("/shop")({
  validateSearch: validatePreview,
  head: () => metadata("shop", "Perfumes from Atelier Sample."),
  component: Page,
});
