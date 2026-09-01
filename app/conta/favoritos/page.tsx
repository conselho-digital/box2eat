"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { listFavorites, removeFavorite } from "@/lib/domain/favorites";

export default function FavoritesPage() {
  const queryClient = useQueryClient();
  const queryKey = ["favorites"];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listFavorites(supabase);
      if (error) throw error;
      return data;
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (companyId: string) => {
      const supabase = createClient();
      const { error } = await removeFavorite(supabase, companyId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center">
        <div className="relative flex size-28 items-center justify-center">
          <span className="absolute top-0 right-4 size-2.5 rounded-full bg-emerald-400" />
          <span className="absolute top-3 -right-1 size-6 rotate-45 rounded-md bg-amber-400" />
          <span className="absolute bottom-2 -left-2 size-5 rounded-full bg-primary/15" />
          <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
            <Heart className="size-9 text-primary" strokeWidth={1.75} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold">Favorite restaurantes para achá-los rápido</h1>
          <p className="max-w-xs text-sm text-muted-foreground">
            Toque no coração em qualquer restaurante para adicioná-lo aos seus favoritos — eles
            aparecerão aqui.
          </p>
        </div>

        <Button render={<Link href="/" />} nativeButton={false} size="lg" className="rounded-full px-6">
          Explorar restaurantes
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {data.map((favorite) => (
        <Card key={favorite.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle>
                <Link href={`/${favorite.companies.slug}`} className="hover:underline">
                  {favorite.companies.name}
                </Link>
              </CardTitle>
              <CardDescription>{favorite.companies.description}</CardDescription>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeMutation.mutate(favorite.company_id)}
            >
              Remover
            </Button>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
