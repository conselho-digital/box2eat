"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  listPendingPreferredDeliveryRequests,
  respondToPreferredDeliveryPartner,
} from "@/lib/domain/delivery";

/** Cards for restaurants that picked this courier as their "entregador de
 *  preferência" and are waiting on a confirm/decline — declining (or never
 *  confirming) leaves the restaurant on "perguntar a cada pedido" instead. */
export function PreferredPartnerRequests({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const queryKey = ["pending-preferred-delivery-requests", userId];
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const { data: requests } = useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listPendingPreferredDeliveryRequests(supabase, userId);
      if (error) throw error;
      return data;
    },
  });

  const respond = useMutation({
    mutationFn: async ({ companyId, accept }: { companyId: string; accept: boolean }) => {
      const supabase = createClient();
      const { error } = await respondToPreferredDeliveryPartner(supabase, companyId, accept);
      if (error) throw error;
      return { companyId, accept };
    },
    onSuccess: ({ companyId, accept }) => {
      if (accept) {
        setConfirmedIds((prev) => new Set(prev).add(companyId));
      } else {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  const visible = (requests ?? []).filter((c) => !dismissedIds.has(c.id));
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {visible.map((company) => {
        const confirmed = confirmedIds.has(company.id);
        return (
          <div key={company.id} className="rounded-lg border p-3 text-sm">
            {confirmed ? (
              <div className="flex items-center justify-between gap-2">
                <p>
                  Você confirmou ser o entregador de preferência de{" "}
                  <span className="font-medium">{company.name}</span>.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDismissedIds((prev) => new Set(prev).add(company.id))}
                >
                  Fechar
                </Button>
              </div>
            ) : (
              <>
                <p>
                  <span className="font-medium">{company.name}</span> quer você como entregador de
                  preferência — os pedidos prontos serão sempre enviados direto para você.
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => respond.mutate({ companyId: company.id, accept: true })}
                    disabled={respond.isPending}
                  >
                    Confirmar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => respond.mutate({ companyId: company.id, accept: false })}
                    disabled={respond.isPending}
                  >
                    Recusar
                  </Button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
