import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/provider";
import { useStore } from "@/data/context";
import type { Perfume } from "@/data/types";
import { Bottle } from "./artwork";
export function Notes({ perfume }: { perfume: Perfume }) {
  const { t, word } = useLanguage();
  return (
    <div>
      {(["top", "heart", "base"] as const).map((k) => (
        <div className="note-row" key={k}>
          <span className="label">{t[k]}</span>
          <span>{perfume[`${k}_notes`].map(word).join(", ")}</span>
        </div>
      ))}
    </div>
  );
}
export function AddButton({
  perfume,
  forceInCart = false,
}: {
  perfume: Perfume;
  forceInCart?: boolean;
}) {
  const { t } = useLanguage();
  const store = useStore();
  const [busy, setBusy] = useState(false);
  const inCart = forceInCart || store.cartItems.some((p) => p.perfume.id === perfume.id);
  return (
    <Button
      disabled={perfume.sold_out}
      loading={busy}
      onClick={async () => {
        setBusy(true);
        await store.add(perfume.id);
        store.notify(t.added);
        setBusy(false);
      }}
    >
      {perfume.sold_out ? t.soldOut : inCart ? t.inCart : t.add}
    </Button>
  );
}
export function ProductCard({
  perfume,
  variant = "grid",
  score,
  reason,
  compact = false,
  forceInCart = false,
}: {
  perfume: Perfume;
  variant?: "grid" | "signature" | "shadow";
  score?: number;
  reason?: string;
  compact?: boolean;
  forceInCart?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <article className={`product product-${variant} ${variant === "signature" ? "ink" : ""}`}>
      {variant === "shadow" && <p className="label mb-4">{t.shadow}</p>}
      <div className="product-image">
        <Bottle family={perfume.scent_family} name={perfume.name} />
      </div>
      <div className="product-meta">
        <div>
          <Link to="/shop/$id" params={{ id: perfume.id }} className="product-name">
            {perfume.name}
          </Link>
          <p className="label product-brand">{perfume.brand}</p>
          <p className="product-price">
            ${perfume.price} · {perfume.size_ml} ml
          </p>
        </div>
        {score !== undefined && (
          <span
            className="product-match"
            aria-label={t.matchAria.replace("{score}", String(score))}
          >
            {score}%
          </span>
        )}
      </div>
      {reason && <p className="product-reason">{reason}</p>}
      {!compact && <Notes perfume={perfume} />}
      <AddButton perfume={perfume} forceInCart={forceInCart} />
    </article>
  );
}
