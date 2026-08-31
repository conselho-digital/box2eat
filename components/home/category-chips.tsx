import Link from "next/link";
import {
  Hamburger,
  Sandwich,
  Pizza,
  Fish,
  Drumstick,
  Salad,
  Soup,
  Beef,
  Utensils,
  Cookie,
  PawPrint,
  type LucideIcon,
} from "lucide-react";
import { FOOD_CATEGORIES, type FoodCategory } from "@/lib/domain/categories";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<FoodCategory, LucideIcon> = {
  Burguers: Hamburger,
  Mexicana: Sandwich,
  Pizza: Pizza,
  Sushi: Fish,
  Fastfood: Drumstick,
  Vegana: Salad,
  Asiática: Soup,
  Churrasco: Beef,
  Italiana: Utensils,
  Doces: Cookie,
  Petshop: PawPrint,
};

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
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {FOOD_CATEGORIES.map((item) => {
        const active = category === item;
        const Icon = CATEGORY_ICONS[item];
        return (
          <Link
            key={item}
            href={buildHref(active ? undefined : item)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap",
              active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            <Icon className="size-4" />
            {item}
          </Link>
        );
      })}
    </div>
  );
}
