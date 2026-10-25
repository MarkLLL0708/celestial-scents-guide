import { createFileRoute } from "@tanstack/react-router";
import { metadata } from "@/features/shared";
import { TuviForm } from "@/features/tuvi";

export const Route = createFileRoute("/tu-vi/")({
  head: () => metadata("lá số tử vi", "Lập lá số Tử Vi theo giờ mặt trời thật tại 63 tỉnh thành Việt Nam."),
  component: TuviForm,
});
