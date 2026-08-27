import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { CreateCompanyInput } from "@/lib/validations/company";

type Client = SupabaseClient<Database>;

export type CompanyMembership = Database["public"]["Tables"]["company_members"]["Row"] & {
  companies: Database["public"]["Tables"]["companies"]["Row"];
};

/** Limits are also enforced server-side by a Postgres trigger on company_members. */
export const MAX_COMPANIES_OWNED = 2;
export const MAX_COMPANIES_CONNECTED = 5;

export async function listMyCompanyMemberships(supabase: Client) {
  return supabase
    .from("company_members")
    .select("*, companies(*)")
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .returns<CompanyMembership[]>();
}

export async function createCompany(supabase: Client, input: CreateCompanyInput) {
  return supabase
    .rpc("create_company", {
      p_name: input.name,
      p_slug: input.slug,
      p_description: input.description || undefined,
      p_phone: input.phone || undefined,
    })
    .single();
}

/** Maps the Postgres exception raised by the membership-limit trigger to a friendly message. */
export function describeCompanyError(message: string): string {
  if (message.includes("company_owner_limit_exceeded")) {
    return `Você já atingiu o limite de ${MAX_COMPANIES_OWNED} empresas criadas.`;
  }
  if (message.includes("company_connection_limit_exceeded")) {
    return `Você já atingiu o limite de ${MAX_COMPANIES_CONNECTED} empresas conectadas.`;
  }
  if (message.includes("duplicate key") && message.includes("companies_slug_key")) {
    return "Essa URL já está em uso por outra empresa. Escolha outra.";
  }
  return message;
}
