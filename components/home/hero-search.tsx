"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Map } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HeroSearch({
  q,
  open,
  sort,
}: {
  q?: string;
  open?: string;
  sort?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(q ?? "");

  function navigate(extra: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged: Record<string, string | undefined> = { q: value, open, sort, ...extra };
    if (merged.q) params.set("q", merged.q);
    if (merged.open) params.set("open", merged.open);
    if (merged.sort) params.set("sort", merged.sort);
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  const mapParams = new URLSearchParams();
  if (value) mapParams.set("q", value);
  if (open) mapParams.set("open", open);
  if (sort) mapParams.set("sort", sort);
  const mapHref = mapParams.toString() ? `/mapa?${mapParams.toString()}` : "/mapa";

  return (
    <div className="flex flex-col gap-2">
      <form
        className="flex flex-col gap-2 rounded-2xl bg-card p-2 shadow-lg sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({});
        }}
      >
        <Input
          type="text"
          placeholder="Buscar restaurantes…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-11 flex-1 rounded-xl border-0 bg-muted px-4 text-foreground"
        />
        <Button
          type="button"
          variant="outline"
          className="hidden h-11 gap-1.5 rounded-xl px-4 text-foreground sm:inline-flex"
          render={<Link href={mapHref} />}
          nativeButton={false}
        >
          <Map className="size-4" />
          Mapa
        </Button>
        <Button type="submit" className="h-11 rounded-xl px-6">
          Buscar
        </Button>
      </form>
    </div>
  );
}
