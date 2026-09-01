import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HeroSearch } from "@/components/home/hero-search";
import { SimpleSearch } from "@/components/home/simple-search";
import { CategoryChips } from "@/components/home/category-chips";
import { AddressBar } from "@/components/home/address-bar";
import { FeaturedCarousel } from "@/components/home/featured-carousel";
import { RecommendedCarousel } from "@/components/home/recommended-carousel";
import { PromoBannerCarousel } from "@/components/home/promo-banner-carousel";
import { RestaurantMenuCarousel } from "@/components/home/restaurant-menu-carousel";
import { NearMeButton } from "@/components/home/near-me-button";
import { RatingSortButton } from "@/components/home/rating-sort-button";
import { ClearFiltersLink } from "@/components/home/clear-filters-link";
import { createClient } from "@/lib/supabase/server";
import { listPublicCompanies, type CompanySearchParams } from "@/lib/domain/companies";
import { listPromotedCompanies, type PromotedCompany } from "@/lib/domain/coupons";
import { listRecommendedCompanies } from "@/lib/domain/recommendations";
import { listCompanyQueueInfo, type QueueInfo } from "@/lib/domain/queue";
import { listFavoriteCompanyIds } from "@/lib/domain/favorites";
import { listBestSellingItems, type MenuItem } from "@/lib/domain/menu";
import { getMyAddress } from "@/lib/domain/address";
import { isIdentityVerified } from "@/lib/domain/identity";
import { AGE_RESTRICTED_CATEGORIES, type FoodCategory } from "@/lib/domain/categories";
import { LAT_COOKIE, LNG_COOKIE, NEAR_OFF_COOKIE } from "@/lib/domain/location-cookie";

type SearchParams = Pick<CompanySearchParams, "q" | "open" | "sort" | "category">;

