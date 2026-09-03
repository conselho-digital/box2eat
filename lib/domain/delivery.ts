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

/** How a company wants ready orders routed to a courier: "platform" leaves
 *  them for any online delivery partner to claim (the default); "preferred"
 *  always notifies preferredDeliveryPartnerId directly when an order is
 *  ready; "ask" leaves that decision to staff per order. */
export type DeliveryPreference = "platform" | "preferred" | "ask";

export async function getCompanyDeliveryPreference(supabase: Client, companyId: string) {
  return supabase
    .from("companies")
    .select("delivery_preference, preferred_delivery_partner_id, preferred_delivery_partner_confirmed")
    .eq("id", companyId)
    .single();
}

/** Switches between "platform"/"preferred"/"ask" — doesn't touch which
 *  courier is configured (that only ever changes via
 *  requestPreferredDeliveryPartner, which requires their confirmation). */
export async function setCompanyDeliveryPreference(
  supabase: Client,
  companyId: string,
  deliveryPreference: DeliveryPreference,
) {
  return supabase.from("companies").update({ delivery_preference: deliveryPreference }).eq("id", companyId);
}

/** Looks up an approved delivery partner by e-mail, for the "entregador de
 *  preferência" picker — restricted server-side to company staff. */
export async function findDeliveryPartnerByEmail(supabase: Client, email: string) {
  return supabase.rpc("find_delivery_partner_by_email", { p_email: email });
}

export async function getDeliveryPartnerName(supabase: Client, userId: string) {
  return supabase.rpc("get_delivery_partner_name", { p_user_id: userId });
}

/** Sets a pending preferred courier and notifies them to confirm — until
 *  they do, the company's delivery_preference is forced to "ask" so orders
 *  never silently route to someone who hasn't agreed to it. */
export async function requestPreferredDeliveryPartner(
  supabase: Client,
  companyId: string,
  partnerUserId: string,
) {
  return supabase.rpc("request_preferred_delivery_partner", {
    p_company_id: companyId,
    p_partner_user_id: partnerUserId,
  });
}

/** The courier's side of requestPreferredDeliveryPartner: accepting flips
 *  the company to "preferred" mode; declining clears the request and moves
 *  the company to "ask each time" instead. */
export async function respondToPreferredDeliveryPartner(
  supabase: Client,
  companyId: string,
  accept: boolean,
) {
  return supabase.rpc("respond_preferred_delivery_partner", {
    p_company_id: companyId,
    p_accept: accept,
  });
}

export type PendingPreferredDeliveryRequest = Pick<
  Database["public"]["Tables"]["companies"]["Row"],
  "id" | "name" | "slug"
>;

/** Companies waiting on this courier to confirm/decline being their
 *  preferred delivery partner — shown on the delivery dashboard. */
export async function listPendingPreferredDeliveryRequests(supabase: Client, userId: string) {
  return supabase
    .from("companies")
    .select("id, name, slug")
    .eq("preferred_delivery_partner_id", userId)
    .eq("preferred_delivery_partner_confirmed", false)
    .returns<PendingPreferredDeliveryRequest[]>();
}

/** "Ask each time" mode: staff explicitly routes one ready order to the
 *  company's confirmed preferred courier instead of leaving it for the
 *  open pool. */
export async function notifyPreferredDeliveryPartner(supabase: Client, orderId: string) {
  return supabase.rpc("notify_preferred_delivery_partner", { p_order_id: orderId });
}
