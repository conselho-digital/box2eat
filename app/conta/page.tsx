import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/account/profile-form";
import { EmailForm } from "@/components/account/email-form";
import { PushToggle } from "@/components/notifications/push-toggle";

export default async function AccountPage() {
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

  const initials = (profile?.full_name || user.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{profile?.full_name || "Sem nome"}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <ProfileForm
        userId={user.id}
        fullName={profile?.full_name ?? ""}
        phone={profile?.phone ?? null}
      />

      <Separator />

      <EmailForm currentEmail={user.email ?? ""} />

      <Separator />

      <div>
        <h2 className="font-medium">Notificações</h2>
        <p className="text-sm text-muted-foreground">
          Receba avisos de pedidos direto no navegador, mesmo com o site fechado.
        </p>
        <div className="mt-2">
          <PushToggle userId={user.id} />
        </div>
      </div>
    </div>
  );
}
