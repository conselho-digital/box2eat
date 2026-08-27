import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createCompanySchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da empresa"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Informe uma URL curta")
    .regex(slugPattern, "Use apenas letras minúsculas, números e hífens"),
  description: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
