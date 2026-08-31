import Link from "next/link";
import { redirect } from "next/navigation";
import { User, ShieldCheck, Package, Phone, ShieldPlus, BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { listMfaFactors } from "@/lib/domain/account";
import { isIdentityVerified } from "@/lib/domain/identity";

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

  const { data: factorsData } = await listMfaFactors(supabase);
  const hasMfa = (factorsData?.totp ?? []).some((f) => f.status === "verified");
  const hasVerifiedPhone = Boolean(user.phone_confirmed_at);
  const identityVerified = await isIdentityVerified(supabase, user.id);

  const initials = (profile?.full_name || user.email || "?").trim().charAt(0).toUpperCase();

  const cards = [
    { href: "/conta/dados-pessoais", label: "Dados pessoais", icon: User },
    { href: "/conta/seguranca", label: "Segurança", icon: ShieldCheck },
    { href: "/conta/pedidos", label: "Pedidos", icon: Package },
  ];

  const suggestions = [
    !hasVerifiedPhone && {
      icon: Phone,
      title: "Adicione seu telefone",
      description:
        "Verifique um número por WhatsApp para usar como login e para recuperar sua conta caso perca o acesso ao e-mail.",
      cta: "Adicionar telefone",
      href: "/conta/seguranca",
    },
    !hasMfa && {
      icon: ShieldPlus,
      title: "Ative a autenticação de dois fatores",
      description:
        "Proteja sua conta exigindo um código do seu app autenticador toda vez que entrar.",
      cta: "Ativar 2FA",
      href: "/conta/seguranca",
    },
    !identityVerified && {
      icon: BadgeCheck,
      title: "Verifique sua identidade",
      description: "Envie um documento com foto para liberar a categoria Bebidas.",
      cta: "Verificar identidade",
      href: "/conta/identidade",
    },
  ].filter(Boolean) as { icon: typeof Phone; title: string; description: string; cta: string; href: string }[];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <Avatar className="size-16">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-semibold">{profile?.full_name || "Sem nome"}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="flex flex-col items-center gap-2 rounded-xl bg-muted/50 p-4 text-center ring-1 ring-foreground/10 hover:bg-muted"
          >
            <card.icon className="size-5" />
            <span className="text-sm font-medium">{card.label}</span>
          </Link>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-medium">Sugestões</h2>
          {suggestions.map((suggestion) => (
            <div key={suggestion.title} className="flex flex-col gap-3 rounded-xl border p-4">
              <div className="flex items-start gap-3">
                <suggestion.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">{suggestion.title}</p>
                  <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                </div>
              </div>
              <Button render={<Link href={suggestion.href} />} nativeButton={false} variant="outline" size="sm" className="w-fit">
                {suggestion.cta}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
