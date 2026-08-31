import Image from "next/image";
import Link from "next/link";
import type { PromotedCompany } from "@/lib/domain/coupons";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function bannerTitle(promotion: PromotedCompany) {
  if (promotion.promoType === "loyalty_purchases") return `Fidelidade em ${promotion.name}`;
  if (promotion.promoType === "loyalty_spend") return `Troque pontos em ${promotion.name}`;
  if (promotion.promoType === "buy_x_get_y") return `Compre e ganhe em ${promotion.name}`;
  return promotion.discountType === "percentage"
    ? `${promotion.discountValue}% off em ${promotion.name}`
    : `${currency.format(promotion.discountValue)} off em ${promotion.name}`;
}

export function PromoBannerCarousel({ companies }: { companies: PromotedCompany[] }) {
  if (companies.length === 0) return null;

  const sorted = [...companies].sort((a, b) => b.viewCount - a.viewCount).slice(0, 10);

  return (
    <section className="flex flex-col gap-3">
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
        {sorted.map((promotion) => (
          <Link
            key={`${promotion.id}:${promotion.code}`}
            href={`/${promotion.slug}`}
            className="relative flex h-[200px] w-[400px] shrink-0 snap-start overflow-hidden rounded-2xl bg-primary text-primary-foreground"
          >
            <div className="flex w-3/4 flex-col justify-center gap-2 p-5">
              <p className="text-xl leading-tight font-bold">{bannerTitle(promotion)}</p>
              <p className="text-sm text-primary-foreground/80">Exclusivo Box2eat</p>
              <span className="mt-2 w-fit rounded-full bg-card px-4 py-2 text-sm font-medium text-foreground">
                Peça já
              </span>
            </div>
            <div className="relative w-1/4 shrink-0">
              {promotion.coverImageUrl && (
                <Image src={promotion.coverImageUrl} alt="" fill className="object-cover" />
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
