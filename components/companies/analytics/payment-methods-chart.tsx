"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PaymentMethodUsage } from "@/lib/domain/analytics";
import { ACCEPTED_METHOD_LABEL, type AcceptedPaymentMethod } from "@/lib/domain/payment-methods";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// Fixed order/color per method — identity by hue never depends on rank, so
// a filtered/changed dataset can't repaint the survivors a different color.
const METHOD_COLOR: Record<string, string> = {
  pix: "var(--chart-1)",
  credit_card: "var(--chart-2)",
  card_on_delivery: "var(--chart-3)",
  cash: "var(--chart-4)",
};

function methodLabel(method: string) {
  return ACCEPTED_METHOD_LABEL[method as AcceptedPaymentMethod] ?? method;
}

function TooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: PaymentMethodUsage }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover p-2 text-xs text-popover-foreground shadow-md">
      <p className="font-medium">{methodLabel(point.paymentMethod)}</p>
      <p>
        {point.orderCount} pedido{point.orderCount === 1 ? "" : "s"}
      </p>
      <p className="text-muted-foreground">{currency.format(point.revenue)}</p>
    </div>
  );
}

export function PaymentMethodsChart({ data }: { data: PaymentMethodUsage[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma venda nesse período.</p>;
  }

  const chartData = data.map((d) => ({ ...d, label: methodLabel(d.paymentMethod) }));

  return (
    <>
      {/* Mobile: horizontal bars */}
      <div className="h-56 w-full sm:hidden">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
            <YAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              stroke="var(--muted-foreground)"
              width={90}
            />
            <Tooltip content={<TooltipContent />} cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="orderCount" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {chartData.map((entry) => (
                <Cell key={entry.paymentMethod} fill={METHOD_COLOR[entry.paymentMethod] ?? "var(--chart-5)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Desktop: vertical bars */}
      <div className="hidden h-56 w-full sm:block">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
            <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" width={32} />
            <Tooltip content={<TooltipContent />} cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="orderCount" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {chartData.map((entry) => (
                <Cell key={entry.paymentMethod} fill={METHOD_COLOR[entry.paymentMethod] ?? "var(--chart-5)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
