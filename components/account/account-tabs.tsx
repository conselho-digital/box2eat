"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const ACCOUNT_TABS = [
  { href: "/conta", label: "Página inicial" },
  { href: "/conta/dados-pessoais", label: "Dados pessoais" },
  { href: "/conta/seguranca", label: "Segurança" },
  { href: "/conta/favoritos", label: "Favoritos" },
  { href: "/conta/pedidos", label: "Pedidos" },
  { href: "/conta/configuracoes", label: "Configurações" },
];

export function AccountTabs({
  tabs,
}: {
  tabs: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  const rootHref = tabs[0]?.href;

  return (
    <nav className="flex gap-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        // The first tab is the section's own root route (e.g. "/conta"),
        // which every other tab's route also starts with — it needs an
        // exact match so it doesn't stay "active" once you're on a subpage.
        const active = tab.href === rootHref ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2 text-sm whitespace-nowrap",
              active
                ? "border-foreground font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
