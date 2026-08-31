"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { updateCompanyCategory } from "@/lib/domain/companies";
import { FOOD_CATEGORIES } from "@/lib/domain/categories";

export function CompanyCategoryForm({
  companyId,
  category,
}: {
  companyId: string;
  category: string | null;
}) {
  const [value, setValue] = useState(category ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!value) return;
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    await updateCompanyCategory(supabase, companyId, value);
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
      >
        <option value="">Selecione uma categoria…</option>
        {FOOD_CATEGORIES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <Button type="button" size="sm" variant="outline" onClick={handleSave} disabled={saving || !value}>
        {saving ? "Salvando…" : "Salvar"}
      </Button>
      {saved && <span className="text-sm text-primary">Salvo.</span>}
    </div>
  );
}
