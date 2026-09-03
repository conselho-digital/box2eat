import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCompanyBySlug } from "@/lib/domain/companies-detail";
import { formatCompanyAddress } from "@/lib/domain/companies";
import { getItem } from "@/lib/domain/menu";
import { ProductDetail } from "@/components/menu/product-detail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; itemId: string }>;
}) {
  const { slug, itemId } = await params;
  const supabase = await createClient();

  const { data: company } = await getCompanyBySlug(supabase, slug);
  if (!company || company.status === "closed") notFound();

  const { data: item, error } = await getItem(supabase, itemId);
  if (error || !item || item.company_id !== company.id) notFound();

  const cartCompany = {
    id: company.id,
    name: company.name,
    slug: company.slug,
    logoUrl: company.logo_url,
    address: formatCompanyAddress(company),
  };

  return <ProductDetail item={item} company={cartCompany} />;
}
