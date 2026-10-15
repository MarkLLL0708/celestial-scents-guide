import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { Shop } from "@/features/store-pages";
import { perfumeQuery } from "@/data/queries";
function Page() {
  const { state } = Route.useSearch();
  return <Shop state={state} />;
}
export const Route = createFileRoute("/shop/")({
  validateSearch: validatePreview,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(perfumeQuery({ family: "", style: "", maxPrice: 220 })),
  head: () => metadata("shop", "Perfumes from Atelier Sample."),
  component: Page,
});
