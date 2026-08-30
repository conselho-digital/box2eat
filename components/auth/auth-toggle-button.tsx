"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * On the login/cadastro pages themselves, showing both "Entrar" and "Criar
 * conta" side by side is redundant with what's already on the page — one
 * contextual button that flips to the other page reads cleaner.
 */
export function AuthToggleButton() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return (
      <Button render={<Link href="/cadastro" />} nativeButton={false} size="sm">
        Criar conta
      </Button>
    );
  }

  if (pathname === "/cadastro") {
    return (
      <Button render={<Link href="/login" />} nativeButton={false} size="sm">
        Entrar
      </Button>
    );
  }

  if (pathname === "/") {
    return (
      <>
        <Button
          render={<Link href="/login" />}
          nativeButton={false}
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Entrar"
        >
          <User className="size-4" />
        </Button>
        <Button render={<Link href="/cadastro" />} nativeButton={false} size="sm">
          Criar conta
        </Button>
      </>
    );
  }

  return (
    <>
      <Button render={<Link href="/login" />} nativeButton={false} variant="ghost" size="sm">
        Entrar
      </Button>
      <Button render={<Link href="/cadastro" />} nativeButton={false} size="sm">
        Criar conta
      </Button>
    </>
  );
}
