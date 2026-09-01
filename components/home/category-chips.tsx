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
  Beer,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { AGE_RESTRICTED_CATEGORIES, FOOD_CATEGORIES, type FoodCategory } from "@/lib/domain/categories";
import { cn } from "@/lib/utils";

export const CATEGORY_ICONS: Record<FoodCategory, LucideIcon> = {
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
  Bebidas: Beer,
};

export function CategoryChips({
  q,
  open,
  sort,
  category,
  loggedIn,
  identityVerified,
}: {
  q?: string;
  open?: string;
  sort?: string;
  category?: string;
  loggedIn: boolean;
  identityVerified: boolean;
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
        const restricted = AGE_RESTRICTED_CATEGORIES.includes(item) && !identityVerified;
        const href = restricted
          ? loggedIn
            ? "/conta/identidade"
            : "/login?next=/conta/identidade"
          : buildHref(active ? undefined : item);

        return (
          <Link
            key={item}
            href={href}
            className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-center"
          >
            <span
              className={cn(
                "relative flex size-14 items-center justify-center rounded-2xl border",
                active ? "border-primary bg-primary text-primary-foreground" : "bg-muted/60 hover:bg-muted",
              )}
            >
              <Icon className="size-6" />
              {restricted && (
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-foreground text-background">
                  <Lock className="size-3" />
                </span>
              )}
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
