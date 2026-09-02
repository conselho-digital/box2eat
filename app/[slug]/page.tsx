import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCompanyBySlug } from "@/lib/domain/companies-detail";
import { incrementCompanyView, formatCompanyAddress } from "@/lib/domain/companies";
import { listPublicMenu, type MenuItem } from "@/lib/domain/menu";
import { isFavorite } from "@/lib/domain/favorites";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { MenuItemCard } from "@/components/menu/menu-item-card";

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: company } = await getCompanyBySlug(supabase, slug);
  if (!company || company.status === "closed") notFound();

  await incrementCompanyView(supabase, company.id);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const favorited = user ? await isFavorite(supabase, company.id) : false;

  const { categories, items } = await listPublicMenu(supabase, company.id);

  const categoryName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name ?? "Outros";

  const grouped = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const key = categoryName(item.category_id);
    (acc[key] ??= []).push(item);
    return acc;
  }, {});

  const cartCompany = {
    id: company.id,
    name: company.name,
    slug: company.slug,
    logoUrl: company.logo_url,
    address: formatCompanyAddress(company),
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          {company.description && (
            <p className="text-muted-foreground">{company.description}</p>
          )}
          {company.rating_count > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              ★ {company.rating_avg?.toFixed(1)}{" "}
              <span className="text-xs">({company.rating_count} avaliações)</span>
            </p>
          )}
          {!company.is_open && (
            <p className="mt-1 text-sm text-destructive">
              Restaurante fechado no momento.
            </p>
          )}
        </div>
        {user ? (
          <FavoriteButton companyId={company.id} userId={user.id} initialFavorited={favorited} />
        ) : (
          <Link href="/login" className="text-sm text-muted-foreground hover:underline">
            Entrar para favoritar
          </Link>
        )}
      </div>

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Cardápio ainda não disponível.
        </p>
      )}

      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{category}</h2>
          <div className="flex flex-col divide-y rounded-lg border">
            {categoryItems.map((item) => (
              <MenuItemCard key={item.id} item={item} company={cartCompany} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
