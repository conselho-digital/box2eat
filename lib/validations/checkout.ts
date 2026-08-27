import { z } from "zod";

export const deliveryAddressSchema = z.object({
  street: z.string().trim().min(2, "Informe a rua"),
  number: z.string().trim().optional(),
  complement: z.string().trim().optional(),
  neighborhood: z.string().trim().optional(),
  city: z.string().trim().min(2, "Informe a cidade"),
  state: z
    .string()
    .trim()
    .length(2, "Use a sigla do estado (ex: SP)")
    .toUpperCase(),
  postal_code: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type DeliveryAddressFormInput = z.infer<typeof deliveryAddressSchema>;
