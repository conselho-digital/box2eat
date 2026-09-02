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
  | "category"
  | "cover_image_url"
  | "delivery_fee_base"
  | "avg_prep_time_minutes"
  | "delivered_orders_count"
  | "street"
  | "number"
  | "neighborhood"
  | "city"
  | "state"
>;

/** Single-line delivery address for display (cart cards, checkout summaries).
 *  Returns null when there isn't enough address data to say anything useful. */
export function formatCompanyAddress(company: {
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
}) {
  const streetLine = [company.street, company.number].filter(Boolean).join(", ");
  const cityLine = [company.neighborhood, company.city && company.state ? `${company.city} - ${company.state}` : company.city]
    .filter(Boolean)
    .join(", ");
  return [streetLine, cityLine].filter(Boolean).join(" · ") || null;
}

export type CompanySearchParams = {
  q?: string;
  open?: string;
  sort?: string;
  lat?: string;
  lng?: string;
  category?: string;
};

const PUBLIC_COMPANY_COLUMNS =
  "id, name, slug, description, min_order_value, is_open, rating_avg, rating_count, lat, lng, category, cover_image_url, delivery_fee_base, avg_prep_time_minutes, delivered_orders_count, street, number, neighborhood, city, state" as const;

/** Shared by the home listing and the map view: same filters, same "closest first" logic. */
export async function listPublicCompanies(supabase: Client, params: CompanySearchParams) {
  const { q, open, sort, lat, lng, category } = params;

  let query = supabase.from("companies").select(PUBLIC_COMPANY_COLUMNS).eq("status", "active");

  if (q?.trim()) {
    query = query.ilike("name", `%${q.trim()}%`);
  }
  if (open === "1") {
    query = query.eq("is_open", true);
  }
  if (category) {
    query = query.eq("category", category);
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
    p_category: input.category || undefined,
  });
}

export async function updateCompanyCategory(supabase: Client, companyId: string, category: string) {
  return supabase.from("companies").update({ category }).eq("id", companyId);
}

export async function incrementCompanyView(supabase: Client, companyId: string) {
  return supabase.rpc("increment_company_view", { p_company_id: companyId });
}

/** Maps the Postgres exception raised by the membership-limit trigger to a friendly message. */
export function describeCompanyError(message: string): string {
  if (message.includes("company_owner_limit_exceeded")) {
    return `Você já atingiu o limite de ${MAX_COMPANIES_OWNED} restaurantes criados.`;
  }
  if (message.includes("company_connection_limit_exceeded")) {
    return `Você já atingiu o limite de ${MAX_COMPANIES_CONNECTED} restaurantes conectados.`;
  }
  if (message.includes("duplicate key") && message.includes("companies_slug_key")) {
    return "Essa URL já está em uso por outro restaurante. Escolha outra.";
  }
  if (message.includes("companies_slug_not_reserved")) {
    return "Essa URL é reservada. Escolha outra.";
  }
  return message;
}
