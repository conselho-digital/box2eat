"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { uploadIdentityDocument, type IdentityVerification } from "@/lib/domain/identity";

const STATUS_LABEL: Record<string, string> = {
  pending: "Em análise. Avisamos assim que revisarmos seu documento.",
  approved: "Identidade verificada.",
  rejected: "Documento rejeitado. Envie uma nova foto.",
};

export function IdentityVerificationForm({
  userId,
  initialVerification,
}: {
  userId: string;
  initialVerification: IdentityVerification | null;
}) {
  const [verification, setVerification] = useState(initialVerification);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const supabase = createClient();
      const { error } = await uploadIdentityDocument(supabase, userId, file);
      if (error) throw error;
    },
    onSuccess: () => {
      setError(null);
      setVerification({
        id: "",
        user_id: userId,
        storage_path: "",
        status: "pending",
        rejection_reason: null,
        reviewed_by: null,
        reviewed_at: null,
        created_at: new Date().toISOString(),
      });
    },
    onError: (err: Error) => setError(err.message),
  });

  if (verification?.status === "approved") {
    return <p className="text-sm text-primary">{STATUS_LABEL.approved}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {verification && (
        <p className="rounded-lg border p-3 text-sm">
          {STATUS_LABEL[verification.status] ?? verification.status}
          {verification.rejection_reason && (
            <span className="mt-1 block text-destructive">Motivo: {verification.rejection_reason}</span>
          )}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) mutation.mutate(file);
        }}
      />
      <Button
        type="button"
        className="w-fit"
        disabled={mutation.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {mutation.isPending ? "Enviando…" : verification ? "Enviar novo documento" : "Enviar documento"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
