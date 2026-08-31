import type { RestaurantCardData } from "@/lib/domain/restaurant-display";
import { describePromotionBadge } from "@/lib/domain/restaurant-display";
import type { PromotedCompany } from "@/lib/domain/coupons";
import type { QueueInfo } from "@/lib/domain/queue";
import { RestaurantCard } from "@/components/home/restaurant-card";

export function RecommendedCarousel({
  companies,
  promotionsByCompany,
  userId,
  favoriteCompanyIds,
  queueInfoByCompany,
}: {
  companies: RestaurantCardData[];
  promotionsByCompany: Map<string, PromotedCompany>;
  userId: string;
  favoriteCompanyIds: Set<string>;
  queueInfoByCompany: Map<string, QueueInfo>;
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
              userId={userId}
              isFavorited={favoriteCompanyIds.has(company.id)}
              queueInfo={queueInfoByCompany.get(company.id)}
            />
          );
        })}
      </div>
    </section>
  );
}
