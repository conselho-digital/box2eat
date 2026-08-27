import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export async function isPlatformAdmin(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}

export type PendingDeliveryPartner = Database["public"]["Tables"]["delivery_partners"]["Row"] & {
  profiles: Pick<Database["public"]["Tables"]["profiles"]["Row"], "full_name" | "phone">;
};

export async function listDeliveryPartnersForReview(supabase: Client) {
  return supabase
    .from("delivery_partners")
    .select("*, profiles(full_name, phone)")
    .order("created_at", { ascending: true })
    .returns<PendingDeliveryPartner[]>();
}

export async function listPartnerDocuments(supabase: Client, partnerId: string) {
  return supabase
    .from("delivery_partner_documents")
    .select("*")
    .eq("delivery_partner_id", partnerId)
    .order("created_at", { ascending: true });
}

export async function getDocumentSignedUrl(supabase: Client, storagePath: string) {
  return supabase.storage.from("delivery-documents").createSignedUrl(storagePath, 300);
}

export async function reviewDocument(
  supabase: Client,
  documentId: string,
  status: "approved" | "rejected",
  reviewerId: string,
  reason?: string,
) {
  return supabase
    .from("delivery_partner_documents")
    .update({
      status,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: status === "rejected" ? reason || null : null,
    })
    .eq("id", documentId);
}

export async function approveDeliveryPartner(supabase: Client, userId: string) {
  return supabase.rpc("approve_delivery_partner", { p_user_id: userId });
}

export async function rejectDeliveryPartner(supabase: Client, userId: string, reason?: string) {
  return supabase.rpc("reject_delivery_partner", { p_user_id: userId, p_reason: reason });
}

export type AdminCompany = Database["public"]["Tables"]["companies"]["Row"];

export async function listAllCompanies(supabase: Client) {
  return supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<AdminCompany[]>();
}

export async function setCompanyStatus(
  supabase: Client,
  companyId: string,
  status: "active" | "paused" | "closed",
) {
  return supabase.from("companies").update({ status }).eq("id", companyId);
}

export type AdminOrder = Database["public"]["Tables"]["orders"]["Row"] & {
  companies: Pick<Database["public"]["Tables"]["companies"]["Row"], "name" | "slug">;
  profiles: Pick<Database["public"]["Tables"]["profiles"]["Row"], "full_name">;
};

export async function listAllOrders(supabase: Client) {
  return supabase
    .from("orders")
    .select("*, companies(name, slug), profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<AdminOrder[]>();
}
