"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import {
  listMyCompanyMemberships,
  MAX_COMPANIES_CONNECTED,
  MAX_COMPANIES_OWNED,
} from "@/lib/domain/companies";
import { useCompanyListHeader } from "@/components/companies/company-list-header-context";
import { CreateCompanyForm } from "./create-company-form";

export function CompanyList() {
  const { showForm, setShowForm, setCanCreate } = useCompanyListHeader();
  const { data, isLoading } = useQuery({
    queryKey: ["my-companies"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listMyCompanyMemberships(supabase);
      if (error) throw error;
      return data;
    },
  });

  const ownedCount = data?.filter((m) => m.role === "owner").length ?? 0;
  const connectedCount = data?.length ?? 0;

  useEffect(() => {
    setCanCreate(ownedCount < MAX_COMPANIES_OWNED);
  }, [ownedCount, setCanCreate]);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        {connectedCount}/{MAX_COMPANIES_CONNECTED} conectadas · {ownedCount}/{MAX_COMPANIES_OWNED}{" "}
        criadas por você
      </p>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar restaurante</CardTitle>
            <CardDescription>
              Você vira o dono deste restaurante automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateCompanyForm onCreated={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      {!isLoading && data?.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Você ainda não está conectado a nenhum restaurante.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {data?.map((membership) => (
          <Link key={membership.id} href={`/empresas/${membership.company_id}`}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle>{membership.companies.name}</CardTitle>
                <CardDescription>
                  {membership.role === "owner" ? "Dono" : "Funcionário"} ·{" "}
                  {membership.companies.slug}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
