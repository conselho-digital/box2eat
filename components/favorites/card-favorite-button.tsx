"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { addFavorite, removeFavorite } from "@/lib/domain/favorites";

export function CardFavoriteButton({
  companyId,
  userId,
  initialFavorited,
}: {
  companyId: string;
  userId: string;
  initialFavorited: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, setPending] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    setPending(true);
    const supabase = createClient();
    if (favorited) {
      const { error } = await removeFavorite(supabase, companyId);
      if (!error) setFavorited(false);
    } else {
      const { error } = await addFavorite(supabase, userId, companyId);
      if (!error) setFavorited(true);
    }
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className="rounded-full p-1 text-muted-foreground hover:text-foreground"
    >
      <Heart className={favorited ? "size-4 fill-primary text-primary" : "size-4"} />
    </button>
  );
}
