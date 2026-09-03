"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getCompanyTopProducts, type TopProduct } from "@/lib/domain/analytics";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const PAGE_SIZE = 5;

function TooltipContent({ active, payload }: { active?: boolean; payload?: { payload: TopProduct }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover p-2 text-xs text-popover-foreground shadow-md">
      <p className="font-medium">{point.itemName}</p>
      <p>{point.totalQuantity} vendidos</p>
      <p className="text-muted-foreground">{currency.format(point.totalRevenue)}</p>
    </div>
  );
}

function TopProductsChart({ data }: { data: TopProduct[] }) {
  return (
    <>
      {/* Mobile: horizontal bars */}
      <div className="h-64 w-full sm:hidden">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
            <YAxis
              type="category"
              dataKey="itemName"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              stroke="var(--muted-foreground)"
              width={90}
              tickFormatter={(value: string) => (value.length > 14 ? `${value.slice(0, 13)}…` : value)}
            />
            <Tooltip content={<TooltipContent />} cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="totalQuantity" fill="var(--chart-2)" radius={[0, 4, 4, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Desktop: vertical bars */}
      <div className="hidden h-64 w-full sm:block">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="itemName"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              stroke="var(--muted-foreground)"
              tickFormatter={(value: string) => (value.length > 10 ? `${value.slice(0, 9)}…` : value)}
            />
            <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" width={32} />
            <Tooltip content={<TooltipContent />} cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="totalQuantity" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export function TopProductsPanel({ companyId, days }: { companyId: string; days: number }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data: allProducts } = useQuery({
    queryKey: ["company-top-products", companyId, days, visibleCount],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await getCompanyTopProducts(supabase, companyId, days, visibleCount, 0);
      if (error) throw error;
      return data;
    },
  });

  const chartData = allProducts?.slice(0, PAGE_SIZE) ?? [];

  if (allProducts && allProducts.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma venda nesse período.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <TopProductsChart data={chartData} />

      <div className="flex flex-col divide-y rounded-lg border">
        {allProducts?.map((product, index) => (
          <div key={product.itemName} className="flex items-center justify-between gap-3 p-2.5 text-sm">
            <span className="flex items-center gap-2 truncate">
              <span className="w-5 shrink-0 text-muted-foreground">{index + 1}.</span>
              <span className="truncate">{product.itemName}</span>
            </span>
            <span className="shrink-0 text-muted-foreground">
              {product.totalQuantity} · {currency.format(product.totalRevenue)}
            </span>
          </div>
        ))}
      </div>

      {allProducts && allProducts.length === visibleCount && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
        >
          Carregar mais
        </Button>
      )}
    </div>
  );
}
