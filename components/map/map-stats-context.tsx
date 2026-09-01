"use client";

import { createContext, useContext, useState } from "react";

type MapStatsContextValue = {
  visibleCount: number | null;
  setVisibleCount: (count: number | null) => void;
};

const MapStatsContext = createContext<MapStatsContextValue | null>(null);

/** Lets the map page's marker count reach the navbar (rendered by a
 *  different part of the tree) without prop-drilling through the layout. */
export function MapStatsProvider({ children }: { children: React.ReactNode }) {
  const [visibleCount, setVisibleCount] = useState<number | null>(null);
  return (
    <MapStatsContext.Provider value={{ visibleCount, setVisibleCount }}>{children}</MapStatsContext.Provider>
  );
}

export function useMapStats() {
  const ctx = useContext(MapStatsContext);
  if (!ctx) throw new Error("useMapStats must be used within MapStatsProvider");
  return ctx;
}
