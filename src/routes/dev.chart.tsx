import { createFileRoute } from "@tanstack/react-router";
import { metadata } from "@/features/shared";
import { DevChartPage } from "@/features/dev-chart";

export const Route = createFileRoute("/dev/chart")({
  head: () => {
    const m = metadata("chart check", "Raw placements and aspects for comparing chart tools.");
    return { ...m, meta: [...(m.meta ?? []), { name: "robots", content: "noindex" }] };
  },
  component: DevChartPage,
});
