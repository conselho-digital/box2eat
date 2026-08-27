import { z } from "zod";

const codePattern = /^[A-Za-z0-9_-]+$/;

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "O código precisa ter pelo menos 3 caracteres")
    .max(30, "Código muito longo")
    .regex(codePattern, "Use apenas letras, números, - e _"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().positive("Informe um valor maior que zero"),
  minOrderValue: z.coerce.number().min(0).optional(),
  maxUses: z.coerce.number().int().positive().optional(),
  maxUsesPerUser: z.coerce.number().int().positive().optional(),
  validUntil: z.string().optional(),
});

export type CouponInput = z.infer<typeof couponSchema>;
