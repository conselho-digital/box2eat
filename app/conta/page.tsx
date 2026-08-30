import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/account/profile-form";
import { AddressForm } from "@/components/account/address-form";
import { EmailForm } from "@/components/account/email-form";
import { PushToggle } from "@/components/notifications/push-toggle";
import { getMyAddress } from "@/lib/domain/address";

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

  const { data: address } = await getMyAddress(supabase, user.id);

  const hasPassword = (user.identities ?? []).some((identity) => identity.provider === "email");

  const initials = (profile?.full_name || user.email || "?").trim().charAt(0).toUpperCase();
  const missing: string[] = [];
  if (!profile?.phone) missing.push("telefone");
  if (!address) missing.push("endereço");
  if (!hasPassword) missing.push("senha");
  if (!profile?.recovery_email) missing.push("e-mail de recuperação");

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

      {missing.length > 0 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
          <p className="font-medium">Complete seu cadastro</p>
          <p className="text-muted-foreground">
            Falta: {missing.join(", ")}. A senha permite entrar com e-mail e senha caso você perca o
            acesso à sua conta Google, e o e-mail de recuperação fica em{" "}
            <Link href="/conta/seguranca" className="underline underline-offset-4">
              Segurança
            </Link>
            .
          </p>
        </div>
      )}

      <ProfileForm
        userId={user.id}
        fullName={profile?.full_name ?? ""}
        phone={profile?.phone ?? null}
      />

      <Separator />

      <AddressForm userId={user.id} initialAddress={address} />

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
