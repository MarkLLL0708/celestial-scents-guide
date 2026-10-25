import { createFileRoute, redirect } from "@tanstack/react-router";
import { validatePreview } from "@/features/shared";
// Western chart flow retired: Tử Vi is the only reading.
export const Route = createFileRoute("/chart/reveal")({
  validateSearch: validatePreview,
  beforeLoad: () => {
    throw redirect({ to: "/tu-vi", statusCode: 301 });
  },
});
