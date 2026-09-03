/** The underlying methods a restaurant can accept — what the owner toggles
 *  on in the dashboard, and what a customer-facing checkout option
 *  ultimately resolves to when the order is placed. */
export const ACCEPTED_PAYMENT_METHODS = ["pix", "credit_card", "cash", "card_on_delivery"] as const;
export type AcceptedPaymentMethod = (typeof ACCEPTED_PAYMENT_METHODS)[number];

export const ACCEPTED_METHOD_LABEL: Record<AcceptedPaymentMethod, string> = {
  pix: "Pix",
  credit_card: "Cartão online (Mercado Pago/Stripe)",
  cash: "Dinheiro",
  card_on_delivery: "Cartão na entrega",
};

/** The options offered to a customer at checkout. google_pay/samsung_wallet/
 *  apple_pay/add_card are all, for now, entry points onto the same online
 *  card checkout redirect (Mercado Pago/Stripe hosted checkout) — there's
 *  no native wallet SDK or saved-card storage wired up yet, see
 *  PAYMENT_OPTION_ACCEPTED_KEY. */
export const PAYMENT_OPTIONS = [
  "google_pay",
  "samsung_wallet",
  "apple_pay",
  "add_card",
  "pix",
  "cash",
  "card_on_delivery",
] as const;
export type PaymentOption = (typeof PAYMENT_OPTIONS)[number];

export const PAYMENT_OPTION_LABEL: Record<PaymentOption, string> = {
  google_pay: "Google Pay",
  samsung_wallet: "Samsung Wallet",
  apple_pay: "Apple Pay",
  add_card: "Adicionar cartão",
  pix: "Pix",
  cash: "Dinheiro",
  card_on_delivery: "Usar cartão",
};

export const PAYMENT_OPTION_INFO: Partial<Record<PaymentOption, string>> = {
  add_card: "Adiciona um cartão à sua conta para usar nos próximos pedidos.",
  card_on_delivery: "Você paga com cartão na hora que o pedido chegar, direto pro entregador.",
};

/** Which "accepted_payment_methods" key on the company gates showing this
 *  option at checkout. */
export const PAYMENT_OPTION_ACCEPTED_KEY: Record<PaymentOption, AcceptedPaymentMethod> = {
  google_pay: "credit_card",
  samsung_wallet: "credit_card",
  apple_pay: "credit_card",
  add_card: "credit_card",
  pix: "pix",
  cash: "cash",
  card_on_delivery: "card_on_delivery",
};

/** create_order's p_payment_method: "pix"/"credit_card" keep the order in
 *  pending_payment, routed through the existing online checkout redirect;
 *  "cash"/"card_on_delivery" skip that step entirely (paid at delivery). */
export function resolveOrderPaymentMethod(option: PaymentOption): AcceptedPaymentMethod {
  return PAYMENT_OPTION_ACCEPTED_KEY[option];
}

export function isOfflinePaymentMethod(method: AcceptedPaymentMethod) {
  return method === "cash" || method === "card_on_delivery";
}

export function companyAcceptsOption(
  acceptedMethods: string[],
  option: PaymentOption,
): boolean {
  return acceptedMethods.includes(PAYMENT_OPTION_ACCEPTED_KEY[option]);
}
