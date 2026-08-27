"use client";

import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { CategoryManager } from "@/components/menu/category-manager";
import { ItemForm } from "@/components/menu/item-form";
import { ItemList } from "@/components/menu/item-list";

export default function CardapioPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const [showItemForm, setShowItemForm] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <CategoryManager companyId={companyId} />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Itens</h2>
          <Button variant={showItemForm ? "outline" : "default"} onClick={() => setShowItemForm((v) => !v)}>
            {showItemForm ? "Cancelar" : "Novo item"}
          </Button>
        </div>
        {showItemForm && (
          <div className="rounded-lg border p-4">
            <ItemForm companyId={companyId} onCreated={() => setShowItemForm(false)} />
          </div>
        )}
        <ItemList companyId={companyId} />
      </div>
    </div>
  );
}
