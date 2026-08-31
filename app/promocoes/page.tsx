import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listPromotedCompanies } from "@/lib/domain/coupons";
import { PROMO_TYPES } from "@/lib/validations/coupon";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatDiscount(discountType: string, discountValue: number) {
  return discountType === "percentage" ? `${discountValue}% OFF` : `${currency.format(discountValue)} OFF`;
}

export default async function PromotionsPage() {
  const supabase = await createClient();
  const { data: promotions } = await listPromotedCompanies(supabase);

  const sorted = [...(promotions ?? [])].sort((a, b) => {
    if (a.discountType !== b.discountType) return a.discountType === "percentage" ? -1 : 1;
    return b.discountValue - a.discountValue;
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Promoções</h1>
        <p className="text-sm text-muted-foreground">
          Restaurantes com promoção ativa, do maior para o menor desconto.
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma promoção ativa no momento.</p>
      ) : (
        <div className="flex flex-col divide-y rounded-lg border">
          {sorted.map((promotion) => (
            <Link
              key={`${promotion.id}:${promotion.code}`}
              href={`/${promotion.slug}`}
              className="flex items-center justify-between gap-3 p-4 hover:bg-muted/50"
            >
              <div>
                <p className="font-medium">{promotion.name}</p>
                <p className="text-xs text-muted-foreground">
                  {PROMO_TYPES[promotion.promoType as keyof typeof PROMO_TYPES] ?? promotion.promoType}
                </p>
              </div>
              <span className="flex items-center gap-2 text-sm">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                  {formatDiscount(promotion.discountType, promotion.discountValue)}
                </span>
                <span className="font-mono text-xs text-muted-foreground">{promotion.code}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
