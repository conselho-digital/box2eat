"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SimpleSearch({
  q,
  open,
  sort,
  category,
}: {
  q?: string;
  open?: string;
  sort?: string;
  category?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(q ?? "");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const params = new URLSearchParams();
    if (value) params.set("q", value);
    if (open) params.set("open", open);
    if (sort) params.set("sort", sort);
    if (category) params.set("category", category);
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Buscar restaurantes…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-11 rounded-xl pl-10"
      />
    </div>
  );
}
