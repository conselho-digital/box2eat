"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { addFavorite, removeFavorite } from "@/lib/domain/favorites";

export function FavoriteButton({
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

  async function toggle() {
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
    <Button
      type="button"
      variant={favorited ? "secondary" : "outline"}
      size="sm"
      disabled={pending}
      onClick={toggle}
    >
      {favorited ? "♥ Favoritado" : "♡ Favoritar"}
    </Button>
  );
}
