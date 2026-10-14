import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { ShelfPage } from "@/features/chart-result";

function Page() {
  const { id } = Route.useParams();
  const { state } = Route.useSearch();
  return <ShelfPage id={id} state={state ?? ""} />;
}
export const Route = createFileRoute("/chart/result/$id_/shelf")({
  validateSearch: validatePreview,
  head: () => metadata("your shelf", "Three perfumes for your chart, each paired with a ritual."),
  component: Page,
});
