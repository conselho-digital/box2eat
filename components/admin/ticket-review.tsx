"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { listTicketsForReview, resolveTicket, type AdminTicket } from "@/lib/domain/admin";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

const TYPE_LABEL: Record<string, string> = {
  restaurant_report: "Reportar restaurante",
  refund_request: "Solicitar reembolso",
};

export function TicketReview() {
  const queryClient = useQueryClient();
  const queryKey = ["admin-tickets"];

  const { data: tickets, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listTicketsForReview(supabase);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  const open = tickets?.filter((t) => t.status === "open") ?? [];
  const resolved = tickets?.filter((t) => t.status !== "open") ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="font-medium">Abertos</h2>
        {open.length === 0 && <p className="text-sm text-muted-foreground">Nenhum ticket aberto.</p>}
        {open.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onResolved={() => queryClient.invalidateQueries({ queryKey })}
          />
        ))}
      </div>

      {resolved.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-medium">Resolvidos</h2>
          {resolved.map((ticket) => (
            <div key={ticket.id} className="rounded-lg border p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {TYPE_LABEL[ticket.type] ?? ticket.type} · {ticket.orders.companies.name}
              </p>
              <p>{ticket.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TicketCard({ ticket, onResolved }: { ticket: AdminTicket; onResolved: () => void }) {
  const resolve = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await resolveTicket(supabase, ticket.id);
      if (error) throw error;
    },
    onSuccess: onResolved,
  });

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3 text-sm">
      <div className="flex items-center justify-between">
        <p className="font-medium">{TYPE_LABEL[ticket.type] ?? ticket.type}</p>
        <span className="text-xs text-muted-foreground">{dateFormat.format(new Date(ticket.created_at))}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {ticket.profiles.full_name || "Cliente"} {ticket.profiles.phone && `· ${ticket.profiles.phone}`} ·{" "}
        {ticket.orders.companies.name} · {currency.format(ticket.orders.total)}
      </p>
      <p>{ticket.message}</p>
      <Button size="sm" className="w-fit" onClick={() => resolve.mutate()} disabled={resolve.isPending}>
        {resolve.isPending ? "Resolvendo…" : "Marcar como resolvido"}
      </Button>
    </div>
  );
}
