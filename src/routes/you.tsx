import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { YouPage } from "@/features/store-pages";
function Page() {
  const { state } = Route.useSearch();
  return <YouPage state={state} />;
}
export const Route = createFileRoute("/you")({
  validateSearch: validatePreview,
  head: () => metadata("you", "Your saved charts, language and account."),
  component: Page,
});
