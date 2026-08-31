"use client";

import Link from "next/link";
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
      <p className="text-sm text-muted-foreground">
        Você ainda não favoritou nenhum restaurante.
      </p>
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
