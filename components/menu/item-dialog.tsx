"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { deleteItem, setItemAvailability, type MenuItem } from "@/lib/domain/menu";
import { itemsQueryKey } from "./hooks";
import { ItemForm } from "./item-form";
import { ItemEditForm } from "./item-edit-form";
import { ItemImageUpload } from "./item-image-upload";

export function ItemDialog({
  companyId,
  item,
  open,
  onOpenChange,
}: {
  companyId: string;
  /** null means "create a new item" instead of editing one. */
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const availabilityMutation = useMutation({
    mutationFn: async (value: boolean) => {
      if (!item) return;
      const supabase = createClient();
      const { error } = await setItemAvailability(supabase, item.id, value);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: itemsQueryKey(companyId) }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!item) return;
      const supabase = createClient();
      const { error } = await deleteItem(supabase, item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsQueryKey(companyId) });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? "Editar item" : "Novo item"}</DialogTitle>
        </DialogHeader>

        {item ? (
          <div className="flex flex-col gap-4">
            <ItemImageUpload itemId={item.id} companyId={companyId} imageUrl={item.image_url} />
            <ItemEditForm item={item} companyId={companyId} />

            <div className="flex items-center justify-between border-t pt-4">
              <Button
                type="button"
                size="sm"
                variant={item.is_available ? "secondary" : "outline"}
                onClick={() => availabilityMutation.mutate(!item.is_available)}
              >
                {item.is_available ? "Disponível" : "Indisponível"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (window.confirm(`Excluir "${item.name}"?`)) deleteMutation.mutate();
                }}
              >
                Excluir item
              </Button>
            </div>

            <Link
              href={`/empresas/${companyId}/cardapio/${item.id}`}
              className="text-sm text-primary hover:underline"
            >
              Opções e variações →
            </Link>
          </div>
        ) : (
          <ItemForm companyId={companyId} onCreated={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
