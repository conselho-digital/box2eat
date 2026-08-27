import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CompanyList } from "@/components/companies/company-list";

export default async function CompaniesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 p-6">
      <CompanyList />
    </div>
  );
}
