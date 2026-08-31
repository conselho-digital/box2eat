import Link from "next/link";
import { FOOD_CATEGORIES } from "@/lib/domain/categories";
import { cn } from "@/lib/utils";

export function CategoryChips({
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
  function buildHref(nextCategory?: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (open) params.set("open", open);
    if (sort) params.set("sort", sort);
    if (nextCategory) params.set("category", nextCategory);
    const query = params.toString();
    return query ? `/?${query}` : "/";
  }

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
      {FOOD_CATEGORIES.map((item) => {
        const active = category === item;
        return (
          <Link
            key={item}
            href={buildHref(active ? undefined : item)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap",
              active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            {item}
          </Link>
        );
      })}
    </div>
  );
}
