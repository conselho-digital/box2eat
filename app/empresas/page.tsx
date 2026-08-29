import { createClient } from "@/lib/supabase/server";
import { CompanyList } from "@/components/companies/company-list";
import { CompanyLanding } from "@/components/companies/company-landing";

export default async function CompaniesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <CompanyLanding />;
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 p-6">
      <CompanyList />
    </div>
  );
}
