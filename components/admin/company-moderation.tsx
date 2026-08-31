"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { listAllCompanies, setCompanyStatus } from "@/lib/domain/admin";

const STATUS_LABEL: Record<string, string> = {
  active: "Ativa",
  paused: "Pausada",
  closed: "Fechada",
};

export function CompanyModeration() {
  const queryClient = useQueryClient();
  const queryKey = ["admin-companies"];

  const { data: companies, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listAllCompanies(supabase);
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "paused" | "closed" }) => {
      const supabase = createClient();
      const { error } = await setCompanyStatus(supabase, id, status);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  return (
    <div className="flex flex-col divide-y rounded-lg border">
      {companies?.map((company) => (
        <div key={company.id} className="flex items-center justify-between gap-2 p-3 text-sm">
          <div>
            <Link href={`/${company.slug}`} className="font-medium hover:underline" target="_blank">
              {company.name}
            </Link>
            <p className="text-xs text-muted-foreground">{STATUS_LABEL[company.status] ?? company.status}</p>
          </div>
          <div className="flex gap-2">
            {company.status !== "active" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => mutation.mutate({ id: company.id, status: "active" })}
              >
                Ativar
              </Button>
            )}
            {company.status !== "paused" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => mutation.mutate({ id: company.id, status: "paused" })}
              >
                Pausar
              </Button>
            )}
            {company.status !== "closed" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => mutation.mutate({ id: company.id, status: "closed" })}
              >
                Fechar
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
