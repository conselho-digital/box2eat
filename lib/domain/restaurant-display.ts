import type { QueueInfo } from "@/lib/domain/queue";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Shared shape the restaurant card component renders, regardless of which
 *  query (public listing, promotions, recommendations) produced the row. */
export type RestaurantCardData = {
  id: string;
  name: string;
  slug: string;
  coverImageUrl: string | null;
  deliveryFeeBase: number;
  ratingAvg: number | null;
  ratingCount: number;
  avgPrepTimeMinutes: number | null;
  deliveredOrdersCount: number;
};

const ORDER_COUNT_BUCKETS = [50, 100, 200, 300, 500, 1000, 2000, 3000, 4000, 5000];

/** Buckets a raw delivered-order count into the marketing-friendly steps
 *  shown in the card's parenthetical, instead of an exact number. */
function bucketOrderCount(count: number): string {
  if (count >= 5000) return "5000+";
  if (count < ORDER_COUNT_BUCKETS[0]) return `${count}`;
  let bucket = ORDER_COUNT_BUCKETS[0];
  for (const b of ORDER_COUNT_BUCKETS) {
    if (count >= b) bucket = b;
  }
  return `${bucket}+`;
}

function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
}

/** "4.8⭐ (3.000+)" normally; without a rating yet, "X⭐" with the review
 *  count instead of the order count in parenthesis. */
export function formatRatingLine(ratingAvg: number | null, ratingCount: number, deliveredOrdersCount: number) {
  if (ratingAvg === null) {
    return {
      stars: "X",
      paren: ratingCount === 0 ? "sem avaliações" : pluralize(ratingCount, "avaliação", "avaliações"),
    };
  }
  return { stars: ratingAvg.toFixed(1), paren: bucketOrderCount(deliveredOrdersCount) };
}

/** "Sem fila" when nothing is currently in the queue; otherwise the average
 *  time today's delivered orders have taken, falling back to a rough
 *  estimate from prep time if there's no completed order today yet. */
export function formatWaitTime(queueInfo: QueueInfo | undefined, avgPrepTimeMinutes: number | null): string {
  if (!queueInfo?.hasQueue) return "Sem fila";
  if (queueInfo.avgMinutes !== null) return `${queueInfo.avgMinutes} min`;
  const prep = avgPrepTimeMinutes ?? 20;
  return `${prep}–${prep + 20} min`;
}

export function formatDeliveryFee(deliveryFeeBase: number): string {
  return deliveryFeeBase > 0 ? currency.format(deliveryFeeBase) : "Grátis";
}

type PromotionBadgeInput = {
  promoType: string;
  discountType: string;
  discountValue: number;
};

export function describePromotionBadge(promotion: PromotionBadgeInput): string {
  if (promotion.promoType === "loyalty_purchases") return "Fidelidade: ganhe desconto";
  if (promotion.promoType === "loyalty_spend") return "Troque pontos por produtos";
  if (promotion.promoType === "buy_x_get_y") return "Compre e ganhe mais";
  return promotion.discountType === "percentage"
    ? `${promotion.discountValue}% off itens selecionados`
    : `${currency.format(promotion.discountValue)} off no pedido`;
}
