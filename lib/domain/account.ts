import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { ProfileInput } from "@/lib/validations/account";
import type { PaymentOption } from "@/lib/domain/payment-methods";

type Client = SupabaseClient<Database>;

export async function updateProfile(
  supabase: Client,
  userId: string,
  input: ProfileInput,
) {
  return supabase
    .from("profiles")
    .update({ full_name: input.fullName, phone: input.phone || null })
    .eq("id", userId);
}

export async function updateFullName(supabase: Client, userId: string, fullName: string) {
  return supabase.from("profiles").update({ full_name: fullName }).eq("id", userId);
}

export async function updateContactPhone(supabase: Client, userId: string, phone: string) {
  return supabase.from("profiles").update({ phone: phone || null }).eq("id", userId);
}

export async function updateDefaultPaymentMethod(
  supabase: Client,
  userId: string,
  method: PaymentOption,
) {
  return supabase.from("profiles").update({ default_payment_method: method }).eq("id", userId);
}

export async function updateEmail(supabase: Client, email: string) {
  return supabase.auth.updateUser({ email });
}

export async function updateRecoveryEmail(supabase: Client, userId: string, recoveryEmail: string) {
  return supabase
    .from("profiles")
    .update({ recovery_email: recoveryEmail || null })
    .eq("id", userId);
}

export async function updatePassword(supabase: Client, password: string) {
  return supabase.auth.updateUser({ password });
}

export async function listMfaFactors(supabase: Client) {
  return supabase.auth.mfa.listFactors();
}

export async function enrollMfa(supabase: Client) {
  return supabase.auth.mfa.enroll({ factorType: "totp" });
}

export async function verifyMfaEnrollment(
  supabase: Client,
  factorId: string,
  code: string,
) {
  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({ factorId });
  if (challengeError) return { error: challengeError };

  return supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  });
}

export async function unenrollMfa(supabase: Client, factorId: string) {
  return supabase.auth.mfa.unenroll({ factorId });
}
