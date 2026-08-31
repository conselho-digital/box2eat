import type { PromotedCompany } from "@/lib/domain/coupons";
import { describePromotionBadge } from "@/lib/domain/restaurant-display";
import { RestaurantCard } from "@/components/home/restaurant-card";

export function FeaturedCarousel({ companies }: { companies: PromotedCompany[] }) {
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
          />
        ))}
      </div>
    </section>
  );
}
