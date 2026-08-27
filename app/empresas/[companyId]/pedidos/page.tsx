"use client";

import { use } from "react";
import { CompanyOrderQueue } from "@/components/orders/company-order-queue";

export default function CompanyOrdersPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  return <CompanyOrderQueue companyId={companyId} />;
}
