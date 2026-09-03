import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export async function listNotifications(supabase: Client) {
  return supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30)
    .returns<Notification[]>();
}

export async function countUnreadNotifications(supabase: Client) {
  return supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .is("read_at", null);
}

export async function markNotificationRead(supabase: Client, id: string) {
  return supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
}

export async function markAllNotificationsRead(supabase: Client, userId: string) {
  return supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);
}

export const NOTIFICATION_PREFERENCE_COLUMNS = [
  "notify_order_updates",
  "notify_promotions",
  "notify_courier_messages",
  "notify_new_orders",
  "notify_company_order_updates",
  "notify_customer_messages",
  "notify_company_courier_messages",
  "notify_delivery_new_orders",
  "notify_restaurant_messages",
  "notify_delivery_customer_messages",
  "notify_delivery_order_updates",
] as const;

export type NotificationPreferenceColumn = (typeof NOTIFICATION_PREFERENCE_COLUMNS)[number];

export type NotificationPreferences = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  NotificationPreferenceColumn
>;

export async function getNotificationPreferences(supabase: Client, userId: string) {
  return supabase
    .from("profiles")
    .select(NOTIFICATION_PREFERENCE_COLUMNS.join(", "))
    .eq("id", userId)
    .single<NotificationPreferences>();
}

export async function updateNotificationPreference(
  supabase: Client,
  userId: string,
  column: NotificationPreferenceColumn,
  value: boolean,
) {
  const update: Partial<Record<NotificationPreferenceColumn, boolean>> = { [column]: value };
  return supabase.from("profiles").update(update).eq("id", userId);
}

/** Realtime: fires when a new notification is inserted for the current user. */
export function subscribeToNotifications(supabase: Client, userId: string, onChange: () => void) {
  const channel = supabase
    .channel(`notifications-${userId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
