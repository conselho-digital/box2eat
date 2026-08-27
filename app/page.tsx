import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type SearchParams = { q?: string; open?: string; sort?: string };

function buildHref(current: SearchParams, changes: SearchParams) {
  const params = new URLSearchParams();
  const merged = { ...current, ...changes };
  if (merged.q) params.set("q", merged.q);
  if (merged.open) params.set("open", merged.open);
  if (merged.sort) params.set("sort", merged.sort);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, open, sort } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("companies")
    .select("id, name, slug, description, min_order_value, is_open, rating_avg, rating_count")
    .eq("status", "active");

  if (q?.trim()) {
    query = query.ilike("name", `%${q.trim()}%`);
  }
  if (open === "1") {
    query = query.eq("is_open", true);
  }
  if (sort === "rating") {
    query = query.order("rating_avg", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: companies } = await query;

  const hasFilters = Boolean(q || open || sort);

  return (
    <div className="flex flex-1 flex-col items-center gap-8 p-6 text-center">
      <div className="flex flex-col items-center gap-3 pt-6">
        <h1 className="text-4xl font-bold tracking-tight">Box2eat</h1>
        <p className="max-w-md text-muted-foreground">
          Peça comida das melhores empresas perto de você, ou cadastre a sua e
          comece a vender.
        </p>
      </div>

      <div className="flex w-full max-w-2xl flex-col gap-3">
        <form className="flex gap-2" action="/">
          {open && <input type="hidden" name="open" value={open} />}
          {sort && <input type="hidden" name="sort" value={sort} />}
          <Input
            type="text"
            name="q"
            placeholder="Buscar empresas…"
            defaultValue={q ?? ""}
            className="flex-1"
          />
          <Button type="submit">Buscar</Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-left text-sm">
          <Button
            render={<Link href={buildHref({ q, open, sort }, { open: open === "1" ? undefined : "1" })} />}
            nativeButton={false}
            variant={open === "1" ? "default" : "outline"}
            size="sm"
          >
            Aberto agora
          </Button>
          <Button
            render={<Link href={buildHref({ q, open, sort }, { sort: sort === "rating" ? undefined : "rating" })} />}
            nativeButton={false}
            variant={sort === "rating" ? "default" : "outline"}
            size="sm"
          >
            Mais bem avaliadas
          </Button>
          {hasFilters && (
            <Link href="/" className="text-muted-foreground hover:underline">
              Limpar filtros
            </Link>
          )}
        </div>
      </div>

      <div className="grid w-full max-w-2xl gap-3 text-left sm:grid-cols-2">
        {companies?.map((company) => (
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
        {companies?.length === 0 && (
          <p className="text-sm text-muted-foreground sm:col-span-2">
            Nenhuma empresa encontrada.
          </p>
        )}
      </div>
    </div>
  );
}
