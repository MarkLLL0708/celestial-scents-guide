import { createFileRoute, notFound } from "@tanstack/react-router";
import { metadata } from "@/features/shared";
import { DevVoice } from "@/features/dev-reading-voice";
export const Route = createFileRoute("/dev/voice")({
  beforeLoad: () => { if (!(import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_PAGES === "true")) throw notFound(); },
  validateSearch: (search: Record<string, unknown>) => ({ text: typeof search.text === "string" ? search.text.slice(0, 20000) : undefined, lang: typeof search.lang === "string" ? search.lang : undefined, surface: typeof search.surface === "string" ? search.surface : undefined }),
  head: () => { const m = metadata("Voice bank", "Private editorial voice samples awaiting setup approval."); return { ...m, meta: [...m.meta, { name: "robots", content: "noindex,nofollow" }] }; },
  component: () => <DevVoice initial={Route.useSearch()} />,
});