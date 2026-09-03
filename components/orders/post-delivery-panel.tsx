"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReviewForm } from "@/components/reviews/review-form";
import { createClient } from "@/lib/supabase/client";
import { listReviewsForOrder } from "@/lib/domain/reviews";
import { hasOrderReport } from "@/lib/domain/order-reports";
import { OrderIssueActions } from "./order-issue-actions";

const COMPLAINT_WINDOW_MS = 15 * 60 * 1000;

/** What happens right after an order is delivered: a 15-minute window
 *  where the customer can still open a complaint about the restaurant or
 *  courier — only once that passes with no complaint opened does the
 *  review prompt (stars + comment) show up. An open complaint holds the
 *  review prompt back entirely; resolving it is handled separately. */
export function PostDeliveryPanel({
  orderId,
  deliveredAt,
  companyName,
  deliveryPartnerId,
}: {
  orderId: string;
  deliveredAt: string;
  companyName: string;
  deliveryPartnerId: string | null;
}) {
  const windowEndsAt = new Date(deliveredAt).getTime() + COMPLAINT_WINDOW_MS;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const remaining = windowEndsAt - Date.now();
    if (remaining <= 0) return;
    const timer = setTimeout(() => setNow(Date.now()), remaining + 500);
    return () => clearTimeout(timer);
  }, [windowEndsAt]);

  const { data: reportCount } = useQuery({
    queryKey: ["order-has-report", orderId],
    queryFn: async () => {
      const supabase = createClient();
      const { count, error } = await hasOrderReport(supabase, orderId);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: reviews, refetch: refetchReviews } = useQuery({
    queryKey: ["order-reviews", orderId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listReviewsForOrder(supabase, orderId);
      if (error) throw error;
      return data;
    },
    enabled: now >= windowEndsAt && reportCount === 0,
  });

  if (reportCount === undefined) return null;

  if (reportCount > 0) {
    return (
      <p className="rounded-lg border p-3 text-sm text-muted-foreground">
        Sua reclamação sobre esse pedido foi registrada e está sendo analisada.
      </p>
    );
  }

  if (now < windowEndsAt) {
    const minutesLeft = Math.max(1, Math.ceil((windowEndsAt - now) / 60000));
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Confira seu pedido. Você tem {minutesLeft} minuto{minutesLeft > 1 ? "s" : ""} para abrir
          uma reclamação com o restaurante ou o entregador, se algo não estiver certo.
        </p>
        <OrderIssueActions orderId={orderId} hasDeliveryPartner={Boolean(deliveryPartnerId)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">Avalie seu pedido</h2>
      <ReviewForm
        orderId={orderId}
        targetType="company"
        label={companyName}
        existingReview={reviews?.find((r) => r.target_type === "company") ?? null}
        onSubmitted={() => refetchReviews()}
      />
      {deliveryPartnerId && (
        <ReviewForm
          orderId={orderId}
          targetType="delivery_partner"
          label="Entregador"
          existingReview={reviews?.find((r) => r.target_type === "delivery_partner") ?? null}
          onSubmitted={() => refetchReviews()}
        />
      )}
    </div>
  );
}
