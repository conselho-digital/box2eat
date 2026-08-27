"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { applyAsDeliveryPartner } from "@/lib/domain/delivery";
import {
  deliveryApplicationSchema,
  type DeliveryApplicationInput,
} from "@/lib/validations/delivery";

export function ApplicationForm({ userId }: { userId: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DeliveryApplicationInput>({
    resolver: zodResolver(deliveryApplicationSchema),
    defaultValues: { vehicleType: "motorcycle" },
  });

  async function onSubmit(values: DeliveryApplicationInput) {
    const supabase = createClient();
    const { error } = await applyAsDeliveryPartner(supabase, userId, values);
    if (!error) router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Preencha seus dados de veículo para começar a se cadastrar como entregador.
        Depois de enviar os documentos, um admin precisa aprovar seu cadastro antes
        de você poder aceitar entregas.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="vehicleType">Tipo de veículo</Label>
        <select
          id="vehicleType"
          className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
          {...register("vehicleType")}
        >
          <option value="bike">Bicicleta</option>
          <option value="motorcycle">Moto</option>
          <option value="car">Carro</option>
        </select>
        {errors.vehicleType && (
          <p className="text-sm text-destructive">{errors.vehicleType.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="vehiclePlate">Placa</Label>
        <Input id="vehiclePlate" {...register("vehiclePlate")} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando…" : "Iniciar cadastro"}
      </Button>
    </form>
  );
}
