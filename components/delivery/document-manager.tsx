"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { listMyDocuments, uploadDeliveryDocument } from "@/lib/domain/delivery";
import { DOC_TYPES, DOC_TYPE_LABEL, type DocType } from "@/lib/validations/delivery";

const STATUS_LABEL: Record<string, string> = {
  pending: "Em análise",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

export function DocumentManager({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const queryKey = ["delivery-documents", userId];

  const { data: documents } = useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listMyDocuments(supabase, userId);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-medium">Documentos</h2>
      {DOC_TYPES.map((docType) => (
        <DocRow
          key={docType}
          docType={docType}
          userId={userId}
          existing={documents?.find((d) => d.doc_type === docType)}
          onUploaded={() => queryClient.invalidateQueries({ queryKey })}
        />
      ))}
    </div>
  );
}

function DocRow({
  docType,
  userId,
  existing,
  onUploaded,
}: {
  docType: DocType;
  userId: string;
  existing?: { status: string };
  onUploaded: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const supabase = createClient();
      const { error } = await uploadDeliveryDocument(supabase, userId, docType, file);
      if (error) throw error;
    },
    onSuccess: () => {
      setError(null);
      onUploaded();
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
      <div>
        <p>{DOC_TYPE_LABEL[docType]}</p>
        {existing && (
          <p className="text-xs text-muted-foreground">{STATUS_LABEL[existing.status]}</p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) mutation.mutate(file);
        }}
      />
      <Button
        size="sm"
        variant="outline"
        disabled={mutation.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {mutation.isPending ? "Enviando…" : existing ? "Reenviar" : "Enviar"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
