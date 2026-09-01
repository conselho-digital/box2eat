import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { listPublicCompanies, type CompanySearchParams } from "@/lib/domain/companies";
import { MapView } from "@/components/map/map-view";
import { LAT_COOKIE, LNG_COOKIE } from "@/lib/domain/location-cookie";

export default async function MapaPage({
  searchParams,
}: {
  searchParams: Promise<Pick<CompanySearchParams, "q" | "open" | "sort">>;
}) {
  const { q, open, sort } = await searchParams;
  const cookieStore = await cookies();
  const lat = cookieStore.get(LAT_COOKIE)?.value;
  const lng = cookieStore.get(LNG_COOKIE)?.value;

  const supabase = await createClient();
  const companies = await listPublicCompanies(supabase, { q, open, sort, lat, lng });

  return (
    // Cancels the mobile bottom-nav padding reserved in Providers, so the
    // map fills the screen and shows through behind the floating nav
    // buttons instead of stopping above them.
    <div className="-mb-20 flex flex-1 flex-col sm:mb-0">
      <MapView
        companies={companies}
        initialLat={lat ? Number(lat) : undefined}
        initialLng={lng ? Number(lng) : undefined}
      />
    </div>
  );
}
