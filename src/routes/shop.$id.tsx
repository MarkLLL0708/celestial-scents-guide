import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { ProductDetail } from "@/features/store-pages";
import { productQuery } from "@/data/queries";
function Page() {
  const { state } = Route.useSearch();
  const { id } = Route.useParams();
  return <ProductDetail id={id} state={state} />;
}
export const Route = createFileRoute("/shop/$id")({
  validateSearch: validatePreview,
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productQuery(params.id)),
  head: ({ loaderData }) =>
    metadata(loaderData?.name ?? "perfume not found", "One perfume, its notes and price."),
  component: Page,
});
