import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export type BusinessHour = Database["public"]["Tables"]["company_business_hours"]["Row"];

export const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

export async function listBusinessHours(supabase: Client, companyId: string) {
  return supabase
    .from("company_business_hours")
    .select("*")
    .eq("company_id", companyId)
    .order("day_of_week", { ascending: true });
}

export type BusinessHourInput = {
  dayOfWeek: number;
  isClosed: boolean;
  opensAt: string | null;
  closesAt: string | null;
};

/** The editor always submits the full week together, so replacing all 7
 *  rows in one upsert is simpler and just as correct as diffing. */
export async function upsertBusinessHours(
  supabase: Client,
  companyId: string,
  hours: BusinessHourInput[],
) {
  return supabase.from("company_business_hours").upsert(
    hours.map((h) => ({
      company_id: companyId,
      day_of_week: h.dayOfWeek,
      is_closed: h.isClosed,
      opens_at: h.opensAt,
      closes_at: h.closesAt,
    })),
    { onConflict: "company_id,day_of_week" },
  );
}
