import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { SavedPage } from "@/features/store-pages";
function Page() {
  const { state } = Route.useSearch();
  return <SavedPage state={state} />;
}
export const Route = createFileRoute("/saved")({
  validateSearch: validatePreview,
  head: () => metadata("my charts", "Your saved charts."),
  component: Page,
});
