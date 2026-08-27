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
