import type { SupabaseClient } from "@supabase/supabase-js";
import { isEmailIdentifier } from "@/lib/validations/auth";

export type OAuthProvider = "google" | "apple";

/** `identifier` is whatever the user typed in the "e-mail ou telefone" field. */
export async function signInWithPassword(
  supabase: SupabaseClient,
  identifier: string,
  password: string,
) {
  if (isEmailIdentifier(identifier)) {
    return supabase.auth.signInWithPassword({ email: identifier, password });
  }
  return supabase.auth.signInWithPassword({ phone: identifier, password });
}

export async function signUpWithPassword(
  supabase: SupabaseClient,
  fullName: string,
  email: string,
  password: string,
) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function signUpWithEmailOtp(
  supabase: SupabaseClient,
  fullName: string,
  email: string,
) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      data: { full_name: fullName },
    },
  });
}

export async function verifyEmailOtp(
  supabase: SupabaseClient,
  email: string,
  token: string,
) {
  return supabase.auth.verifyOtp({ email, token, type: "email" });
}

export async function signInWithOAuth(
  supabase: SupabaseClient,
  provider: OAuthProvider,
) {
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
}

export async function signOut(supabase: SupabaseClient) {
  return supabase.auth.signOut();
}

/**
 * Starts verifying a phone number for the current (already logged in) user.
 * Sends a WhatsApp OTP via the `send-sms` Auth Hook. Confirming it with
 * `verifyPhoneChange` links the phone to the account and enables phone+password
 * login — it does not require re-confirming an e-mail.
 */
export async function requestPhoneVerification(supabase: SupabaseClient, phone: string) {
  return supabase.auth.updateUser({ phone });
}

export async function verifyPhoneChange(supabase: SupabaseClient, phone: string, token: string) {
  return supabase.auth.verifyOtp({ phone, token, type: "phone_change" });
}

/**
 * Sends a login link to the account's recovery e-mail (a different address
 * than the account's own login e-mail). Always resolves the same way
 * whether or not that address is registered, so the caller can't use it to
 * enumerate accounts.
 */
export async function requestRecoveryLogin(supabase: SupabaseClient, recoveryEmail: string) {
  return supabase.functions.invoke("request-recovery-login", {
    body: {
      recovery_email: recoveryEmail,
      redirect_to: `${window.location.origin}/nova-senha`,
    },
  });
}
