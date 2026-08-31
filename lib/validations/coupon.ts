import { z } from "zod";

const codePattern = /^[A-Za-z0-9_-]+$/;

export const PROMO_TYPES = {
  discount: "Desconto",
  loyalty_purchases: "Fidelidade (nº de compras)",
  loyalty_spend: "Troca por valor gasto",
  buy_x_get_y: "Pague e leve mais / Ganhe um brinde",
} as const;

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "O código precisa ter pelo menos 3 caracteres")
    .max(30, "Código muito longo")
    .regex(codePattern, "Use apenas letras, números, - e _"),
  promoType: z.enum(["discount", "loyalty_purchases", "loyalty_spend", "buy_x_get_y"]),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().positive("Informe um valor maior que zero"),
  minOrderValue: z.coerce.number().min(0).optional(),
  maxUses: z.coerce.number().int().positive().optional(),
  maxUsesPerUser: z.coerce.number().int().positive().optional(),
  validUntil: z.string().optional(),
});

export type CouponInput = z.infer<typeof couponSchema>;
