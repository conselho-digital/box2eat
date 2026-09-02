"use client";

import { use } from "react";
import { ItemList } from "@/components/menu/item-list";

export default function CardapioPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);

  return <ItemList companyId={companyId} />;
}
