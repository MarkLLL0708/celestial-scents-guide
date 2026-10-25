import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { TuviAskPage } from "@/features/tuvi-daily";
function Page() {
  const { state } = Route.useSearch();
  return <TuviAskPage state={state ?? ""} />;
}
export const Route = createFileRoute("/ask")({
  validateSearch: validatePreview,
  head: () => metadata("ask your tử vi chart", "Ask a question and get an answer from the palace it belongs to, with a scent, lip and ritual."),
  component: Page,
});
