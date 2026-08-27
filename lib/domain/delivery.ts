import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { DeliveryApplicationInput, DocType } from "@/lib/validations/delivery";

type Client = SupabaseClient<Database>;

export type DeliveryPartner = Database["public"]["Tables"]["delivery_partners"]["Row"];
export type DeliveryPartnerDocument =
  Database["public"]["Tables"]["delivery_partner_documents"]["Row"];

export async function getMyDeliveryPartner(supabase: Client, userId: string) {
  return supabase
    .from("delivery_partners")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
}

export async function applyAsDeliveryPartner(
  supabase: Client,
  userId: string,
  input: DeliveryApplicationInput,
) {
  return supabase.from("delivery_partners").insert({
    user_id: userId,
    vehicle_type: input.vehicleType,
    vehicle_plate: input.vehiclePlate || null,
  });
}

export async function setOnline(supabase: Client, userId: string, isOnline: boolean) {
  return supabase
    .from("delivery_partners")
    .update({ is_online: isOnline })
    .eq("user_id", userId);
}

export async function updateLocation(
  supabase: Client,
  userId: string,
  lat: number,
  lng: number,
) {
  return supabase
    .from("delivery_partners")
    .update({ current_lat: lat, current_lng: lng, last_location_at: new Date().toISOString() })
    .eq("user_id", userId);
}

export async function listMyDocuments(supabase: Client, userId: string) {
  return supabase
    .from("delivery_partner_documents")
    .select("*")
    .eq("delivery_partner_id", userId)
    .order("created_at", { ascending: false });
}

export async function uploadDeliveryDocument(
  supabase: Client,
  userId: string,
  docType: DocType,
  file: File,
) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${docType}-${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("delivery-documents")
    .upload(path, file, { upsert: false });
  if (uploadError) return { error: uploadError };

  return supabase
    .from("delivery_partner_documents")
    .insert({ delivery_partner_id: userId, doc_type: docType, storage_path: path });
}

export type AvailableOrder = Database["public"]["Tables"]["orders"]["Row"] & {
  companies: Pick<Database["public"]["Tables"]["companies"]["Row"], "id" | "name" | "slug" | "street" | "city">;
};

export async function listAvailableOrders(supabase: Client) {
  return supabase
    .from("orders")
    .select("*, companies(id, name, slug, street, city)")
    .eq("status", "ready_for_pickup")
    .is("delivery_partner_id", null)
    .order("created_at", { ascending: true })
    .returns<AvailableOrder[]>();
}

export async function listMyActiveDeliveries(supabase: Client, userId: string) {
  return supabase
    .from("orders")
    .select("*, companies(id, name, slug, street, city)")
    .eq("delivery_partner_id", userId)
    .in("status", ["assigned", "picked_up"])
    .order("created_at", { ascending: true })
    .returns<AvailableOrder[]>();
}

export async function listMyDeliveryHistory(supabase: Client, userId: string) {
  return supabase
    .from("orders")
    .select("*, companies(id, name, slug, street, city)")
    .eq("delivery_partner_id", userId)
    .eq("status", "delivered")
    .order("delivered_at", { ascending: false })
    .returns<AvailableOrder[]>();
}

export async function claimOrder(supabase: Client, orderId: string) {
  return supabase.rpc("assign_delivery_partner", { p_order_id: orderId });
}

export async function pickUpOrder(supabase: Client, orderId: string) {
  return supabase.rpc("mark_picked_up", { p_order_id: orderId });
}
