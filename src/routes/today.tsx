import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { TuviTodayPage } from "@/features/tuvi-daily";

function Page() {
  const { state } = Route.useSearch();
  return <TuviTodayPage state={state ?? ""} />;
}
export const Route = createFileRoute("/today")({
  validateSearch: validatePreview,
  head: () => metadata("today's palace", "Today's stem and branch, the palace it lights on your Tử Vi chart, and a scent, lip and ritual for it."),
  component: Page,
});
