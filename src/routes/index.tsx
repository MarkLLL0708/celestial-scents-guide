import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { Landing } from "@/features/store-pages";
export const Route = createFileRoute("/")({
  validateSearch: validatePreview,
  head: () =>
    metadata(
      "your sky, read properly",
      "Readings for your whole birth chart, a daily note and small rituals. Free.",
    ),
  component: Page,
});
function Page() {
  const { state } = Route.useSearch();
  return <Landing state={state} />;
}
