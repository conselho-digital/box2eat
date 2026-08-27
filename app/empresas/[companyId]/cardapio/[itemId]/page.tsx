"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getItem } from "@/lib/domain/menu";
import { Separator } from "@/components/ui/separator";
import { ItemEditForm } from "@/components/menu/item-edit-form";
import { ItemImageUpload } from "@/components/menu/item-image-upload";
import { OptionGroupManager } from "@/components/menu/option-group-manager";

export default function MenuItemDetailPage({
  params,
}: {
  params: Promise<{ companyId: string; itemId: string }>;
}) {
  const { companyId, itemId } = use(params);

  const { data: item, isLoading } = useQuery({
    queryKey: ["menu-item", itemId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await getItem(supabase, itemId);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (!item) return <p className="text-sm text-destructive">Item não encontrado.</p>;

  return (
    <div className="flex flex-col gap-8">
      <Link
        href={`/empresas/${companyId}/cardapio`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Voltar ao cardápio
      </Link>

      <ItemImageUpload itemId={itemId} companyId={companyId} imageUrl={item.image_url} />
      <ItemEditForm item={item} companyId={companyId} />

      <Separator />

      <OptionGroupManager itemId={itemId} />
    </div>
  );
}
