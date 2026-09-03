"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import {
  getNotificationPreferences,
  updateNotificationPreference,
  type NotificationPreferenceColumn,
  type NotificationPreferences,
} from "@/lib/domain/notifications";

const CATEGORY_LABELS: Record<NotificationPreferenceColumn, string> = {
  notify_order_updates: "Atualizações do pedido",
  notify_promotions: "Promoções",
  notify_courier_messages: "Mensagens do entregador",
  notify_new_orders: "Pedidos novos",
  notify_company_order_updates: "Atualizações de pedidos",
  notify_customer_messages: "Mensagens de clientes",
  notify_company_courier_messages: "Mensagens de entregadores",
  notify_delivery_new_orders: "Pedido novo",
  notify_restaurant_messages: "Mensagem do restaurante",
  notify_delivery_customer_messages: "Mensagem do cliente",
  notify_delivery_order_updates: "Alteração de pedidos",
};

export function notificationPreferencesQueryKey(userId: string) {
  return ["notification-preferences", userId];
}

export function NotificationPreferencesForm({
  userId,
  categories,
}: {
  userId: string;
  categories: NotificationPreferenceColumn[];
}) {
  const queryClient = useQueryClient();
  const queryKey = notificationPreferencesQueryKey(userId);

  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await getNotificationPreferences(supabase, userId);
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({
      column,
      value,
    }: {
      column: NotificationPreferenceColumn;
      value: boolean;
    }) => {
      const supabase = createClient();
      const { error } = await updateNotificationPreference(supabase, userId, column, value);
      if (error) throw error;
    },
    onMutate: async ({ column, value }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationPreferences>(queryKey);
      queryClient.setQueryData<NotificationPreferences>(
        queryKey,
        (old) => old && { ...old, [column]: value },
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
  });

  if (!data) return null;

  return (
    <div className="flex flex-col gap-3">
      {categories.map((column) => (
        <label key={column} className="flex items-center justify-between gap-3">
          <span className="text-sm">{CATEGORY_LABELS[column]}</span>
          <Switch
            checked={data[column]}
            onCheckedChange={(value) => saveMutation.mutate({ column, value })}
          />
        </label>
      ))}
    </div>
  );
}
