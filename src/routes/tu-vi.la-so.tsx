import { createFileRoute } from "@tanstack/react-router";
import { metadata, validatePreview } from "@/features/shared";
import { TuviChartPage } from "@/features/tuvi";

function Page() {
  const { state } = Route.useSearch();
  return <TuviChartPage state={state} />;
}
export const Route = createFileRoute("/tu-vi/la-so")({
  validateSearch: validatePreview,
  head: () => metadata("lá số mười hai cung", "Mười hai cung, mười ba mặt đời sống, cùng nước hoa và son hợp mệnh."),
  component: Page,
});
