import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export type QrLoginStatus = "pending" | "confirmed" | "expired";

export async function createQrLoginRequest(supabase: Client) {
  return supabase.rpc("create_qr_login_request");
}

export async function getQrLoginStatus(supabase: Client, token: string) {
  return supabase.rpc("get_qr_login_status", { p_token: token }).single();
}

export async function confirmQrLogin(supabase: Client, token: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("not authenticated");

  const { data, error } = await supabase.functions.invoke<{ ok: boolean }>("confirm-qr-login", {
    body: { token },
  });
  if (error) throw error;
  return data;
}
