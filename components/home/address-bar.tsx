"use client";

import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { MapPin, ChevronDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressForm } from "@/components/account/address-form";
import { createClient } from "@/lib/supabase/client";
import { listMyAddresses, setDefaultAddress, type UserAddress } from "@/lib/domain/address";

function addressLine(address: UserAddress) {
  return address.number ? `${address.street}, ${address.number}` : address.street;
}

export function AddressBar({
  userId,
  initialAddress,
}: {
  userId: string;
  initialAddress: UserAddress | null;
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [current, setCurrent] = useState(initialAddress);
  const queryClient = useQueryClient();
  const queryKey = ["my-addresses", userId];

  const { data: addresses, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listMyAddresses(supabase, userId);
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const selectMutation = useMutation({
    mutationFn: async (address: UserAddress) => {
      const supabase = createClient();
      const { error } = await setDefaultAddress(supabase, address.id);
      if (error) throw error;
      return address;
    },
    onSuccess: (address) => {
      setCurrent(address);
      queryClient.invalidateQueries({ queryKey });
      setOpen(false);
    },
  });

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        render={
          <button className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <MapPin className="size-4 text-primary" />
            <span className="max-w-[70vw] truncate">
              {current ? addressLine(current) : "Adicionar endereço"}
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
        }
      />
      <DialogPrimitive.Portal keepMounted>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-[1100] bg-black/30 duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup className="fixed inset-x-0 top-0 z-[1100] flex max-h-[85vh] flex-col gap-4 overflow-y-auto rounded-b-2xl bg-popover p-4 text-sm text-popover-foreground shadow-xl outline-none duration-200 data-open:animate-in data-open:slide-in-from-top data-closed:animate-out data-closed:slide-out-to-top">
          <div className="flex items-center justify-between">
            <DialogPrimitive.Title className="font-heading text-base font-medium">
              Seus endereços
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              render={<Button variant="ghost" size="icon-sm" />}
            >
              <X className="size-4" />
              <span className="sr-only">Fechar</span>
            </DialogPrimitive.Close>
          </div>

          <div className="flex flex-col divide-y">
            {addresses?.map((address) => (
              <button
                key={address.id}
                type="button"
                onClick={() => selectMutation.mutate(address)}
                className="flex items-start gap-3 py-3 text-left hover:bg-muted/50"
              >
                <MapPin
                  className={`mt-0.5 size-4 shrink-0 ${address.is_default ? "text-primary" : "text-muted-foreground"}`}
                />
                <div>
                  <p className="font-medium">{address.label || "Endereço"}</p>
                  <p className="text-sm text-muted-foreground">{addressLine(address)}</p>
                </div>
              </button>
            ))}
            {addresses?.length === 0 && !adding && (
              <p className="py-3 text-sm text-muted-foreground">Nenhum endereço salvo ainda.</p>
            )}
          </div>

          {adding ? (
            <AddressForm
              userId={userId}
              initialAddress={null}
              heading="Novo endereço"
              submitLabel="Adicionar endereço"
              makeDefault
              onSaved={async () => {
                setAdding(false);
                const { data } = await refetch();
                const newDefault = data?.find((address) => address.is_default);
                if (newDefault) setCurrent(newDefault);
              }}
            />
          ) : (
            <Button type="button" variant="outline" className="w-fit" onClick={() => setAdding(true)}>
              <Plus className="size-4" />
              Adicionar endereço
            </Button>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
