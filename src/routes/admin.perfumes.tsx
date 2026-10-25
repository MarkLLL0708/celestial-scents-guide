import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/features/store-pages";
import { metadata, validatePreview } from "@/features/shared";
export const Route = createFileRoute("/admin/perfumes")({
  validateSearch: validatePreview,
  head: () => ({
    meta: [
      ...metadata("perfume catalogue", "Manage the Star Notes perfume catalogue.").meta,
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Page,
});
function Page() {
  return <AdminPage state={Route.useSearch().state} />;
}
