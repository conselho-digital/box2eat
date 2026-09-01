"use client";

import { useEffect } from "react";
import { useCompanyDashboardHeader } from "@/components/companies/company-dashboard-header-context";

/** Pushes the current company's name/slug up to the navbar (rendered by the
 *  root layout, which can't itself fetch this page's data) via context —
 *  same bridge pattern as MapStatsProvider/CompanyListHeaderProvider. */
export function CompanyDashboardHeaderSync({ name, slug }: { name: string; slug: string }) {
  const { setCompany } = useCompanyDashboardHeader();

  useEffect(() => {
    setCompany({ name, slug });
    return () => setCompany(null);
  }, [name, slug, setCompany]);

  return null;
}
