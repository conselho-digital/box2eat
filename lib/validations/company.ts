import { z } from "zod";
import { FOOD_CATEGORIES } from "@/lib/domain/categories";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Kept in sync with the `companies_slug_not_reserved` check constraint in the database. */
export const RESERVED_SLUGS = new Set([
  "admin", "auth", "carrinho", "checkout", "conta", "empresas",
  "entregador", "entregas", "loja", "mapa", "nova-senha", "pedidos",
  "recuperar-acesso", "validacao", "cadastro", "login", "api",
  "ajuda", "promocoes",
]);

export const createCompanySchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do restaurante"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Informe uma URL curta")
    .regex(slugPattern, "Use apenas letras minúsculas, números e hífens")
    .refine((value) => !RESERVED_SLUGS.has(value), "Essa URL é reservada. Escolha outra."),
  description: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  category: z.enum(FOOD_CATEGORIES).optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
