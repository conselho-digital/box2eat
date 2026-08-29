import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { ProfileAddressInput } from "@/lib/validations/address";

type Client = SupabaseClient<Database>;

export type UserAddress = Database["public"]["Tables"]["user_addresses"]["Row"];

export async function getMyAddress(supabase: Client, userId: string) {
  return supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();
}

export async function upsertMyAddress(
  supabase: Client,
  userId: string,
  existingId: string | null,
  input: ProfileAddressInput & { lat?: number; lng?: number },
) {
  const row = {
    user_id: userId,
    street: input.street,
    number: input.number || null,
    complement: input.complement || null,
    neighborhood: input.neighborhood || null,
    city: input.city,
    state: input.state || "",
    postal_code: input.postalCode || null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    is_default: true,
  };

  if (existingId) {
    return supabase.from("user_addresses").update(row).eq("id", existingId);
  }
  return supabase.from("user_addresses").insert(row);
}

type NominatimAddress = {
  road?: string;
  house_number?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  postcode?: string;
};

export async function reverseGeocode(lat: number, lng: number) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
  );
  if (!res.ok) throw new Error("Não foi possível identificar o endereço.");
  const data: { address?: NominatimAddress } = await res.json();
  const address = data.address ?? {};

  return {
    street: address.road ?? "",
    number: address.house_number ?? "",
    neighborhood: address.suburb ?? address.neighbourhood ?? "",
    city: address.city ?? address.town ?? address.village ?? "",
    state: address.state ?? "",
    postalCode: address.postcode ?? "",
  };
}
