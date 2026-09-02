import { z } from "zod";

export const menuItemSchema = z.object({
  categoryName: z.string().trim().optional().or(z.literal("")),
  name: z.string().trim().min(1, "Informe o nome do item"),
  description: z.string().trim().optional(),
  price: z.coerce.number().min(0, "O preço não pode ser negativo"),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;

// minSelect left blank coerces to 0 (an optional group) — no separate
// "obrigatório" flag to keep in sync with it; is_required is just
// minSelect > 0, computed where the group is created (lib/domain/menu.ts).
export const optionGroupSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome do grupo"),
    minSelect: z.coerce.number().int().min(0),
    maxSelect: z.coerce.number().int().min(1),
  })
  .refine((data) => data.minSelect <= data.maxSelect, {
    message: "O mínimo não pode ser maior que o máximo",
    path: ["minSelect"],
  });

export type OptionGroupInput = z.infer<typeof optionGroupSchema>;

export const menuOptionSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da opção"),
  priceDelta: z.coerce.number(),
});

export type MenuOptionInput = z.infer<typeof menuOptionSchema>;
