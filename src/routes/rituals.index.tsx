import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { RitualsPage } from "@/features/chart-result";

function Page() {
  const { state } = Route.useSearch();
  return <RitualsPage state={state ?? ""} />;
}
export const Route = createFileRoute("/rituals/")({
  validateSearch: validatePreview,
  head: () => metadata("rituals", "Small rituals that work with any perfume you already own."),
  component: Page,
});
