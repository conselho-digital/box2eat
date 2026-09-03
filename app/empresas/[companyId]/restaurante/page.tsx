import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyMembership } from "@/lib/domain/companies-detail";
import { listBusinessHours } from "@/lib/domain/business-hours";
import { RestaurantSettingsForm } from "@/components/companies/restaurant-settings-form";
import { RestaurantAddressForm } from "@/components/companies/restaurant-address-form";
import { BusinessHoursEditor } from "@/components/companies/business-hours-editor";
import { CompanyCoverPhotoForm } from "@/components/companies/company-cover-photo-form";

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

  return (
    <div className="flex flex-col gap-6">
      <CompanyCoverPhotoForm companyId={company.id} initialCoverImageUrl={company.cover_image_url} />
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
