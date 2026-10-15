import { createFileRoute, notFound } from "@tanstack/react-router";
import { metadata } from "@/features/shared";
import { DevMatchPage } from "@/features/dev-match";

const devPagesEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_PAGES === "true";

export const Route = createFileRoute("/dev/match")({
  beforeLoad: () => {
    if (!devPagesEnabled) throw notFound();
  },
  head: () => {
    const m = metadata("match check", "Scent match scores for tuning the catalogue.");
    return { ...m, meta: [...(m.meta ?? []), { name: "robots", content: "noindex" }] };
  },
  component: DevMatchPage,
});
