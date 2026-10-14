import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { AskPage } from "@/features/chart-result";
function Page() {
  const { state } = Route.useSearch();
  return <AskPage state={state ?? ""} />;
}
export const Route = createFileRoute("/ask")({
  validateSearch: validatePreview,
  head: () => metadata("ask the notes", "Ask a question, get a perfume answer."),
  component: Page,
});
