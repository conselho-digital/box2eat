import Image from "next/image";
import Link from "next/link";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSearch } from "@/components/home/hero-search";
import { NearMeButton } from "@/components/home/near-me-button";
import { createClient } from "@/lib/supabase/server";
import { listPublicCompanies, type CompanySearchParams } from "@/lib/domain/companies";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type SearchParams = CompanySearchParams;

function buildHref(current: SearchParams, changes: SearchParams) {
  const params = new URLSearchParams();
  const merged = { ...current, ...changes };
  if (merged.q) params.set("q", merged.q);
  if (merged.open) params.set("open", merged.open);
  if (merged.sort) params.set("sort", merged.sort);
  if (merged.lat) params.set("lat", merged.lat);
  if (merged.lng) params.set("lng", merged.lng);
  if (merged.near) params.set("near", merged.near);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, open, sort, lat, lng, near } = await searchParams;
  const supabase = await createClient();
  const companies = await listPublicCompanies(supabase, { q, open, sort, lat, lng });

  const hasFilters = Boolean(q || open || sort || lat);

  const mapParams = new URLSearchParams();
  if (q) mapParams.set("q", q);
  if (open) mapParams.set("open", open);
  if (sort) mapParams.set("sort", sort);
  if (lat) mapParams.set("lat", lat);
  if (lng) mapParams.set("lng", lng);
  const mapHref = mapParams.toString() ? `/mapa?${mapParams.toString()}` : "/mapa";

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6">
      <Button
        className="fixed bottom-6 right-4 z-40 size-12 rounded-full shadow-lg sm:hidden"
        render={<Link href={mapHref} />}
        nativeButton={false}
        size="icon"
        aria-label="Abrir mapa"
      >
        <Map className="size-5" />
      </Button>

      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-10">
        <Image
          src="/brand/hero-food.webp"
          alt=""
          fill
          priority
          className="object-cover"
        />
        {/* White wash over the photo so it stays in the background instead
            of competing with the search bar — only ~40% of the original
            color shows through. */}
        <div className="absolute inset-0 bg-white/60" />
        <div className="relative flex max-w-xl flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Peça uma entrega perto de você
          </h1>
          <p className="text-foreground/80">
            Peça comida das melhores empresas perto de você, ou cadastre a sua e
            comece a vender.
          </p>
          <HeroSearch q={q} open={open} sort={sort} lat={lat} lng={lng} />
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <NearMeButton q={q} open={open} sort={sort} lat={lat} lng={lng} near={near} />
            <Button
              render={
                <Link
                  href={buildHref(
                    { q, open, sort, lat, lng, near },
                    { open: open === "1" ? undefined : "1" },
                  )}
                />
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
                    { q, open, sort, lat, lng, near },
                    {
                      sort: sort === "rating" ? undefined : "rating",
                      lat: undefined,
                      lng: undefined,
                      near: "off",
                    },
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
              <Link href="/" className="text-foreground/70 hover:underline">
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
