import { createFileRoute, Link } from "@tanstack/react-router";
import { metadata } from "@/features/shared";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/provider";
function Page() {
  const { t } = useLanguage();
  return (
    <div className="narrow stack">
      <h1 className="question">{t.revealLabel}</h1>
      <Button asChild>
        <Link to="/chart/result/$id" params={{ id: "demo" }}>
          {t.continue}
        </Link>
      </Button>
    </div>
  );
}
export const Route = createFileRoute("/chart/reveal")({
  head: () => metadata("your sun, moon and rising", "The first look at your chart."),
  component: Page,
});
