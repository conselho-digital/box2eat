import { z } from "zod";

export const profileAddressSchema = z.object({
  label: z.string().trim().optional(),
  street: z.string().trim().min(2, "Informe a rua"),
  number: z.string().trim().optional(),
  complement: z.string().trim().optional(),
  neighborhood: z.string().trim().optional(),
  city: z.string().trim().min(2, "Informe a cidade"),
  state: z.string().trim().max(60, "Informe o estado").optional(),
  postalCode: z.string().trim().optional(),
});

export type ProfileAddressInput = z.infer<typeof profileAddressSchema>;
