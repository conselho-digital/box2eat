"use client";

import { Button } from "@/components/ui/button";
import { useCompanyListHeader } from "@/components/companies/company-list-header-context";

export function CompanyListHeaderButton() {
  const { canCreate, showForm, setShowForm } = useCompanyListHeader();

  if (!canCreate) return null;

  return (
    <Button variant={showForm ? "outline" : "default"} size="sm" onClick={() => setShowForm((v) => !v)}>
      {showForm ? "Cancelar" : "Novo restaurante"}
    </Button>
  );
}
