import { createFileRoute } from "@tanstack/react-router";
import { validatePreview, metadata } from "@/features/shared";
import { LoginPage } from "@/features/store-pages";
function Page() {
  const { state } = Route.useSearch();
  return <LoginPage state={state} />;
}
export const Route = createFileRoute("/login")({
  validateSearch: validatePreview,
  head: () => metadata("log in", "Log in to keep your charts."),
  component: Page,
});
