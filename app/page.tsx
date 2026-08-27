import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroSearch } from "@/components/home/hero-search";
import { createClient } from "@/lib/supabase/server";
import { haversineDistanceKm } from "@/lib/geo";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type SearchParams = { q?: string; open?: string; sort?: string; lat?: string; lng?: string };

function buildHref(current: SearchParams, changes: SearchParams) {
  const params = new URLSearchParams();
  const merged = { ...current, ...changes };
  if (merged.q) params.set("q", merged.q);
  if (merged.open) params.set("open", merged.open);
  if (merged.sort) params.set("sort", merged.sort);
  if (merged.lat) params.set("lat", merged.lat);
  if (merged.lng) params.set("lng", merged.lng);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, open, sort, lat, lng } = await searchParams;
  const supabase = await createClient();

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

  const { data: rawCompanies } = await query;
  let companies = rawCompanies ?? [];

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

  const hasFilters = Boolean(q || open || sort || lat);

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[oklch(0.6_0.2_35)] to-[oklch(0.5_0.18_30)] p-6 text-primary-foreground sm:p-10">
        <div className="flex max-w-xl flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Peça uma entrega perto de você
          </h1>
          <p className="text-primary-foreground/90">
            Peça comida das melhores empresas perto de você, ou cadastre a sua e
            comece a vender.
          </p>
          <HeroSearch q={q} open={open} sort={sort} />
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Button
              render={
                <Link href={buildHref({ q, open, sort, lat, lng }, { open: open === "1" ? undefined : "1" })} />
              }
              nativeButton={false}
              variant={open === "1" ? "default" : "secondary"}
              size="sm"
            >
              Aberto agora
            </Button>
            <Button
              render={
                <Link
                  href={buildHref(
                    { q, open, sort, lat, lng },
                    { sort: sort === "rating" ? undefined : "rating", lat: undefined, lng: undefined },
                  )}
                />
              }
              nativeButton={false}
              variant={sort === "rating" && !lat ? "default" : "secondary"}
              size="sm"
            >
              Mais bem avaliadas
            </Button>
            {hasFilters && (
              <Link href="/" className="text-primary-foreground/80 hover:underline">
                Limpar filtros
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-2xl gap-3 text-left sm:grid-cols-2">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/loja/${company.slug}`}
            className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <p className="font-medium">{company.name}</p>
            {company.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {company.description}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {company.is_open ? "Aberto agora" : "Fechado"}
              {company.min_order_value > 0 &&
                ` · Pedido mínimo ${currency.format(company.min_order_value)}`}
              {company.rating_count > 0 &&
                ` · ★ ${company.rating_avg?.toFixed(1)} (${company.rating_count})`}
            </p>
          </Link>
        ))}
        {companies.length === 0 && (
          <p className="text-sm text-muted-foreground sm:col-span-2">
            Nenhuma empresa encontrada.
          </p>
        )}
      </div>
    </div>
  );
}
