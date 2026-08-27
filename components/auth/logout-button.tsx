"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/domain/auth";

export function LogoutButton() {
  const router = useRouter();

  async function handleClick() {
    const supabase = createClient();
    await signOut(supabase);
    router.push("/login");
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" onClick={handleClick}>
      Sair
    </Button>
  );
}
