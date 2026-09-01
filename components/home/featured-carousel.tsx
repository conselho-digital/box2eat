import type { PromotedCompany } from "@/lib/domain/coupons";
import { describePromotionBadge } from "@/lib/domain/restaurant-display";
import type { QueueInfo } from "@/lib/domain/queue";
import { RestaurantCard } from "@/components/home/restaurant-card";

export function FeaturedCarousel({
  companies,
  userId,
  favoriteCompanyIds,
  queueInfoByCompany,
  userLat,
  userLng,
}: {
  companies: PromotedCompany[];
  userId: string;
  favoriteCompanyIds: Set<string>;
  queueInfoByCompany: Map<string, QueueInfo>;
  userLat?: number | null;
  userLng?: number | null;
}) {
  if (companies.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Destaques do Box2eat</h2>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
        {companies.map((company) => (
          <RestaurantCard
            key={`${company.id}:${company.code}`}
            company={company}
            promotionBadge={describePromotionBadge(company)}
            userId={userId}
            isFavorited={favoriteCompanyIds.has(company.id)}
            queueInfo={queueInfoByCompany.get(company.id)}
            userLat={userLat}
            userLng={userLng}
          />
        ))}
      </div>
    </section>
  );
}
