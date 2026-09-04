"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ImageIcon, XIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { updateCompanyCoverImage } from "@/lib/domain/companies";
import { listCompanyMenuPhotos, uploadMenuImage } from "@/lib/domain/menu";

/** Sets companies.cover_image_url — the wide banner shown on the home
 *  "Destaques" carousel and restaurant cards across the app. Distinct from
 *  logo_url (the square profile photo). Either upload one fresh photo, or
 *  reuse one already uploaded for a product. */
export function CompanyBannerForm({
  companyId,
  initialCoverImageUrl,
}: {
  companyId: string;
  initialCoverImageUrl: string | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverImageUrl, setCoverImageUrl] = useState(initialCoverImageUrl);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: existingPhotos } = useQuery({
    queryKey: ["company-menu-photos", companyId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listCompanyMenuPhotos(supabase, companyId);
      if (error) throw error;
      return data;
    },
    enabled: pickerOpen,
  });

  const saveMutation = useMutation({
    mutationFn: async (url: string) => {
      setError(null);
      const supabase = createClient();
      const { error } = await updateCompanyCoverImage(supabase, companyId, url);
      if (error) throw error;
      return url;
    },
    onSuccess: (url) => {
      setCoverImageUrl(url);
      setPickerOpen(false);
    },
    onError: () => setError("Não foi possível salvar a foto. Tente de novo."),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setError(null);
      const supabase = createClient();
      const { data: url, error } = await uploadMenuImage(supabase, companyId, file);
      if (error || !url) throw error ?? new Error("upload failed");
      return url;
    },
    onSuccess: (url) => saveMutation.mutate(url),
    onError: () => setError("Não foi possível enviar a foto. Tente de novo."),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Banner do restaurante</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative aspect-[2/1] h-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
            {coverImageUrl ? (
              <Image src={coverImageUrl} alt="" fill unoptimized className="object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <ImageIcon className="size-6" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Aparece nos Destaques e nos cards do restaurante pelo app.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => setPickerOpen(true)}
            >
              {coverImageUrl ? "Alterar foto" : "Adicionar foto"}
            </Button>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

        <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
          <DialogContent>
            <div className="flex items-center justify-between">
              <DialogHeader>
                <DialogTitle>Banner do restaurante</DialogTitle>
              </DialogHeader>
              <DialogClose render={<Button variant="ghost" size="icon-sm" />}>
                <XIcon />
                <span className="sr-only">Fechar</span>
              </DialogClose>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-muted-foreground">Use uma foto retangular (2:1).</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) uploadMutation.mutate(e.target.files[0]);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  className="w-fit"
                  disabled={uploadMutation.isPending || saveMutation.isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadMutation.isPending ? "Enviando…" : "Fazer upload de uma foto"}
                </Button>
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-medium">Ou use uma foto de um produto</p>
                {existingPhotos && existingPhotos.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma foto de produto cadastrada ainda.
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {existingPhotos?.map((url) => (
                    <button
                      key={url}
                      type="button"
                      disabled={saveMutation.isPending}
                      onClick={() => saveMutation.mutate(url)}
                      className="relative size-16 shrink-0 overflow-hidden rounded-lg border hover:ring-2 hover:ring-primary"
                    >
                      <Image src={url} alt="" fill unoptimized className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
