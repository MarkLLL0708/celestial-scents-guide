import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { RevealPage } from "@/features/chart-result";
function Page() {
  const { state } = Route.useSearch();
  return <RevealPage state={state ?? ""} />;
}
export const Route = createFileRoute("/chart/reveal")({
  validateSearch: validatePreview,
  head: () => metadata("your sun, moon and rising", "The first look at your chart."),
  component: Page,
});
