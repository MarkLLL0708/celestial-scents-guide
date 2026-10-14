import { createFileRoute, notFound } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { ReadingPage } from "@/features/chart-result";
import { topics } from "@/data/astro-mock";
import type { Topic } from "@/data/types";

function Page() {
  const { id, topic } = Route.useParams();
  const { state } = Route.useSearch();
  return <ReadingPage id={id} topic={topic as Topic} state={state ?? ""} />;
}
export const Route = createFileRoute("/chart/result/$id_/read/$topic")({
  validateSearch: validatePreview,
  beforeLoad: ({ params }) => {
    if (!topics.includes(params.topic as Topic)) throw notFound();
  },
  head: ({ params }) =>
    metadata(`reading: ${params.topic}`, "A long reading, written for your whole chart."),
  component: Page,
});
