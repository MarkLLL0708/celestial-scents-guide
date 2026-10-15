import { createFileRoute, notFound } from "@tanstack/react-router";
import { metadata } from "@/features/shared";
import { DevChartPage } from "@/features/dev-chart";

const devPagesEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_PAGES === "true";

export const Route = createFileRoute("/dev/chart")({
  beforeLoad: () => {
    if (!devPagesEnabled) throw notFound();
  },
  head: () => {
    const m = metadata("chart check", "Raw placements and aspects for comparing chart tools.");
    return { ...m, meta: [...(m.meta ?? []), { name: "robots", content: "noindex" }] };
  },
  component: DevChartPage,
});
