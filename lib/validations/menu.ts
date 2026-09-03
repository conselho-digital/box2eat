import { z } from "zod";

export const menuItemSchema = z.object({
  categoryName: z.string().trim().optional().or(z.literal("")),
  name: z.string().trim().min(1, "Informe o nome do item"),
  description: z.string().trim().optional(),
  price: z.coerce.number().min(0, "O preço não pode ser negativo"),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;
