import { createFileRoute } from "@tanstack/react-router";
import { metadata } from "@/features/shared";
import { ChartLoading } from "@/features/chart-loading";
export const Route = createFileRoute("/chart/loading")({
  head: () => metadata("reading your sky", "Placing the planets for your day."),
  component: ChartLoading,
});
