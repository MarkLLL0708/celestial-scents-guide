import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { TodayPage } from "@/features/chart-result";

function Page() {
  const { state } = Route.useSearch();
  return <TodayPage state={state ?? ""} />;
}
export const Route = createFileRoute("/today")({
  validateSearch: validatePreview,
  head: () =>
    metadata("today", "What is working, what is pushing back, and what to protect today."),
  component: Page,
});
