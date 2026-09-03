"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import {
  listOrderMessages,
  sendOrderMessage,
  subscribeToOrderMessages,
  type OrderMessageThread,
} from "@/lib/domain/messages";

const timeFormat = new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" });

const SENDER_LABEL: Record<string, string> = {
  company: "Restaurante",
  delivery_partner: "Entregador",
  customer: "Cliente",
};

/** Chat thread for one leg of an order's handoff — either
 *  restaurant<->courier (while the courier is picking up) or
 *  courier<->customer (after pickup). Access and eligibility to send are
 *  both enforced server-side by send_order_message()/RLS; this component
 *  just renders whatever the current user is allowed to see. */
export function OrderChat({
  orderId,
  thread,
  currentUserId,
  title,
}: {
  orderId: string;
  thread: OrderMessageThread;
  currentUserId: string;
  title: string;
}) {
  const queryClient = useQueryClient();
  const queryKey = ["order-messages", orderId, thread];

  const { data: messages } = useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listOrderMessages(supabase, orderId, thread);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const supabase = createClient();
    return subscribeToOrderMessages(supabase, orderId, () => {
      queryClient.invalidateQueries({ queryKey });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- queryKey is stable per orderId/thread
  }, [orderId, thread]);

  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const send = useMutation({
    mutationFn: async () => {
      setError(null);
      const supabase = createClient();
      const { error } = await sendOrderMessage(supabase, orderId, body);
      if (error) throw error;
    },
    onSuccess: () => {
      setBody("");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => setError(error.message),
  });

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <p className="text-sm font-medium">{title}</p>
      <div className="flex max-h-56 flex-col gap-2 overflow-y-auto">
        {(!messages || messages.length === 0) && (
          <p className="text-xs text-muted-foreground">Nenhuma mensagem ainda.</p>
        )}
        {messages?.map((message) => {
          const isMine = message.sender_id === currentUserId;
          return (
            <div key={message.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-3 py-1.5 text-sm ${
                  isMine ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {message.body}
              </div>
              <span className="mt-0.5 text-[10px] text-muted-foreground">
                {isMine ? "Você" : SENDER_LABEL[message.sender_role] ?? message.sender_role} ·{" "}
                {timeFormat.format(new Date(message.created_at))}
              </span>
            </div>
          );
        })}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (body.trim().length > 0) send.mutate();
        }}
      >
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escreva uma mensagem…"
          className="h-8"
          maxLength={1000}
        />
        <Button type="submit" size="sm" disabled={send.isPending || body.trim().length === 0}>
          Enviar
        </Button>
      </form>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
