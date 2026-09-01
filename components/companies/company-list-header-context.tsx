"use client";

import { createContext, useContext, useState } from "react";

type CompanyListHeaderContextValue = {
  canCreate: boolean;
  setCanCreate: (canCreate: boolean) => void;
  showForm: boolean;
  setShowForm: (showForm: boolean | ((prev: boolean) => boolean)) => void;
};

const CompanyListHeaderContext = createContext<CompanyListHeaderContextValue | null>(null);

/** The "Novo restaurante" button lives in the navbar now, but the data and
 *  form it controls (canCreate, showForm) live in CompanyList, in a
 *  different part of the tree — shared here the same way MapStatsProvider
 *  bridges the map page and its navbar count. */
export function CompanyListHeaderProvider({ children }: { children: React.ReactNode }) {
  const [canCreate, setCanCreate] = useState(false);
  const [showForm, setShowForm] = useState(false);
  return (
    <CompanyListHeaderContext.Provider value={{ canCreate, setCanCreate, showForm, setShowForm }}>
      {children}
    </CompanyListHeaderContext.Provider>
  );
}

export function useCompanyListHeader() {
  const ctx = useContext(CompanyListHeaderContext);
  if (!ctx) throw new Error("useCompanyListHeader must be used within CompanyListHeaderProvider");
  return ctx;
}
