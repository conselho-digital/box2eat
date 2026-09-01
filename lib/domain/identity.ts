import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export type IdentityVerification = Database["public"]["Tables"]["identity_verifications"]["Row"];

export async function getMyIdentityVerification(supabase: Client, userId: string) {
  return supabase
    .from("identity_verifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
}

export async function isIdentityVerified(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("identity_verifications")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "approved")
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}

async function uploadIdentityPhoto(supabase: Client, userId: string, file: File) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("identity-documents").upload(path, file, { upsert: false });
  return { path, error };
}

/** Age/identity verification requires two photos: the person holding their
 *  document below their face, and a separate selfie. */
export async function uploadIdentityVerification(
  supabase: Client,
  userId: string,
  documentFile: File,
  selfieFile: File,
) {
  const [document, selfie] = await Promise.all([
    uploadIdentityPhoto(supabase, userId, documentFile),
    uploadIdentityPhoto(supabase, userId, selfieFile),
  ]);
  if (document.error) return { error: document.error };
  if (selfie.error) return { error: selfie.error };

  return supabase.from("identity_verifications").insert({
    user_id: userId,
    document_storage_path: document.path,
    selfie_storage_path: selfie.path,
  });
}

export type PendingIdentityVerification = IdentityVerification & {
  profiles: Pick<Database["public"]["Tables"]["profiles"]["Row"], "full_name" | "phone">;
};

export async function listIdentityVerificationsForReview(supabase: Client) {
  return supabase
    .from("identity_verifications")
    .select("*, profiles(full_name, phone)")
    .order("created_at", { ascending: false })
    .returns<PendingIdentityVerification[]>();
}

export async function getIdentityPhotoSignedUrl(supabase: Client, storagePath: string) {
  return supabase.storage.from("identity-documents").createSignedUrl(storagePath, 300);
}

export async function reviewIdentityVerification(
  supabase: Client,
  id: string,
  status: "approved" | "rejected",
  reviewerId: string,
  reason?: string,
) {
  return supabase
    .from("identity_verifications")
    .update({
      status,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: status === "rejected" ? reason || null : null,
    })
    .eq("id", id);
}
