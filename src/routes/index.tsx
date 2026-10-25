import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { Landing } from "@/features/store-pages";
export const Route = createFileRoute("/")({
  validateSearch: validatePreview,
  head: () =>
    metadata(
      "lá số tử vi, scent and shade",
      "Your Tử Vi chart across 12 palaces, balanced with perfume and lip picks for what it lacks.",
    ),
  component: Page,
});
function Page() {
  const { state } = Route.useSearch();
  return <Landing state={state} />;
}
