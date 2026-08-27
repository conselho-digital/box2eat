"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  approveDeliveryPartner,
  getDocumentSignedUrl,
  listDeliveryPartnersForReview,
  listPartnerDocuments,
  rejectDeliveryPartner,
  reviewDocument,
  type PendingDeliveryPartner,
} from "@/lib/domain/admin";
import { DOC_TYPE_LABEL, type DocType } from "@/lib/validations/delivery";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  suspended: "Suspenso",
};

export function DeliveryPartnerReview({ adminId }: { adminId: string }) {
  const queryClient = useQueryClient();
  const queryKey = ["admin-delivery-partners"];

  const { data: partners, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listDeliveryPartnersForReview(supabase);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  const pending = partners?.filter((p) => p.status === "pending") ?? [];
  const others = partners?.filter((p) => p.status !== "pending") ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="font-medium">Pendentes de aprovação</h2>
        {pending.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum cadastro pendente.</p>
        )}
        {pending.map((partner) => (
          <PartnerCard
            key={partner.user_id}
            partner={partner}
            adminId={adminId}
            onChanged={() => queryClient.invalidateQueries({ queryKey })}
          />
        ))}
      </div>

      {others.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-medium">Outros cadastros</h2>
          {others.map((partner) => (
            <div key={partner.user_id} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{partner.profiles.full_name || "Sem nome"}</p>
              <p className="text-xs text-muted-foreground">
                {STATUS_LABEL[partner.status] ?? partner.status}
                {partner.rejection_reason && ` · ${partner.rejection_reason}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PartnerCard({
  partner,
  adminId,
  onChanged,
}: {
  partner: PendingDeliveryPartner;
  adminId: string;
  onChanged: () => void;
}) {
  const { data: documents } = useQuery({
    queryKey: ["admin-partner-documents", partner.user_id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listPartnerDocuments(supabase, partner.user_id);
      if (error) throw error;
      return data;
    },
  });

  const [error, setError] = useState<string | null>(null);

  const approve = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await approveDeliveryPartner(supabase, partner.user_id);
      if (error) throw error;
    },
    onSuccess: onChanged,
    onError: (err: Error) => setError(err.message),
  });

  const reject = useMutation({
    mutationFn: async () => {
      const reason = window.prompt("Motivo da rejeição:") || undefined;
      const supabase = createClient();
      const { error } = await rejectDeliveryPartner(supabase, partner.user_id, reason);
      if (error) throw error;
    },
    onSuccess: onChanged,
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3 text-sm">
      <div>
        <p className="font-medium">{partner.profiles.full_name || "Sem nome"}</p>
        <p className="text-xs text-muted-foreground">
          {partner.vehicle_type} {partner.vehicle_plate && `· ${partner.vehicle_plate}`}
          {partner.profiles.phone && ` · ${partner.profiles.phone}`}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {documents?.map((doc) => (
          <DocumentRow key={doc.id} document={doc} adminId={adminId} onChanged={onChanged} />
        ))}
        {documents?.length === 0 && (
          <p className="text-xs text-muted-foreground">Nenhum documento enviado ainda.</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={() => approve.mutate()} disabled={approve.isPending}>
          Aprovar entregador
        </Button>
        <Button size="sm" variant="outline" onClick={() => reject.mutate()} disabled={reject.isPending}>
          Rejeitar
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function DocumentRow({
  document,
  adminId,
  onChanged,
}: {
  document: { id: string; doc_type: string; status: string; storage_path: string };
  adminId: string;
  onChanged: () => void;
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  const view = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { data, error } = await getDocumentSignedUrl(supabase, document.storage_path);
      if (error) throw error;
      return data.signedUrl;
    },
    onSuccess: (url) => setSignedUrl(url),
  });

  const review = useMutation({
    mutationFn: async (status: "approved" | "rejected") => {
      const reason =
        status === "rejected" ? window.prompt("Motivo da rejeição:") || undefined : undefined;
      const supabase = createClient();
      const { error } = await reviewDocument(supabase, document.id, status, adminId, reason);
      if (error) throw error;
    },
    onSuccess: onChanged,
  });

  return (
    <div className="flex items-center justify-between gap-2 rounded border p-2 text-xs">
      <div>
        <p>{DOC_TYPE_LABEL[document.doc_type as DocType] ?? document.doc_type}</p>
        <p className="text-muted-foreground">{document.status}</p>
      </div>
      <div className="flex gap-1">
        {signedUrl ? (
          <a href={signedUrl} target="_blank" rel="noreferrer" className="underline">
            Ver
          </a>
        ) : (
          <Button size="icon-xs" variant="outline" onClick={() => view.mutate()}>
            👁
          </Button>
        )}
        <Button size="icon-xs" variant="outline" onClick={() => review.mutate("approved")}>
          ✓
        </Button>
        <Button size="icon-xs" variant="outline" onClick={() => review.mutate("rejected")}>
          ✕
        </Button>
      </div>
    </div>
  );
}
