"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  listMyCompanyMemberships,
  MAX_COMPANIES_CONNECTED,
  MAX_COMPANIES_OWNED,
} from "@/lib/domain/companies";
import { CreateCompanyForm } from "./create-company-form";

export function CompanyList() {
  const [showForm, setShowForm] = useState(false);
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
  const canCreate = ownedCount < MAX_COMPANIES_OWNED;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Minhas empresas</h1>
          <p className="text-sm text-muted-foreground">
            {connectedCount}/{MAX_COMPANIES_CONNECTED} conectadas ·{" "}
            {ownedCount}/{MAX_COMPANIES_OWNED} criadas por você
          </p>
        </div>
        {canCreate && (
          <Button variant={showForm ? "outline" : "default"} onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancelar" : "Nova empresa"}
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar empresa</CardTitle>
            <CardDescription>
              Você vira o dono desta empresa automaticamente.
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
          Você ainda não está conectado a nenhuma empresa.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {data?.map((membership) => (
          <Card key={membership.id}>
            <CardHeader>
              <CardTitle>{membership.companies.name}</CardTitle>
              <CardDescription>
                {membership.role === "owner" ? "Dono" : "Funcionário"} ·{" "}
                {membership.companies.slug}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
