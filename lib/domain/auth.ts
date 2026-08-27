import type { SupabaseClient } from "@supabase/supabase-js";

export type OAuthProvider = "google" | "apple";

export async function signInWithPassword(
  supabase: SupabaseClient,
  email: string,
  password: string,
) {
  return supabase.auth.signInWithPassword({ email, password });
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
