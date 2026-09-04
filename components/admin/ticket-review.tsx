"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import {
  listTicketsForReview,
  listOrderItemsForTicket,
  resolveDeliveryReport,
  resolveProductReport,
  type AdminTicket,
} from "@/lib/domain/admin";
import { getReportPhotoUrl } from "@/lib/domain/order-reports";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

const TYPE_LABEL: Record<string, string> = {
  restaurant_report: "Reportar restaurante",
  delivery_partner_report: "Reportar entregador",
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
              {ticket.type === "delivery_partner_report" && ticket.delivery_refund_pct !== null && (
                <p className="text-xs">{ticket.delivery_refund_pct}% da entrega devolvido ao cliente.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportPhotos({ paths }: { paths: string[] }) {
  const { data: urls } = useQuery({
    queryKey: ["report-photo-urls", paths],
    queryFn: async () => {
      const supabase = createClient();
      const resolved = await Promise.all(
        paths.map(async (path) => {
          const { data } = await getReportPhotoUrl(supabase, path);
          return data;
        }),
      );
      return resolved.filter((url): url is string => Boolean(url));
    },
  });

  if (!urls || urls.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {urls.map((url) => (
        <a key={url} href={url} target="_blank" rel="noreferrer" className="relative size-16 shrink-0">
          <Image src={url} alt="" fill unoptimized className="rounded-lg border object-cover" />
        </a>
      ))}
    </div>
  );
}

function DeliveryResolutionForm({
  ticketId,
  onResolved,
}: {
  ticketId: string;
  onResolved: () => void;
}) {
  const [pct, setPct] = useState("100");

  const resolve = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await resolveDeliveryReport(supabase, ticketId, Number(pct));
      if (error) throw error;
    },
    onSuccess: onResolved,
  });

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={0}
        max={100}
        value={pct}
        onChange={(e) => setPct(e.target.value)}
        className="w-20"
      />
      <span className="text-xs text-muted-foreground">% da taxa de entrega devolvido ao cliente</span>
      <Button size="sm" onClick={() => resolve.mutate()} disabled={resolve.isPending}>
        {resolve.isPending ? "Resolvendo…" : "Resolver"}
      </Button>
      {resolve.isError && <p className="text-xs text-destructive">Não foi possível resolver.</p>}
    </div>
  );
}

function ProductResolutionForm({
  ticketId,
  orderId,
  onResolved,
}: {
  ticketId: string;
  orderId: string;
  onResolved: () => void;
}) {
  const { data: items } = useQuery({
    queryKey: ["ticket-order-items", orderId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listOrderItemsForTicket(supabase, orderId);
      if (error) throw error;
      return data;
    },
  });

  const [selections, setSelections] = useState<Record<string, { checked: boolean; pct: string }>>({});

  const resolve = useMutation({
    mutationFn: async () => {
      const itemRefunds = Object.entries(selections)
        .filter(([, sel]) => sel.checked)
        .map(([orderItemId, sel]) => ({ orderItemId, refundPct: Number(sel.pct) }));
      if (itemRefunds.length === 0) throw new Error("Selecione ao menos um item.");
      const supabase = createClient();
      const { error } = await resolveProductReport(supabase, ticketId, itemRefunds);
      if (error) throw error;
    },
    onSuccess: onResolved,
  });

  if (!items) return <p className="text-xs text-muted-foreground">Carregando itens…</p>;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">Selecione os itens afetados e o % a devolver:</p>
      {items.map((item) => {
        const sel = selections[item.id] ?? { checked: false, pct: "100" };
        return (
          <label key={item.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sel.checked}
              onChange={(e) =>
                setSelections((prev) => ({
                  ...prev,
                  [item.id]: { ...sel, checked: e.target.checked },
                }))
              }
            />
            <span className="flex-1">
              {item.quantity}x {item.item_name} · {currency.format(item.subtotal)}
            </span>
            <Input
              type="number"
              min={0}
              max={100}
              value={sel.pct}
              disabled={!sel.checked}
              onChange={(e) =>
                setSelections((prev) => ({ ...prev, [item.id]: { ...sel, pct: e.target.value } }))
              }
              className="w-16"
            />
            <span className="text-xs text-muted-foreground">%</span>
          </label>
        );
      })}
      <Button size="sm" className="w-fit" onClick={() => resolve.mutate()} disabled={resolve.isPending}>
        {resolve.isPending ? "Resolvendo…" : "Resolver"}
      </Button>
      {resolve.isError && (
        <p className="text-xs text-destructive">
          {resolve.error instanceof Error ? resolve.error.message : "Não foi possível resolver."}
        </p>
      )}
    </div>
  );
}

function TicketCard({ ticket, onResolved }: { ticket: AdminTicket; onResolved: () => void }) {
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
      {ticket.photo_urls && ticket.photo_urls.length > 0 && <ReportPhotos paths={ticket.photo_urls} />}

      {ticket.type === "delivery_partner_report" ? (
        ticket.orders.delivery_partner_id ? (
          <DeliveryResolutionForm ticketId={ticket.id} onResolved={onResolved} />
        ) : (
          <p className="text-xs text-muted-foreground">Pedido sem entregador atribuído.</p>
        )
      ) : (
        <ProductResolutionForm ticketId={ticket.id} orderId={ticket.orders.id} onResolved={onResolved} />
      )}
    </div>
  );
}
