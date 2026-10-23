import { createFileRoute, notFound } from "@tanstack/react-router";
import { metadata } from "@/features/shared";
import { DevReadingsTest } from "@/features/dev-reading-voice";
export const Route = createFileRoute("/dev/readings-test")({
  beforeLoad: () => { if (!(import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_PAGES === "true")) throw notFound(); },
  head: () => { const m = metadata("Reading voice test", "Private bilingual fact-packet and reading voice comparisons."); return { ...m, meta: [...m.meta, { name: "robots", content: "noindex,nofollow" }] }; },
  component: DevReadingsTest,
});