import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { RestaurantCardData } from "@/lib/domain/restaurant-display";
import { formatDeliveryFee, formatRatingLine, formatWaitTime } from "@/lib/domain/restaurant-display";
import type { QueueInfo } from "@/lib/domain/queue";
import { CardFavoriteButton } from "@/components/favorites/card-favorite-button";

export function RestaurantCard({
  company,
  promotionBadge,
  queueInfo,
  userId,
  isFavorited,
}: {
  company: RestaurantCardData;
  promotionBadge?: string;
  queueInfo?: QueueInfo;
  userId?: string;
  isFavorited?: boolean;
}) {
  const rating = formatRatingLine(company.ratingAvg, company.ratingCount, company.deliveredOrdersCount);

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
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-medium">{company.name}</p>
          {userId && <CardFavoriteButton companyId={company.id} userId={userId} initialFavorited={Boolean(isFavorited)} />}
        </div>
        <p className="text-xs text-muted-foreground">
          Entrega {formatDeliveryFee(company.deliveryFeeBase)}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {rating.stars}⭐ ({rating.paren})
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {formatWaitTime(queueInfo, company.avgPrepTimeMinutes)}
          </span>
        </div>
      </div>
    </Link>
  );
}
