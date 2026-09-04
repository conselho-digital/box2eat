"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import {
  submitOrderReport,
  uploadReportPhoto,
  MAX_REPORT_PHOTOS,
  type OrderReportType,
} from "@/lib/domain/order-reports";

const reportSchema = z.object({
  message: z.string().trim().min(10, "Conte com mais detalhes o que aconteceu"),
});

type ReportInput = z.infer<typeof reportSchema>;

function ReportDialog({
  orderId,
  type,
  title,
  description,
  placeholder,
  trigger,
}: {
  orderId: string;
  type: OrderReportType;
  title: string;
  description: string;
  placeholder: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<{ file: File; previewUrl: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReportInput>({ resolver: zodResolver(reportSchema) });

  function addPhotos(files: FileList) {
    setPhotos((prev) => {
      const room = Math.max(0, MAX_REPORT_PHOTOS - prev.length);
      const drafts = Array.from(files)
        .slice(0, room)
        .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
      return [...prev, ...drafts];
    });
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(values: ReportInput) {
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Sua sessão expirou. Entre novamente.");
      return;
    }

    const photoPaths: string[] = [];
    for (const photo of photos) {
      const { data: path, error: uploadError } = await uploadReportPhoto(
        supabase,
        user.id,
        photo.file,
      );
      if (uploadError || !path) {
        setError("Não foi possível enviar as fotos. Tente novamente.");
        return;
      }
      photoPaths.push(path);
    }

    const { error } = await submitOrderReport(
      supabase,
      orderId,
      user.id,
      type,
      values.message,
      photoPaths,
    );
    if (error) {
      setError("Não foi possível enviar. Tente novamente.");
      return;
    }
    setSent(true);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setSent(false);
          setError(null);
          setPhotos([]);
          reset();
        }
      }}
    >
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {sent ? (
          <p className="text-sm text-primary">
            Recebemos sua mensagem. Nossa equipe vai analisar e entrar em contato.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <Textarea placeholder={placeholder} {...register("message")} />
            {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}

            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-muted-foreground">
                Fotos (opcional, até {MAX_REPORT_PHOTOS})
              </p>
              <div className="flex flex-wrap gap-2">
                {photos.map((photo, index) => (
                  <div key={photo.previewUrl} className="relative size-16 shrink-0">
                    <Image
                      src={photo.previewUrl}
                      alt=""
                      fill
                      unoptimized
                      className="rounded-lg border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </div>
                ))}
                {photos.length < MAX_REPORT_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground"
                  >
                    + Foto
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) addPhotos(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando…" : "Enviar"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function OrderIssueActions({
  orderId,
  hasDeliveryPartner,
}: {
  orderId: string;
  hasDeliveryPartner?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <ReportDialog
        orderId={orderId}
        type="restaurant_report"
        title="Reportar restaurante"
        description="Conte o que aconteceu com este pedido. Nossa equipe vai avaliar."
        placeholder="O que aconteceu?"
        trigger={
          <Button type="button" variant="outline" size="sm">
            Reportar restaurante
          </Button>
        }
      />
      {hasDeliveryPartner && (
        <ReportDialog
          orderId={orderId}
          type="delivery_partner_report"
          title="Reportar entregador"
          description="Conte o que aconteceu com o entregador deste pedido. Nossa equipe vai avaliar."
          placeholder="O que aconteceu?"
          trigger={
            <Button type="button" variant="outline" size="sm">
              Reportar entregador
            </Button>
          }
        />
      )}
      <ReportDialog
        orderId={orderId}
        type="refund_request"
        title="Solicitar reembolso"
        description="Descreva o problema com o pedido (item errado, faltando, qualidade, etc.)."
        placeholder="Descreva o problema"
        trigger={
          <Button type="button" variant="outline" size="sm">
            Solicitar reembolso
          </Button>
        }
      />
    </div>
  );
}
