"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PublicCompany } from "@/lib/domain/companies";
import { formatDeliveryFee, formatRatingLine, formatWaitTime } from "@/lib/domain/restaurant-display";
import type { QueueInfo } from "@/lib/domain/queue";
import type { MenuItem } from "@/lib/domain/menu";
import { BestSellerItemCard } from "@/components/home/best-seller-item-card";

export function RestaurantMenuCarousel({
  company,
  items,
  queueInfo,
}: {
  company: PublicCompany;
  items: MenuItem[];
  queueInfo?: QueueInfo;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const rating = formatRatingLine(company.rating_avg, company.rating_count, company.delivered_orders_count);

  function scroll(direction: 1 | -1) {
    scrollRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Link href={`/${company.slug}`} className="flex min-w-0 items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-muted">
            {company.cover_image_url && (
              <Image src={company.cover_image_url} alt="" fill className="object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">{company.name}</p>
            <p className="text-xs text-muted-foreground">
              Entrega {formatDeliveryFee(company.delivery_fee_base)}
            </p>
            <p className="text-xs text-muted-foreground">
              {rating.stars}⭐ ({rating.paren}) · {formatWaitTime(queueInfo, company.avg_prep_time_minutes)}
            </p>
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <Link href={`/${company.slug}`} className="text-sm text-primary hover:underline">
            Ver tudo
          </Link>
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Anterior"
            className="hidden size-8 items-center justify-center rounded-full border hover:bg-muted sm:flex"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Próximo"
            className="hidden size-8 items-center justify-center rounded-full border hover:bg-muted sm:flex"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-1 sm:-mx-6 sm:px-6"
      >
        {items.map((item) => (
          <BestSellerItemCard
            key={item.id}
            item={item}
            companyId={company.id}
            companyName={company.name}
            companySlug={company.slug}
          />
        ))}
      </div>
    </section>
  );
}
