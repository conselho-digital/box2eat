import { haversineDistanceKm } from "@/lib/geo";
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
  lat: number | null;
  lng: number | null;
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

/** "4.8⭐ (3.000+)" normally; a restaurant with no reviews yet has nothing
 *  worth printing next to the star, so callers should render only the bare
 *  star icon when `hasRating` is false. */
export function formatRatingLine(ratingAvg: number | null, deliveredOrdersCount: number) {
  if (ratingAvg === null) {
    return { hasRating: false as const, stars: "", paren: "" };
  }
  return { hasRating: true as const, stars: ratingAvg.toFixed(1), paren: bucketOrderCount(deliveredOrdersCount) };
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

/** Assumed average delivery speed used to turn distance into an ETA. */
const DELIVERY_SPEED_KMH = 25;
/** R$0,50 per minute of estimated travel time from restaurant to address. */
const DELIVERY_FEE_PER_MINUTE = 0.5;

export type DeliveryInfo =
  | { kind: "add_address" }
  | { kind: "eta"; label: string; etaMinutes: number; feeAmount: number }
  | { kind: "flat"; label: string; feeAmount: number };

/** Logged-in without a saved address/location → prompt to add one instead of
 *  a fee. With one, price delivery at R$0,50/min of estimated travel time
 *  from the restaurant. Guests (and restaurants missing coordinates) keep
 *  the flat `delivery_fee_base` the restaurant configured. */
export function computeDeliveryInfo(
  loggedIn: boolean,
  deliveryFeeBase: number,
  companyLat: number | null,
  companyLng: number | null,
  userLat: number | null,
  userLng: number | null,
): DeliveryInfo {
  if (!loggedIn) {
    return { kind: "flat", label: formatDeliveryFee(deliveryFeeBase), feeAmount: deliveryFeeBase };
  }
  if (userLat === null || userLng === null) {
    return { kind: "add_address" };
  }
  if (companyLat === null || companyLng === null) {
    return { kind: "flat", label: formatDeliveryFee(deliveryFeeBase), feeAmount: deliveryFeeBase };
  }
  const distanceKm = haversineDistanceKm(userLat, userLng, companyLat, companyLng);
  const etaMinutes = Math.max(1, Math.round((distanceKm / DELIVERY_SPEED_KMH) * 60));
  const feeAmount = etaMinutes * DELIVERY_FEE_PER_MINUTE;
  return { kind: "eta", label: currency.format(feeAmount), etaMinutes, feeAmount };
}

const arrivalTimeFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

/** Clock time the order should arrive by, for the checkout page — travel
 *  ETA plus the restaurant's average prep time as a buffer. */
export function formatEstimatedArrival(etaMinutes: number, avgPrepTimeMinutes: number | null) {
  const totalMinutes = etaMinutes + (avgPrepTimeMinutes ?? 20);
  return arrivalTimeFormat.format(new Date(Date.now() + totalMinutes * 60_000));
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
