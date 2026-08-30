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
