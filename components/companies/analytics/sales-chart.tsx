"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SalesDay } from "@/lib/domain/analytics";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const shortDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

function TooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: SalesDay }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover p-2 text-xs text-popover-foreground shadow-md">
      <p className="font-medium">{shortDate.format(new Date(`${point.day}T00:00:00`))}</p>
      <p>{currency.format(point.revenue)}</p>
      <p className="text-muted-foreground">
        {point.orderCount} pedido{point.orderCount === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function SalesChart({ data }: { data: SalesDay[] }) {
  const chartData = data.map((d) => ({ ...d, label: shortDate.format(new Date(`${d.day}T00:00:00`)) }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            stroke="var(--muted-foreground)"
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={11}
            stroke="var(--muted-foreground)"
            width={36}
            tickFormatter={(value: number) => (value >= 1000 ? `${Math.round(value / 1000)}k` : `${value}`)}
          />
          <Tooltip content={<TooltipContent />} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="revenue" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
