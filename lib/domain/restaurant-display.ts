const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const ORDER_COUNT_BUCKETS = [50, 100, 200, 300, 500, 1000, 2000, 3000, 4000, 5000];

/** Buckets a raw delivered-order count into the marketing-friendly steps the
 *  restaurant card shows, instead of an exact (and constantly changing) number. */
export function formatOrderCount(count: number): string {
  if (count < ORDER_COUNT_BUCKETS[0]) return "Novo no Box2eat";
  if (count >= 5000) return "5000+ pedidos";
  let bucket = ORDER_COUNT_BUCKETS[0];
  for (const b of ORDER_COUNT_BUCKETS) {
    if (count >= b) bucket = b;
  }
  return `${bucket}+ pedidos`;
}

/** Rough estimate until the queue/per-item prep time system exists: the
 *  company's average prep time plus a fixed delivery buffer. */
export function formatWaitTime(avgPrepTimeMinutes: number | null): string {
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
