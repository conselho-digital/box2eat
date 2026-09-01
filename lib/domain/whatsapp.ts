import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export type EvolutionConnectionState = "open" | "close" | "connecting" | string;

export type WhatsAppStatus = {
  instance?: { state: EvolutionConnectionState };
};

export type WhatsAppConnectResult = {
  pairingCode?: string;
  code?: string;
  base64?: string;
};

async function invokeWhatsAppFunction<T>(supabase: Client, action: "status" | "connect"): Promise<T> {
  const { data, error } = await supabase.functions.invoke<{ data: T }>("whatsapp-connect", {
    body: { action },
  });
  if (error) {
    // FunctionsHttpError's message is a generic "non-2xx status" string —
    // the actual reason is the plain-text response body on error.context.
    const context = (error as { context?: Response }).context;
    const detail = context ? await context.text().catch(() => null) : null;
    throw new Error(detail || error.message);
  }
  if (!data) throw new Error("Resposta vazia da Evolution API");
  return data.data;
}

export function getWhatsAppStatus(supabase: Client) {
  return invokeWhatsAppFunction<WhatsAppStatus>(supabase, "status");
}

export function connectWhatsApp(supabase: Client) {
  return invokeWhatsAppFunction<WhatsAppConnectResult>(supabase, "connect");
}
