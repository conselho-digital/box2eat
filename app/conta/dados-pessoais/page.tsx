import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { getMyAddress } from "@/lib/domain/address";
import { PersonalInfo } from "@/components/account/personal-info";

export default async function PersonalDataPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: address } = await getMyAddress(supabase, user.id);

  const initials = (profile?.full_name || user.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">Informações pessoais</h2>

      <Avatar className="size-16">
        <AvatarImage src={profile?.avatar_url ?? undefined} />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>

      <PersonalInfo
        userId={user.id}
        fullName={profile?.full_name ?? ""}
        email={user.email ?? ""}
        loginPhone={user.phone ?? null}
        loginPhoneConfirmed={Boolean(user.phone_confirmed_at)}
        contactPhone={profile?.phone ?? null}
        address={address}
      />
    </div>
  );
}
