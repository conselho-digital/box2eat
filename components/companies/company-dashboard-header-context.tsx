"use client";

import { createContext, useContext, useState } from "react";

type CompanyDashboardHeaderInfo = { name: string; slug: string } | null;

type CompanyDashboardHeaderContextValue = {
  company: CompanyDashboardHeaderInfo;
  setCompany: (company: CompanyDashboardHeaderInfo) => void;
};

const CompanyDashboardHeaderContext = createContext<CompanyDashboardHeaderContextValue | null>(
  null,
);

export function CompanyDashboardHeaderProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<CompanyDashboardHeaderInfo>(null);

  return (
    <CompanyDashboardHeaderContext.Provider value={{ company, setCompany }}>
      {children}
    </CompanyDashboardHeaderContext.Provider>
  );
}

export function useCompanyDashboardHeader() {
  const ctx = useContext(CompanyDashboardHeaderContext);
  if (!ctx) {
    throw new Error("useCompanyDashboardHeader must be used within CompanyDashboardHeaderProvider");
  }
  return ctx;
}
