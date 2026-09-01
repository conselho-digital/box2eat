"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { uploadIdentityVerification, type IdentityVerification } from "@/lib/domain/identity";

const STATUS_LABEL: Record<string, string> = {
  pending: "Em análise. Avisamos assim que revisarmos suas fotos.",
  approved: "Identidade verificada.",
  rejected: "Fotos rejeitadas. Envie novas fotos.",
};

export function IdentityVerificationForm({
  userId,
  initialVerification,
}: {
  userId: string;
  initialVerification: IdentityVerification | null;
}) {
  const [verification, setVerification] = useState(initialVerification);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ documentFile, selfieFile }: { documentFile: File; selfieFile: File }) => {
      const supabase = createClient();
      const { error } = await uploadIdentityVerification(supabase, userId, documentFile, selfieFile);
      if (error) throw error;
    },
    onSuccess: () => {
      setError(null);
      setDocumentFile(null);
      setSelfieFile(null);
      setVerification({
        id: "",
        user_id: userId,
        document_storage_path: "",
        selfie_storage_path: "",
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

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Foto segurando o documento abaixo do rosto</p>
        <input
          ref={documentInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => documentInputRef.current?.click()}
        >
          {documentFile ? documentFile.name : "Escolher foto"}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Selfie</p>
        <input
          ref={selfieInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
        />
        <Button type="button" variant="outline" className="w-fit" onClick={() => selfieInputRef.current?.click()}>
          {selfieFile ? selfieFile.name : "Escolher selfie"}
        </Button>
      </div>

      <Button
        type="button"
        className="w-fit"
        disabled={!documentFile || !selfieFile || mutation.isPending}
        onClick={() => documentFile && selfieFile && mutation.mutate({ documentFile, selfieFile })}
      >
        {mutation.isPending ? "Enviando…" : verification ? "Enviar novas fotos" : "Enviar fotos"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
