import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Escolha uma nota de 1 a 5").max(5),
  comment: z.string().trim().max(500, "Comentário muito longo").optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
