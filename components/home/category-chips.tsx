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
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {FOOD_CATEGORIES.map((item) => {
        const active = category === item;
        const Icon = CATEGORY_ICONS[item];
        return (
          <Link
            key={item}
            href={buildHref(active ? undefined : item)}
            className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-center"
          >
            <span
              className={cn(
                "flex size-14 items-center justify-center rounded-2xl border",
                active ? "border-primary bg-primary text-primary-foreground" : "bg-muted/60 hover:bg-muted",
              )}
            >
              <Icon className="size-6" />
            </span>
            <span className={cn("text-xs leading-tight whitespace-nowrap", active && "font-medium text-primary")}>
              {item}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
