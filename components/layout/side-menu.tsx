"use client";

import { useEffect, useRef, useState } from "react";
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
  Moon,
  Store,
  Bike,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { GetAppMenuItem } from "@/components/layout/get-app-menu-item";
import { ACCOUNT_TABS } from "@/components/account/account-tabs";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/domain/auth";
import { useTheme } from "@/components/theme/theme-provider";

/** Everything the menu links to — prefetched eagerly (not just on hover/
 *  viewport-entry) since these routes only render inside the closed dialog,
 *  where Next.js's default viewport-based <Link> prefetch never gets a
 *  chance to trigger before the user actually opens it. */
const MENU_ROUTES = [
  ...ACCOUNT_TABS.map((tab) => tab.href),
  "/conta/carteira",
  "/ajuda",
  "/promocoes",
  "/empresas",
  "/entregador/cadastro",
];

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
      <div className="mb-2 flex flex-col gap-2">
        <Button render={<Link href="/login" onClick={onNavigate} />} nativeButton={false}>
          Entrar
        </Button>
        <Button
          render={<Link href="/cadastro" onClick={onNavigate} />}
          nativeButton={false}
          variant="secondary"
        >
          Criar conta
        </Button>
      </div>
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
      <Separator />
      <GetAppMenuItem />
    </>
  );
}

function AccountMenu({
  isAdmin,
  hasCompany,
  fullName,
  avatarUrl,
  email,
  onNavigate,
}: {
  isAdmin: boolean;
  hasCompany: boolean;
  fullName: string | null;
  avatarUrl: string | null;
  email: string | null;
  onNavigate: () => void;
}) {
  const router = useRouter();
  const { isDark, setDark } = useTheme();
  const initials = (fullName || email || "?").trim().charAt(0).toUpperCase();

  async function handleLogout() {
    if (!window.confirm("Tem certeza que deseja terminar a sessão?")) return;
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

      <label className="flex items-center gap-3 rounded-lg px-3 py-2">
        <Moon className="size-5" />
        <span className="flex-1">Modo escuro</span>
        <Switch checked={isDark} onCheckedChange={setDark} />
      </label>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted"
      >
        <LogOut className="size-5" />
        Terminar sessão
      </button>

      <Separator />

      <MenuLink
        href="/empresas"
        icon={Store}
        label={hasCompany ? "Meu Restaurante" : "Criar uma conta Restaurante"}
        onClick={onNavigate}
      />
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
  hasCompany,
  fullName,
  avatarUrl,
  email,
  trigger,
}: {
  loggedIn: boolean;
  isAdmin: boolean;
  hasCompany: boolean;
  fullName: string | null;
  avatarUrl: string | null;
  email: string | null;
  trigger?: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  // Set right before closing the menu to navigate somewhere (a link, or the
  // logout button's router.push) — tells the history-cleanup effect below
  // to skip its own history.back(), since calling that while a navigation
  // is also about to run pushState() races with it and can cancel the
  // navigation outright (back() lands after the new entry is pushed).
  const closingToNavigateRef = useRef(false);

  function handleNavigate() {
    closingToNavigateRef.current = true;
    setOpen(false);
  }

  useEffect(() => {
    if (!loggedIn) return;
    for (const route of isAdmin ? [...MENU_ROUTES, "/admin/entregadores"] : MENU_ROUTES) {
      router.prefetch(route);
    }
  }, [loggedIn, isAdmin, router]);

  // Pushes a dummy history entry while the menu is open, so the device's
  // back gesture/button closes the menu (consuming that entry via
  // popstate) instead of navigating away from the page underneath. If the
  // menu instead closes some other way (the backdrop, Escape), the cleanup
  // below removes that dummy entry itself — otherwise it'd sit in the
  // history stack and eat one extra back press later. Closing via a link
  // (closingToNavigateRef) skips that cleanup — see the ref's comment.
  useEffect(() => {
    if (!open) return;
    // Merge into the existing history.state rather than replacing it —
    // Next's App Router stores its own routing data there (the RSC tree
    // used to restore the page on back/forward), and overwriting it with a
    // bare object broke client-side navigation once this entry was visited.
    history.pushState({ ...(history.state ?? {}), menuOpen: true }, "");
    const handlePopState = () => setOpen(false);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (closingToNavigateRef.current) {
        closingToNavigateRef.current = false;
        return;
      }
      if ((history.state as { menuOpen?: boolean } | null)?.menuOpen) {
        history.back();
      }
    };
  }, [open]);

  return (
    // modal="trap-focus": full `modal` (the default) still locks page scroll
    // via a JS style write on <body>/<html>, deferred to fire mid-animation —
    // that single forced style recalculation was landing right in the middle
    // of the 200ms slide, dropping frames on a throttled/slower device (the
    // backdrop below already blocks all pointer interaction with the page,
    // so scroll locking isn't actually needed here). trap-focus keeps focus
    // trapped inside the menu without that scroll-lock write.
    <DialogPrimitive.Root open={open} onOpenChange={setOpen} modal="trap-focus">
      <DialogPrimitive.Trigger
        render={
          trigger ?? (
            <Button variant="ghost" size="icon-sm" aria-label="Abrir menu">
              <Menu className="size-5" />
            </Button>
          )
        }
      />
      {/* keepMounted: the menu's DOM subtree is built once and just toggles
          visibility afterward, instead of a full mount/layout pass on every
          open — that mount cost (~90ms) was happening before the slide
          animation even started, reading as a jump/stutter on open. */}
      <DialogPrimitive.Portal keepMounted>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-[1100] bg-black/30 duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup className="fixed inset-x-0 bottom-0 z-[1100] flex max-h-[85vh] w-full flex-col gap-1 overflow-y-auto rounded-t-2xl bg-popover p-4 text-popover-foreground shadow-xl outline-none duration-200 data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom">
          <span className="mb-2 font-semibold">Menu</span>
          {loggedIn ? (
            <AccountMenu
              isAdmin={isAdmin}
              hasCompany={hasCompany}
              fullName={fullName}
              avatarUrl={avatarUrl}
              email={email}
              onNavigate={handleNavigate}
            />
          ) : (
            <GuestMenu isAdmin={isAdmin} onNavigate={handleNavigate} />
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
