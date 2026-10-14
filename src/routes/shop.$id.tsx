import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { ProductDetail } from "@/features/store-pages";
function Page() {
  const { state } = Route.useSearch();
  const { id } = Route.useParams();
  return <ProductDetail id={id} state={state} />;
}
export const Route = createFileRoute("/shop/$id")({
  validateSearch: validatePreview,
  head: () => metadata("perfume", "One perfume, its notes and price."),
  component: Page,
});
