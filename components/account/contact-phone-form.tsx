"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { updateContactPhone } from "@/lib/domain/account";

const contactPhoneSchema = z.object({
  phone: z.string().trim().optional(),
});

type ContactPhoneInput = z.infer<typeof contactPhoneSchema>;

export function ContactPhoneForm({
  userId,
  phone,
  onSaved,
}: {
  userId: string;
  phone: string | null;
  onSaved: (phone: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ContactPhoneInput>({
    resolver: zodResolver(contactPhoneSchema),
    defaultValues: { phone: phone ?? "" },
  });

  async function onSubmit(values: ContactPhoneInput) {
    setError(null);
    const supabase = createClient();
    const { error } = await updateContactPhone(supabase, userId, values.phone ?? "");
    if (error) {
      setError("Não foi possível salvar. Tente novamente.");
      return;
    }
    onSaved(values.phone ?? "");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-phone">Telefone de contato</Label>
        <Input id="contact-phone" placeholder="(11) 91234-5678" {...register("phone")} />
        <p className="text-sm text-muted-foreground">
          Usado para o restaurante e o entregador falarem com você sobre um pedido.
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? "Salvando…" : "Salvar"}
      </Button>
    </form>
  );
}
