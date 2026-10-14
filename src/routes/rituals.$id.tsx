import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { RitualPage } from "@/features/chart-result";

function Page() {
  const { id } = Route.useParams();
  const { state } = Route.useSearch();
  return <RitualPage id={id} state={state ?? ""} />;
}
export const Route = createFileRoute("/rituals/$id")({
  validateSearch: validatePreview,
  head: ({ params }) => metadata(params.id.replaceAll("-", " "), "Steps, timing and an intention."),
  component: Page,
});
