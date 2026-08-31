"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  Menu,
  ChevronRight,
  ClipboardList,
  Heart,
  Wallet,
  HelpCircle,
  Tag,
  LogOut,
  Store,
  Bike,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { GetAppMenuItem } from "@/components/layout/get-app-menu-item";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/domain/auth";

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
  small,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted ${small ? "text-sm text-muted-foreground" : ""}`}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}

function GuestMenu({ isAdmin, onNavigate }: { isAdmin: boolean; onNavigate: () => void }) {
  return (
    <>
      <Link href="/login" onClick={onNavigate} className="rounded-lg px-3 py-2 hover:bg-muted">
        Entrar
      </Link>
      <Link href="/cadastro" onClick={onNavigate} className="rounded-lg px-3 py-2 hover:bg-muted">
        Criar conta
      </Link>
      <Link href="/empresas" onClick={onNavigate} className="rounded-lg px-3 py-2 hover:bg-muted">
        Conta restaurante
      </Link>
      <Link href="/validacao" onClick={onNavigate} className="rounded-lg px-3 py-2 hover:bg-muted">
        Fazer entregas
      </Link>
      {isAdmin && (
        <Link
          href="/admin/entregadores"
          onClick={onNavigate}
          className="rounded-lg px-3 py-2 hover:bg-muted"
        >
          Painel admin
        </Link>
      )}
    </>
  );
}

function AccountMenu({
  isAdmin,
  fullName,
  avatarUrl,
  email,
  onNavigate,
}: {
  isAdmin: boolean;
  fullName: string | null;
  avatarUrl: string | null;
  email: string | null;
  onNavigate: () => void;
}) {
  const router = useRouter();
  const initials = (fullName || email || "?").trim().charAt(0).toUpperCase();

  async function handleLogout() {
    const supabase = createClient();
    await signOut(supabase);
    onNavigate();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <Link
        href="/conta"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted"
      >
        <Avatar className="size-11">
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col">
          <span className="font-medium">{fullName || "Minha conta"}</span>
          <span className="flex items-center gap-0.5 text-sm text-primary">
            Gerir conta
            <ChevronRight className="size-3.5" />
          </span>
        </div>
      </Link>

      {isAdmin && (
        <MenuLink href="/admin/entregadores" icon={ShieldCheck} label="Painel admin" onClick={onNavigate} />
      )}

      <Separator />

      <MenuLink href="/conta/pedidos" icon={ClipboardList} label="Pedidos" onClick={onNavigate} />
      <MenuLink href="/conta/favoritos" icon={Heart} label="Favoritos" onClick={onNavigate} />
      <MenuLink href="/conta/carteira" icon={Wallet} label="Carteira" onClick={onNavigate} />
      <MenuLink href="/ajuda" icon={HelpCircle} label="Ajuda" onClick={onNavigate} />
      <MenuLink href="/promocoes" icon={Tag} label="Promoções" onClick={onNavigate} />

      <Separator />

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted"
      >
        <LogOut className="size-5" />
        Terminar sessão
      </button>

      <Separator />

      <MenuLink href="/empresas" icon={Store} label="Criar uma conta Restaurante" onClick={onNavigate} />
      <MenuLink
        href="/entregador/cadastro"
        icon={Bike}
        label="Registrar-se para fazer entregas"
        onClick={onNavigate}
      />
      <GetAppMenuItem />
    </>
  );
}

export function SideMenu({
  loggedIn,
  isAdmin,
  fullName,
  avatarUrl,
  email,
}: {
  loggedIn: boolean;
  isAdmin: boolean;
  fullName: string | null;
  avatarUrl: string | null;
  email: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Abrir menu">
            <Menu className="size-5" />
          </Button>
        }
      />
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/30 duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85%] flex-col gap-1 overflow-y-auto bg-popover p-4 text-popover-foreground shadow-xl outline-none duration-300 data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left">
          <span className="mb-2 font-semibold">Menu</span>
          {loggedIn ? (
            <AccountMenu
              isAdmin={isAdmin}
              fullName={fullName}
              avatarUrl={avatarUrl}
              email={email}
              onNavigate={() => setOpen(false)}
            />
          ) : (
            <GuestMenu isAdmin={isAdmin} onNavigate={() => setOpen(false)} />
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
