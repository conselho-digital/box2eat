"use client";

import { usePathname } from "next/navigation";
import { AccountTabs } from "@/components/account/account-tabs";

/** Second navbar row with the company dashboard's tabs — shown on
 *  /empresas/[companyId] and its subpages, hidden everywhere else. The
 *  company id comes straight from the URL, so no context bridge is needed
 *  just for this. */
export function CompanyDashboardTabsRow() {
  const pathname = usePathname();
  const match = pathname.match(/^\/empresas\/([^/]+)/);
  if (!match) return null;

  const companyId = match[1];
  const tabs = [
    { href: `/empresas/${companyId}`, label: "Visão geral" },
    { href: `/empresas/${companyId}/restaurante`, label: "Restaurante" },
    { href: `/empresas/${companyId}/cardapio`, label: "Cardápio" },
    { href: `/empresas/${companyId}/pedidos`, label: "Pedidos" },
    { href: `/empresas/${companyId}/pagamentos`, label: "Pagamentos" },
    { href: `/empresas/${companyId}/cupons`, label: "Cupons" },
  ];

  return (
    <div className="border-t px-4 sm:px-6">
      <AccountTabs tabs={tabs} />
    </div>
  );
}
