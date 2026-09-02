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

export async function listMyAddresses(supabase: Client, userId: string) {
  return supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true })
    .returns<UserAddress[]>();
}

export async function setDefaultAddress(supabase: Client, addressId: string) {
  return supabase.from("user_addresses").update({ is_default: true }).eq("id", addressId);
}

export async function deleteAddress(supabase: Client, addressId: string) {
  return supabase.from("user_addresses").delete().eq("id", addressId);
}

export async function upsertMyAddress(
  supabase: Client,
  userId: string,
  existingId: string | null,
  input: ProfileAddressInput & { lat?: number; lng?: number },
  makeDefault = true,
) {
  const row = {
    user_id: userId,
    label: input.label || null,
    street: input.street,
    number: input.number || null,
    complement: input.complement || null,
    neighborhood: input.neighborhood || null,
    city: input.city,
    state: input.state || "",
    postal_code: input.postalCode || null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    is_default: makeDefault,
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

export async function geocodeAddress(input: {
  street: string;
  number?: string;
  city: string;
  state?: string;
}) {
  const query = [input.street, input.number, input.city, input.state, "Brasil"]
    .filter(Boolean)
    .join(", ");
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
  );
  if (!res.ok) throw new Error("Não foi possível localizar o endereço no mapa.");
  const data: { lat: string; lon: string }[] = await res.json();
  if (data.length === 0) return null;
  return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
}

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
