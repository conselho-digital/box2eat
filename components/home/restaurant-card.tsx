import Image from "next/image";
import Link from "next/link";
import { Star, Clock } from "lucide-react";
import type { RestaurantCardData } from "@/lib/domain/restaurant-display";
import { formatDeliveryFee, formatOrderCount, formatWaitTime } from "@/lib/domain/restaurant-display";

function StarRating({ rating }: { rating: number | null }) {
  const value = rating ?? 0;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={
            i < Math.round(value) ? "size-3.5 fill-primary text-primary" : "size-3.5 text-muted-foreground/30"
          }
        />
      ))}
      {rating !== null && <span className="ml-1 text-xs text-muted-foreground">{rating.toFixed(1)}</span>}
    </div>
  );
}

export function RestaurantCard({
  company,
  promotionBadge,
}: {
  company: RestaurantCardData;
  promotionBadge?: string;
}) {
  return (
    <Link
      href={`/${company.slug}`}
      className="flex w-64 shrink-0 snap-start flex-col gap-2 rounded-2xl border pb-3"
    >
      <div className="relative h-32 w-full overflow-hidden rounded-t-2xl bg-muted">
        {company.coverImageUrl && (
          <Image src={company.coverImageUrl} alt="" fill className="object-cover" />
        )}
        {promotionBadge && (
          <span className="absolute top-2 right-2 rounded-lg bg-card px-2 py-1 text-xs font-medium shadow">
            {promotionBadge}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 px-3">
        <p className="truncate font-medium">{company.name}</p>
        <p className="text-xs text-muted-foreground">
          Entrega {formatDeliveryFee(company.deliveryFeeBase)}
        </p>
        <StarRating rating={company.ratingAvg} />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatOrderCount(company.deliveredOrdersCount)}</span>
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {formatWaitTime(company.avgPrepTimeMinutes)}
          </span>
        </div>
      </div>
    </Link>
  );
}
