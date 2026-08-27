"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { updateItem, uploadMenuImage } from "@/lib/domain/menu";

export function ItemImageUpload({
  itemId,
  companyId,
  imageUrl,
}: {
  itemId: string;
  companyId: string;
  imageUrl: string | null;
}) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const supabase = createClient();
      const { data: publicUrl, error: uploadError } = await uploadMenuImage(
        supabase,
        companyId,
        file,
      );
      if (uploadError) throw uploadError;
      const { error: updateError } = await updateItem(supabase, itemId, {
        imageUrl: publicUrl,
      });
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["menu-item", itemId] });
      queryClient.invalidateQueries({ queryKey: ["menu-items", companyId] });
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="flex items-center gap-4">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          width={64}
          height={64}
          className="size-16 rounded-lg object-cover"
        />
      ) : (
        <div className="flex size-16 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
          Sem foto
        </div>
      )}
      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) mutation.mutate(file);
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={mutation.isPending}
          onClick={() => inputRef.current?.click()}
        >
          {mutation.isPending ? "Enviando…" : "Trocar foto"}
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
