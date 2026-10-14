import { createFileRoute, Link } from "@tanstack/react-router";
import { metadata } from "@/features/shared";
import { useLanguage } from "@/i18n/provider";
import { Orb } from "@/components/scent/cosmos";

function Today() {
  const { t } = useLanguage();
  return (
    <div className="narrow result-simple">
      <Orb variant="sun" size="md" />
      <h1 className="question">{t.todayTitle}</h1>
      <Link to="/chart/result/$id" params={{ id: "demo" }} className="label muted underline">
        {t.back}
      </Link>
    </div>
  );
}

export const Route = createFileRoute("/today")({
  head: () => metadata("today", "Your sky for today."),
  component: Today,
});
