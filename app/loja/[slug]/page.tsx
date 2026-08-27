import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getCompanyBySlug } from "@/lib/domain/companies-detail";
import { listPublicMenu, type MenuItem } from "@/lib/domain/menu";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: company } = await getCompanyBySlug(supabase, slug);
  if (!company || company.status === "closed") notFound();

  const { categories, items } = await listPublicMenu(supabase, company.id);

  const categoryName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name ?? "Outros";

  const grouped = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const key = categoryName(item.category_id);
    (acc[key] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 p-6">
      <div>
        <h1 className="text-2xl font-bold">{company.name}</h1>
        {company.description && (
          <p className="text-muted-foreground">{company.description}</p>
        )}
        {!company.is_open && (
          <p className="mt-1 text-sm text-destructive">
            Empresa fechada no momento.
          </p>
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
              <div key={item.id} className="flex gap-3 p-3">
                {item.image_url && (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="size-16 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {currency.format(item.price)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  {item.menu_item_option_groups.length > 0 && (
                    <ul className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
                      {item.menu_item_option_groups.map((group) => (
                        <li key={group.id}>
                          {group.name}
                          {group.is_required && " (obrigatório)"}:{" "}
                          {group.menu_item_options
                            .filter((o) => o.is_available)
                            .map((o) => o.name)
                            .join(", ")}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
