"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RecoveryLoginForm } from "@/components/auth/recovery-login-form";
import { PhoneRecoveryForm } from "@/components/auth/phone-recovery-form";

export function RecoveryAccessTabs() {
  const [mode, setMode] = useState<"email" | "phone">("email");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "email" ? "default" : "outline"}
          onClick={() => setMode("email")}
        >
          E-mail de recuperação
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "phone" ? "default" : "outline"}
          onClick={() => setMode("phone")}
        >
          Telefone
        </Button>
      </div>
      {mode === "email" ? <RecoveryLoginForm /> : <PhoneRecoveryForm />}
    </div>
  );
}
