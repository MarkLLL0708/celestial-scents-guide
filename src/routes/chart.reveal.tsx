import { createFileRoute, redirect } from "@tanstack/react-router";
// Western chart flow retired: Tử Vi is the only reading.
export const Route = createFileRoute("/chart/reveal")({
  beforeLoad: () => {
    throw redirect({ to: "/tu-vi", statusCode: 301 });
  },
});
