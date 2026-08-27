"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { submitReview, type Review, type ReviewTargetType } from "@/lib/domain/reviews";
import { reviewSchema } from "@/lib/validations/review";

export function ReviewForm({
  orderId,
  targetType,
  label,
  existingReview,
  onSubmitted,
}: {
  orderId: string;
  targetType: ReviewTargetType;
  label: string;
  existingReview: Review | null;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(Boolean(existingReview));

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = reviewSchema.safeParse({ rating, comment: comment || undefined });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      }
      const supabase = createClient();
      const { error } = await submitReview(
        supabase,
        orderId,
        targetType,
        parsed.data.rating,
        parsed.data.comment,
      );
      if (error) throw error;
    },
    onSuccess: () => {
      setSubmitted(true);
      onSubmitted();
    },
    onError: (error: Error) => setError(error.message),
  });

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value} estrelas`}
            onClick={() => setRating(value)}
            className="text-muted-foreground"
          >
            <Star
              className={value <= rating ? "fill-primary text-primary" : ""}
              size={20}
            />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Deixe um comentário (opcional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={rating === 0 || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Enviando…" : submitted ? "Atualizar avaliação" : "Enviar avaliação"}
        </Button>
        {submitted && !mutation.isPending && (
          <span className="text-xs text-muted-foreground">Avaliação enviada</span>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
