import { createFileRoute } from "@tanstack/react-router";
import { LibraryPage } from "@/features/library";
import { metadata } from "@/features/shared";
export const Route = createFileRoute("/admin/library")({
  head: () => ({
    meta: [
      ...metadata("text library", "Review and approve Natal Notes astrology texts.").meta,
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LibraryPage,
});
