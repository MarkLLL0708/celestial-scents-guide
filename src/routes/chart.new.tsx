import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { ChartFlow } from "@/features/chart-flow";
function Page() {
  const { step } = Route.useSearch();
  return <ChartFlow step={step} />;
}
export const Route = createFileRoute("/chart/new")({
  validateSearch: validatePreview,
  head: () => metadata("read my chart", "Tell us when and where you were born."),
  component: Page,
});
