"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { listCategories, listItems } from "@/lib/domain/menu";

export function categoriesQueryKey(companyId: string) {
  return ["menu-categories", companyId];
}

export function itemsQueryKey(companyId: string) {
  return ["menu-items", companyId];
}

export function useCategories(companyId: string) {
  return useQuery({
    queryKey: categoriesQueryKey(companyId),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listCategories(supabase, companyId);
      if (error) throw error;
      return data;
    },
  });
}

export function useMenuItems(companyId: string) {
  return useQuery({
    queryKey: itemsQueryKey(companyId),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listItems(supabase, companyId);
      if (error) throw error;
      return data;
    },
  });
}