function buildHref(current: SearchParams, changes: SearchParams) {
  const params = new URLSearchParams();
  const merged = { ...current, ...changes };
  if (merged.q) params.set("q", merged.q);
  if (merged.open) params.set("open", merged.open);
  if (merged.sort) params.set("sort", merged.sort);
  if (merged.category) params.set("category", merged.category);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, open, sort, category } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  const lat = cookieStore.get(LAT_COOKIE)?.value;
  const lng = cookieStore.get(LNG_COOKIE)?.value;
  const nearOff = cookieStore.get(NEAR_OFF_COOKIE)?.value === "1";

  const identityVerified = user ? await isIdentityVerified(supabase, user.id) : false;
  const categoryIsRestricted = AGE_RESTRICTED_CATEGORIES.includes(category as FoodCategory);
  const effectiveCategory = categoryIsRestricted && !identityVerified ? undefined : category;

  const companies = await listPublicCompanies(supabase, {
    q,
    open,
    sort,
    lat,
    lng,
    category: effectiveCategory,
  });

  let initialAddress = null;
  let promotedCompanies: PromotedCompany[] = [];
  let recommendedCompanies: Awaited<ReturnType<typeof listRecommendedCompanies>>["data"] = [];
  let favoriteCompanyIds = new Set<string>();
  let queueInfoByCompany = new Map<string, QueueInfo>();
  let userLat: number | null = lat ? Number(lat) : null;
  let userLng: number | null = lng ? Number(lng) : null;
  if (user) {
    const addressResult = await getMyAddress(supabase, user.id);
    initialAddress = addressResult.data;
    userLat = initialAddress?.lat ?? userLat;
    userLng = initialAddress?.lng ?? userLng;

    const [{ data: promotions }, { data: recommended }, favorites] = await Promise.all([
      listPromotedCompanies(supabase),
      listRecommendedCompanies(supabase, user.id, userLat, userLng),
      listFavoriteCompanyIds(supabase),
    ]);
    promotedCompanies = promotions ?? [];
    recommendedCompanies = recommended ?? [];
    favoriteCompanyIds = favorites;

    const queueCompanyIds = [...new Set([...promotedCompanies.map((c) => c.id), ...(recommendedCompanies ?? []).map((c) => c.id)])];
    queueInfoByCompany = await listCompanyQueueInfo(supabase, queueCompanyIds);
  }

  const promotionsByCompany = new Map(promotedCompanies.map((p) => [p.id, p]));

  // Guests always browse via the best-seller carousels (same as a logged-in
  // user filtering by category); logged-in users without a category filter
  // keep the personalized Destaques/Recomendados/Banners home instead.
  const showMenuFeed = Boolean(!user || effectiveCategory);
  const companiesWithBestSellers: { company: (typeof companies)[number]; items: MenuItem[] }[] = [];
  const companiesWithoutBestSellers: (typeof companies)[number][] = [];
  if (showMenuFeed) {
    const companyIds = companies.map((c) => c.id);
    const [{ data: bestSellersByCompany }, categoryQueueInfo] = await Promise.all([
      listBestSellingItems(supabase, companyIds),
      listCompanyQueueInfo(supabase, companyIds),
    ]);
    for (const company of companies) {
      const items = bestSellersByCompany?.get(company.id) ?? [];
      if (items.length > 0) {
        companiesWithBestSellers.push({ company, items });
      } else {
        companiesWithoutBestSellers.push(company);
      }
    }
    for (const [companyId, info] of categoryQueueInfo) {
      queueInfoByCompany.set(companyId, info);
    }
  }

  const hasFilters = Boolean(q || open || sort || lat);

  const mapParams = new URLSearchParams();
  if (q) mapParams.set("q", q);
  if (open) mapParams.set("open", open);
  if (sort) mapParams.set("sort", sort);
  const mapHref = mapParams.toString() ? `/mapa?${mapParams.toString()}` : "/mapa";

  const menuFeed =
    companies.length === 0 ? (
      <p className="text-sm text-muted-foreground">Nenhum restaurante encontrado.</p>
    ) : (
      <>
        {companiesWithBestSellers.map(({ company, items }) => (
          <RestaurantMenuCarousel
            key={company.id}
            company={company}
            items={items}
            queueInfo={queueInfoByCompany.get(company.id)}
            loggedIn={Boolean(user)}
            userLat={userLat}
            userLng={userLng}
          />
        ))}
        {companiesWithoutBestSellers.length > 0 && (
          <div className="flex flex-col gap-3">
            {companiesWithBestSellers.length > 0 && (
              <h2 className="text-lg font-semibold">Outros restaurantes</h2>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {companiesWithoutBestSellers.map((company) => (
                <Link
                  key={company.id}
                  href={`/${company.slug}`}
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
                    {company.rating_count > 0 &&
                      ` · ★ ${company.rating_avg?.toFixed(1)} (${company.rating_count})`}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </>
    );

  const filterButtons = (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <NearMeButton lat={lat} lng={lng} nearOff={nearOff} />
      <Button
        render={
          <Link href={buildHref({ q, open, sort }, { open: open === "1" ? undefined : "1" })} />
        }
        nativeButton={false}
        variant={open === "1" ? "default" : "secondary"}
        size="sm"
      >
        Aberto agora
      </Button>
      <RatingSortButton
        active={sort === "rating" && !lat}
        href={buildHref({ q, open, sort }, { sort: sort === "rating" ? undefined : "rating" })}
      />
      {hasFilters && <ClearFiltersLink />}
    </div>
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
      <Button
        className="fixed bottom-6 right-4 z-40 size-12 rounded-full shadow-lg sm:hidden"
        render={<Link href={mapHref} />}
        nativeButton={false}
        size="icon"
        aria-label="Abrir mapa"
      >
        <MapIcon className="size-5" />
      </Button>

      {user ? (
        <>
          <div className="flex flex-col">
            <AddressBar userId={user.id} initialAddress={initialAddress} />
            <div className="sticky top-0 z-30 -mx-4 bg-background px-4 sm:-mx-6 sm:px-6">
              <SimpleSearch q={q} open={open} sort={sort} category={category} />
            </div>
            <CategoryChips
              q={q}
              open={open}
              sort={sort}
              category={category}
              loggedIn={Boolean(user)}
              identityVerified={identityVerified}
            />
          </div>
          {showMenuFeed ? (
            menuFeed
          ) : (
            <>
              {(promotedCompanies.length > 0 || (recommendedCompanies?.length ?? 0) > 0) && <Separator />}
              <FeaturedCarousel
                companies={promotedCompanies}
                userId={user.id}
                favoriteCompanyIds={favoriteCompanyIds}
                queueInfoByCompany={queueInfoByCompany}
                userLat={userLat}
                userLng={userLng}
              />
              {promotedCompanies.length > 0 && (recommendedCompanies?.length ?? 0) > 0 && <Separator />}
              <RecommendedCarousel
                companies={recommendedCompanies ?? []}
                promotionsByCompany={promotionsByCompany}
                userId={user.id}
                favoriteCompanyIds={favoriteCompanyIds}
                queueInfoByCompany={queueInfoByCompany}
                userLat={userLat}
                userLng={userLng}
              />
              {(recommendedCompanies?.length ?? 0) > 0 && promotedCompanies.length > 0 && <Separator />}
              <PromoBannerCarousel companies={promotedCompanies} />
            </>
          )}
        </>
      ) : (
        <>
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
                Peça comida dos melhores restaurantes perto de você, ou cadastre o seu e
                comece a vender.
              </p>
              <HeroSearch q={q} open={open} sort={sort} />
              {filterButtons}
            </div>
          </section>
          <CategoryChips
            q={q}
            open={open}
            sort={sort}
            category={category}
            loggedIn={Boolean(user)}
            identityVerified={identityVerified}
          />
          {menuFeed}
        </>
      )}
    </div>
  );
}
