"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  getIdentityPhotoSignedUrl,
  listIdentityVerificationsForReview,
  reviewIdentityVerification,
  type PendingIdentityVerification,
} from "@/lib/domain/identity";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

export function IdentityVerificationReview({ adminId }: { adminId: string }) {
  const queryClient = useQueryClient();
  const queryKey = ["admin-identity-verifications"];

  const { data: verifications, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listIdentityVerificationsForReview(supabase);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  const pending = verifications?.filter((v) => v.status === "pending") ?? [];
  const others = verifications?.filter((v) => v.status !== "pending") ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="font-medium">Pendentes de aprovação</h2>
        {pending.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma verificação pendente.</p>
        )}
        {pending.map((verification) => (
          <VerificationCard
            key={verification.id}
            verification={verification}
            adminId={adminId}
            onChanged={() => queryClient.invalidateQueries({ queryKey })}
          />
        ))}
      </div>

      {others.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-medium">Outras verificações</h2>
          {others.map((verification) => (
            <div key={verification.id} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{verification.profiles.full_name || "Sem nome"}</p>
              <p className="text-xs text-muted-foreground">
                {STATUS_LABEL[verification.status] ?? verification.status}
                {verification.rejection_reason && ` · ${verification.rejection_reason}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VerificationCard({
  verification,
  adminId,
  onChanged,
}: {
  verification: PendingIdentityVerification;
  adminId: string;
  onChanged: () => void;
}) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const view = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const [document, selfie] = await Promise.all([
        getIdentityPhotoSignedUrl(supabase, verification.document_storage_path),
        getIdentityPhotoSignedUrl(supabase, verification.selfie_storage_path),
      ]);
      if (document.error) throw document.error;
      if (selfie.error) throw selfie.error;
      return { documentUrl: document.data.signedUrl, selfieUrl: selfie.data.signedUrl };
    },
    onSuccess: ({ documentUrl, selfieUrl }) => {
      setDocumentUrl(documentUrl);
      setSelfieUrl(selfieUrl);
    },
    onError: (err: Error) => setError(err.message),
  });

  const approve = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await reviewIdentityVerification(supabase, verification.id, "approved", adminId);
      if (error) throw error;
    },
    onSuccess: onChanged,
    onError: (err: Error) => setError(err.message),
  });

  const reject = useMutation({
    mutationFn: async () => {
      const reason = window.prompt("Motivo da rejeição:") || undefined;
      const supabase = createClient();
      const { error } = await reviewIdentityVerification(supabase, verification.id, "rejected", adminId, reason);
      if (error) throw error;
    },
    onSuccess: onChanged,
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3 text-sm">
      <div>
        <p className="font-medium">{verification.profiles.full_name || "Sem nome"}</p>
        <p className="text-xs text-muted-foreground">{verification.profiles.phone}</p>
      </div>

      {documentUrl && selfieUrl ? (
        <div className="flex gap-3">
          <a href={documentUrl} target="_blank" rel="noreferrer" className="text-xs underline">
            Ver documento
          </a>
          <a href={selfieUrl} target="_blank" rel="noreferrer" className="text-xs underline">
            Ver selfie
          </a>
        </div>
      ) : (
        <Button size="sm" variant="outline" className="w-fit" onClick={() => view.mutate()} disabled={view.isPending}>
          Ver fotos
        </Button>
      )}

      <div className="flex gap-2">
        <Button size="sm" onClick={() => approve.mutate()} disabled={approve.isPending}>
          Aprovar
        </Button>
        <Button size="sm" variant="outline" onClick={() => reject.mutate()} disabled={reject.isPending}>
          Rejeitar
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
