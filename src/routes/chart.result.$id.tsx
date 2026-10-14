import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { ResultPage } from "@/features/chart-result";
function Page() {
  const { id } = Route.useParams();
  const { state } = Route.useSearch();
  return <ResultPage id={id} state={state ?? ""} />;
}
export const Route = createFileRoute("/chart/result/$id")({
  validateSearch: validatePreview,
  head: () => metadata("your chart", "Your chart and perfume matches."),
  component: Page,
});
