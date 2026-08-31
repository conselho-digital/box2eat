import type { RestaurantCardData } from "@/lib/domain/restaurant-display";
import { describePromotionBadge } from "@/lib/domain/restaurant-display";
import type { PromotedCompany } from "@/lib/domain/coupons";
import { RestaurantCard } from "@/components/home/restaurant-card";

export function RecommendedCarousel({
  companies,
  promotionsByCompany,
}: {
  companies: RestaurantCardData[];
  promotionsByCompany: Map<string, PromotedCompany>;
}) {
  if (companies.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Restaurantes que você deve gostar</h2>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
        {companies.map((company) => {
          const promotion = promotionsByCompany.get(company.id);
          return (
            <RestaurantCard
              key={company.id}
              company={company}
              promotionBadge={promotion ? describePromotionBadge(promotion) : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}
