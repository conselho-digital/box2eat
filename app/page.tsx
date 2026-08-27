import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function Home() {
  const supabase = await createClient();

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, slug, description, min_order_value, is_open, rating_avg, rating_count")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col items-center gap-8 p-6 text-center">
      <div className="flex flex-col items-center gap-3 pt-6">
        <h1 className="text-4xl font-bold tracking-tight">Box2eat</h1>
        <p className="max-w-md text-muted-foreground">
          Peça comida das melhores empresas perto de você, ou cadastre a sua e
          comece a vender.
        </p>
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
            Nenhuma empresa cadastrada ainda.
          </p>
        )}
      </div>
    </div>
  );
}
