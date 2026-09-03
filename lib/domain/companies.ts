import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { CreateCompanyInput, UpdateCompanySettingsInput } from "@/lib/validations/company";
import { RESERVED_SLUGS } from "@/lib/validations/company";
import type { AcceptedPaymentMethod } from "@/lib/domain/payment-methods";
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
  | "mercadopago_user_id"
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

/** A company can only take orders once it's open AND has connected its
 *  Mercado Pago account — without one, there's nowhere for the payment to
 *  go. create_order enforces this server-side; this mirrors it for display. */
export function isCompanyAcceptingOrders(company: {
  is_open: boolean;
  mercadopago_user_id: string | null;
}) {
  return company.is_open && company.mercadopago_user_id !== null;
}

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
  "id, name, slug, description, min_order_value, is_open, mercadopago_user_id, rating_avg, rating_count, lat, lng, category, cover_image_url, delivery_fee_base, avg_prep_time_minutes, delivered_orders_count, street, number, neighborhood, city, state" as const;

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

export async function updateCompanySettings(
  supabase: Client,
  companyId: string,
  input: UpdateCompanySettingsInput,
) {
  return supabase
    .from("companies")
    .update({
      name: input.name,
      slug: input.slug,
      phone: input.phone || null,
      category: input.category ?? null,
    })
    .eq("id", companyId);
}

/** The restaurant's own address/coordinates — used for the delivery-fee and
 *  ETA calculations everywhere the company shows up, and doubles as the
 *  pickup point a delivery partner is routed to for that order. */
export async function updateCompanyAddress(
  supabase: Client,
  companyId: string,
  input: {
    street: string;
    number?: string;
    neighborhood?: string;
    city: string;
    state?: string;
    postalCode?: string;
    lat?: number;
    lng?: number;
  },
) {
  return supabase
    .from("companies")
    .update({
      street: input.street,
      number: input.number || null,
      neighborhood: input.neighborhood || null,
      city: input.city,
      state: input.state || null,
      postal_code: input.postalCode || null,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
    })
    .eq("id", companyId);
}

/** Used by the settings form to warn before saving a slug that's already
 *  taken or reserved — the database constraint is still the source of
 *  truth, this is just a friendlier up-front check. */
export async function isSlugAvailable(supabase: Client, slug: string, excludeCompanyId: string) {
  if (RESERVED_SLUGS.has(slug)) return { available: false, error: null };
  const { data, error } = await supabase
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .neq("id", excludeCompanyId)
    .maybeSingle();
  if (error) return { available: null, error };
  return { available: !data, error: null };
}

/** Just what the checkout page needs about the restaurant in the cart:
 *  coordinates for the delivery-time estimate and which payment methods
 *  it accepts. Fetched fresh rather than carried in the cart itself, so it
 *  can't go stale if the restaurant moves or changes its settings. */
export async function getCompanyCheckoutInfo(supabase: Client, companyId: string) {
  return supabase
    .from("companies")
    .select("id, lat, lng, avg_prep_time_minutes, delivery_fee_base, accepted_payment_methods")
    .eq("id", companyId)
    .single();
}

/** The photo shown on the company's banners/cards across the app (home
 *  carousels, map, storefront) — either a fresh upload or one of the
 *  company's own product photos, picked via CompanyCoverPhotoForm. */
export async function updateCompanyCoverImage(supabase: Client, companyId: string, url: string) {
  return supabase.from("companies").update({ cover_image_url: url }).eq("id", companyId);
}

export async function updateAcceptedPaymentMethods(
  supabase: Client,
  companyId: string,
  methods: AcceptedPaymentMethod[],
) {
  return supabase.from("companies").update({ accepted_payment_methods: methods }).eq("id", companyId);
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
