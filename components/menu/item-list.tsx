"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { deleteItem, setItemAvailability, type MenuItem } from "@/lib/domain/menu";
import { itemsQueryKey, useCategories, useMenuItems } from "./hooks";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function ItemList({ companyId }: { companyId: string }) {
  const queryClient = useQueryClient();
  const { data: items, isLoading } = useMenuItems(companyId);
  const { data: categories } = useCategories(companyId);

  const availabilityMutation = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const supabase = createClient();
      const { error } = await setItemAvailability(supabase, id, value);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: itemsQueryKey(companyId) }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await deleteItem(supabase, id);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: itemsQueryKey(companyId) }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  if (!items || items.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum item no cardápio ainda.</p>;
  }

  const categoryName = (id: string | null) =>
    categories?.find((c) => c.id === id)?.name ?? "Sem categoria";

  const grouped = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const key = categoryName(item.category_id);
    (acc[key] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">{category}</h3>
          <div className="flex flex-col divide-y rounded-lg border">
            {categoryItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 p-3">
                <div className="flex flex-col">
                  <Link
                    href={`/empresas/${companyId}/cardapio/${item.id}`}
                    className="font-medium hover:underline"
                  >
                    {item.name}
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    {currency.format(item.price)}
                    {item.menu_item_option_groups.length > 0 &&
                      ` · ${item.menu_item_option_groups.length} grupo(s) de opções`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={item.is_available ? "secondary" : "outline"}
                    onClick={() =>
                      availabilityMutation.mutate({ id: item.id, value: !item.is_available })
                    }
                  >
                    {item.is_available ? "Disponível" : "Indisponível"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(item.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
