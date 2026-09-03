"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LocateFixed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { geocodeAddress, reverseGeocode } from "@/lib/domain/address";
import { updateCompanyAddress } from "@/lib/domain/companies";
import { AddressMapView } from "@/components/account/address-map-view";
import { profileAddressSchema, type ProfileAddressInput } from "@/lib/validations/address";

export function RestaurantAddressForm({
  companyId,
  initial,
}: {
  companyId: string;
  initial: {
    street: string | null;
    number: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    lat: number | null;
    lng: number | null;
  };
}) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initial.lat != null && initial.lng != null ? { lat: initial.lat, lng: initial.lng } : null,
  );
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ProfileAddressInput>({
    resolver: zodResolver(profileAddressSchema),
    defaultValues: {
      street: initial.street ?? "",
      number: initial.number ?? "",
      neighborhood: initial.neighborhood ?? "",
      city: initial.city ?? "",
      state: initial.state ?? "",
      postalCode: initial.postalCode ?? "",
    },
  });

  async function tryLocateOnMap() {
    const { street, number, city, state } = getValues();
    if (!street.trim() || !city.trim()) return;
    try {
      const found = await geocodeAddress({ street, number, city, state });
      if (found) setCoords(found);
    } catch {
      // Silent: the map still lets the user drop the pin manually.
    }
  }

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

  const saveMutation = useMutation({
    mutationFn: async (values: ProfileAddressInput) => {
      const supabase = createClient();
      const { error } = await updateCompanyAddress(supabase, companyId, {
        ...values,
        lat: coords?.lat,
        lng: coords?.lng,
      });
      if (error) throw error;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Endereço e ponto de coleta</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Usado para calcular a taxa e o tempo de entrega, e como o ponto de coleta para onde o
              entregador é enviado ao retirar o pedido.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={useMyLocation}
              disabled={locating}
            >
              <LocateFixed className="size-4" />
              {locating ? "Localizando…" : "Usar minha localização"}
            </Button>
          </div>
          {locateError && <p className="text-sm text-destructive">{locateError}</p>}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="restaurant-street">Rua</Label>
              <Input id="restaurant-street" {...register("street")} onBlur={tryLocateOnMap} />
              {errors.street && <p className="text-sm text-destructive">{errors.street.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="restaurant-number">Número</Label>
              <Input id="restaurant-number" {...register("number")} onBlur={tryLocateOnMap} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="restaurant-neighborhood">Bairro</Label>
            <Input id="restaurant-neighborhood" {...register("neighborhood")} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="restaurant-city">Cidade</Label>
              <Input id="restaurant-city" {...register("city")} onBlur={tryLocateOnMap} />
              {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="restaurant-state">Estado</Label>
              <Input id="restaurant-state" {...register("state")} onBlur={tryLocateOnMap} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="restaurant-postal">CEP</Label>
            <Input id="restaurant-postal" {...register("postalCode")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Localização no mapa</Label>
            <p className="text-sm text-muted-foreground">
              Vamos tentar encontrar a localização a partir do endereço. Se o pino não estiver no
              lugar certo, arraste-o no mapa para corrigir.
            </p>
            <AddressMapView
              lat={coords?.lat ?? null}
              lng={coords?.lng ?? null}
              onChange={(newLat, newLng) => setCoords({ lat: newLat, lng: newLng })}
            />
          </div>

          <Button type="submit" disabled={saveMutation.isPending} className="w-fit">
            {saveMutation.isPending ? "Salvando…" : "Salvar"}
          </Button>
          {saveMutation.isSuccess && <p className="text-sm text-primary">Endereço salvo.</p>}
          {saveMutation.isError && (
            <p className="text-sm text-destructive">Não foi possível salvar. Tente de novo.</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
