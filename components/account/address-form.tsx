"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { getMyAddress, reverseGeocode, upsertMyAddress, type UserAddress } from "@/lib/domain/address";
import { profileAddressSchema, type ProfileAddressInput } from "@/lib/validations/address";

export function AddressForm({
  userId,
  initialAddress,
}: {
  userId: string;
  initialAddress: UserAddress | null;
}) {
  const [addressId, setAddressId] = useState(initialAddress?.id ?? null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialAddress?.lat && initialAddress?.lng
      ? { lat: initialAddress.lat, lng: initialAddress.lng }
      : null,
  );
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileAddressInput>({
    resolver: zodResolver(profileAddressSchema),
    defaultValues: {
      street: initialAddress?.street ?? "",
      number: initialAddress?.number ?? "",
      complement: initialAddress?.complement ?? "",
      neighborhood: initialAddress?.neighborhood ?? "",
      city: initialAddress?.city ?? "",
      state: initialAddress?.state ?? "",
      postalCode: initialAddress?.postal_code ?? "",
    },
  });

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocateError("Geolocalização não suportada neste navegador.");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const address = await reverseGeocode(latitude, longitude);
          setValue("street", address.street);
          setValue("number", address.number);
          setValue("neighborhood", address.neighborhood);
          setValue("city", address.city);
          setValue("state", address.state);
          setValue("postalCode", address.postalCode);
          setCoords({ lat: latitude, lng: longitude });
        } catch {
          setLocateError("Não foi possível identificar seu endereço.");
        }
        setLocating(false);
      },
      () => {
        setLocateError("Não foi possível acessar sua localização.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  async function onSubmit(values: ProfileAddressInput) {
    setSuccess(false);
    const supabase = createClient();
    const { error } = await upsertMyAddress(supabase, userId, addressId, {
      ...values,
      lat: coords?.lat,
      lng: coords?.lng,
    });
    if (error) return;
    if (!addressId) {
      const { data } = await getMyAddress(supabase, userId);
      if (data) setAddressId(data.id);
    }
    setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Endereço</h2>
        <Button type="button" variant="outline" size="sm" onClick={useMyLocation} disabled={locating}>
          <LocateFixed className="size-4" />
          {locating ? "Localizando…" : "Usar minha localização"}
        </Button>
      </div>
      {locateError && <p className="text-sm text-destructive">{locateError}</p>}

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="addr-street">Rua</Label>
          <Input id="addr-street" {...register("street")} />
          {errors.street && <p className="text-sm text-destructive">{errors.street.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="addr-number">Número</Label>
          <Input id="addr-number" {...register("number")} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="addr-complement">Complemento</Label>
        <Input id="addr-complement" {...register("complement")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="addr-neighborhood">Bairro</Label>
        <Input id="addr-neighborhood" {...register("neighborhood")} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="addr-city">Cidade</Label>
          <Input id="addr-city" {...register("city")} />
          {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="addr-state">Estado</Label>
          <Input id="addr-state" {...register("state")} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="addr-postal">CEP</Label>
        <Input id="addr-postal" {...register("postalCode")} />
      </div>

      {success && <p className="text-sm text-primary">Endereço salvo.</p>}
      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? "Salvando…" : "Salvar endereço"}
      </Button>
    </form>
  );
}
