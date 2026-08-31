"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NewPasswordForm } from "@/components/auth/new-password-form";
import { createClient } from "@/lib/supabase/client";

/**
 * Mounted globally (see app/providers.tsx) so it can pop up over whatever
 * page the user lands on right after logging in through a recovery path
 * (recovery e-mail link or WhatsApp phone OTP) — not tied to any specific
 * route.
 */
export function MustSetPasswordDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    function check(userMetadata: Record<string, unknown> | undefined) {
      setOpen(Boolean(userMetadata?.must_set_password));
    }

    supabase.auth.getUser().then(({ data }) => check(data.user?.user_metadata));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      check(session?.user?.user_metadata);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  if (!open) return null;

  return (
    <Dialog open disablePointerDismissal>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Cadastre uma nova senha</DialogTitle>
          <DialogDescription>
            Você entrou por um método de recuperação de acesso. Por segurança, cadastre uma nova
            senha antes de continuar.
          </DialogDescription>
        </DialogHeader>
        <NewPasswordForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
