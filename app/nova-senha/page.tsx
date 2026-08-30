import { Suspense } from "react";
import { NewPasswordGate } from "@/components/auth/new-password-gate";

export default function NewPasswordPage() {
  return (
    <Suspense fallback={null}>
      <NewPasswordGate />
    </Suspense>
  );
}
