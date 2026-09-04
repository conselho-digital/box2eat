import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyMembership } from "@/lib/domain/companies-detail";
import { listBusinessHours } from "@/lib/domain/business-hours";
import { RestaurantSettingsForm } from "@/components/companies/restaurant-settings-form";
import { RestaurantAddressForm } from "@/components/companies/restaurant-address-form";
import { BusinessHoursEditor } from "@/components/companies/business-hours-editor";
import { CompanyLogoForm } from "@/components/companies/company-logo-form";

export default async function CompanyRestaurantPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await getMyMembership(supabase, companyId, user.id);
  if (!membership) notFound();

  const company = membership.companies;
  const { data: hours } = await listBusinessHours(supabase, companyId);

  let promotedItemName: string | null = null;
  if (company.promoted_menu_item_id) {
    const { data: promotedItem } = await supabase
      .from("menu_items")
      .select("name")
      .eq("id", company.promoted_menu_item_id)
      .maybeSingle();
    promotedItemName = promotedItem?.name ?? null;
  }

  return (
    <div className="flex flex-col gap-6">
      <CompanyLogoForm companyId={company.id} initialLogoUrl={company.logo_url} />

      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium">Banner do restaurante</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {company.cover_image_url
            ? `Definido pelo produto em promoção${promotedItemName ? ` "${promotedItemName}"` : ""}. Para trocar, ajuste a promoção no Cardápio.`
            : "Nenhum banner ainda — ative uma promoção em um produto no Cardápio para definir um."}
        </p>
      </div>

      <RestaurantSettingsForm
        companyId={company.id}
        initial={{
          name: company.name,
          slug: company.slug,
          phone: company.phone,
          category: company.category,
        }}
      />
      <RestaurantAddressForm
        companyId={company.id}
        initial={{
          street: company.street,
          number: company.number,
          neighborhood: company.neighborhood,
          city: company.city,
          state: company.state,
          postalCode: company.postal_code,
          lat: company.lat,
          lng: company.lng,
        }}
      />
      <BusinessHoursEditor companyId={company.id} initialHours={hours ?? []} />
    </div>
  );
}
