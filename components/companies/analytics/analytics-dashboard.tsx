"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  ANALYTICS_PERIODS,
  getCompanySalesOverTime,
  getCompanyPaymentMethodUsage,
} from "@/lib/domain/analytics";
import { SalesChart } from "@/components/companies/analytics/sales-chart";
import { TopProductsPanel } from "@/components/companies/analytics/top-products-panel";
import { PaymentMethodsChart } from "@/components/companies/analytics/payment-methods-chart";

export function AnalyticsDashboard({ companyId }: { companyId: string }) {
  const [days, setDays] = useState<number>(30);

  const { data: sales } = useQuery({
    queryKey: ["company-sales", companyId, days],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await getCompanySalesOverTime(supabase, companyId, days);
      if (error) throw error;
      return data;
    },
  });

  const { data: paymentUsage } = useQuery({
    queryKey: ["company-payment-usage", companyId, days],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await getCompanyPaymentMethodUsage(supabase, companyId, days);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        {ANALYTICS_PERIODS.map((period) => (
          <Button
            key={period.days}
            type="button"
            size="sm"
            variant={days === period.days ? "default" : "outline"}
            onClick={() => setDays(period.days)}
          >
            {period.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vendas</CardTitle>
        </CardHeader>
        <CardContent>{sales && <SalesChart data={sales} />}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Produtos mais vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <TopProductsPanel companyId={companyId} days={days} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Formas de pagamento mais usadas</CardTitle>
        </CardHeader>
        <CardContent>{paymentUsage && <PaymentMethodsChart data={paymentUsage} />}</CardContent>
      </Card>
    </div>
  );
}
