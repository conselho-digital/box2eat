"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useCategories } from "./hooks";

/** Free-text category field with suggestions from this company's existing
 *  categories — typing a name that already exists reuses it, typing a new
 *  one creates it on save (resolved server-side in lib/domain/menu.ts). */
export function CategoryCombobox({
  id,
  companyId,
  value,
  onChange,
}: {
  id?: string;
  companyId: string;
  value: string;
  onChange: (name: string) => void;
}) {
  const { data: categories } = useCategories(companyId);
  const [open, setOpen] = useState(false);

  const query = value.trim().toLowerCase();
  const suggestions = (categories ?? []).filter((category) =>
    query ? category.name.toLowerCase().includes(query) : true,
  );
  const hasExactMatch = (categories ?? []).some(
    (category) => category.name.toLowerCase() === query,
  );

  return (
    <div className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder="Ex: Lanches"
        autoComplete="off"
      />
      {open && (suggestions.length > 0 || (query && !hasExactMatch)) && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border bg-popover py-1 shadow-md">
          {suggestions.map((category) => (
            <button
              key={category.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(category.name);
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
            >
              {category.name}
            </button>
          ))}
          {query && !hasExactMatch && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setOpen(false)}
              className="block w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted"
            >
              Criar categoria &quot;{value.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
