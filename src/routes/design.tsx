import { createFileRoute } from "@tanstack/react-router";
import { metadata } from "@/features/shared";
import { DesignPage } from "@/features/design";
export const Route = createFileRoute("/design")({
  head: () => metadata("the design index", "Every component, every state."),
  component: DesignPage,
});
