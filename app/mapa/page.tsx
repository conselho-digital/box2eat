import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listPublicCompanies, type CompanySearchParams } from "@/lib/domain/companies";
import { MapView } from "@/components/map/map-view";

export default async function MapaPage({
  searchParams,
}: {
  searchParams: Promise<CompanySearchParams>;
}) {
  const { q, open, sort, lat, lng } = await searchParams;
  const supabase = await createClient();
  const companies = await listPublicCompanies(supabase, { q, open, sort, lat, lng });

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b p-3">
        <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="size-4" />
          Voltar
        </Link>
        <span className="text-sm text-muted-foreground">
          {companies.length} {companies.length === 1 ? "empresa" : "empresas"}
        </span>
      </div>
      <div className="h-[75vh] w-full">
        <MapView
          companies={companies}
          initialLat={lat ? Number(lat) : undefined}
          initialLng={lng ? Number(lng) : undefined}
        />
      </div>
    </div>
  );
}
