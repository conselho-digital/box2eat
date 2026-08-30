import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { CreateCompanyInput } from "@/lib/validations/company";
import { haversineDistanceKm } from "@/lib/geo";

type Client = SupabaseClient<Database>;

export type PublicCompany = Pick<
  Database["public"]["Tables"]["companies"]["Row"],
  | "id"
  | "name"
  | "slug"
  | "description"
  | "min_order_value"
  | "is_open"
  | "rating_avg"
  | "rating_count"
  | "lat"
  | "lng"
>;

export type CompanySearchParams = {
  q?: string;
  open?: string;
  sort?: string;
  lat?: string;
  lng?: string;
  near?: string;
};

/** Shared by the home listing and the map view: same filters, same "closest first" logic. */
export async function listPublicCompanies(supabase: Client, params: CompanySearchParams) {
  const { q, open, sort, lat, lng } = params;

  let query = supabase
    .from("companies")
    .select("id, name, slug, description, min_order_value, is_open, rating_avg, rating_count, lat, lng")
    .eq("status", "active");

  if (q?.trim()) {
    query = query.ilike("name", `%${q.trim()}%`);
  }
  if (open === "1") {
    query = query.eq("is_open", true);
  }
  if (!lat && sort === "rating") {
    query = query.order("rating_avg", { ascending: false, nullsFirst: false });
  } else if (!lat) {
    query = query.order("created_at", { ascending: false });
  }

  const { data } = await query;
  let companies: PublicCompany[] = data ?? [];

  const userLat = lat ? Number(lat) : null;
  const userLng = lng ? Number(lng) : null;
  if (userLat !== null && userLng !== null && !Number.isNaN(userLat) && !Number.isNaN(userLng)) {
    companies = [...companies].sort((a, b) => {
      if (a.lat === null || a.lng === null) return 1;
      if (b.lat === null || b.lng === null) return -1;
      const distA = haversineDistanceKm(userLat, userLng, a.lat, a.lng);
      const distB = haversineDistanceKm(userLat, userLng, b.lat, b.lng);
      return distA - distB;
    });
  }

  return companies;
}

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
  // create_company is declared RETURNS public.companies (a single row, not
  // SETOF), so the RPC result is already a single object — .single() would
  // incorrectly try to unwrap it as if it were an array.
  return supabase.rpc("create_company", {
    p_name: input.name,
    p_slug: input.slug,
    p_description: input.description || undefined,
    p_phone: input.phone || undefined,
  });
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
