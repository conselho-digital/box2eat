"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/components/cart/cart-provider";
import { createClient } from "@/lib/supabase/client";
import { submitOrder } from "@/lib/domain/checkout";
import { cartSubtotal } from "@/lib/domain/cart";
import {
  deliveryAddressSchema,
  type DeliveryAddressFormInput,
} from "@/lib/validations/checkout";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function CheckoutForm() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DeliveryAddressFormInput>({ resolver: zodResolver(deliveryAddressSchema) });

  if (!cart || cart.items.length === 0) {
    return <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>;
  }

  async function onSubmit(values: DeliveryAddressFormInput) {
    setFormError(null);
    const { notes, ...address } = values;
    const supabase = createClient();
    const { data, error } = await submitOrder(supabase, cart!, address, notes);
    if (error || !data) {
      setFormError(describeCheckoutError(error?.message ?? "Erro desconhecido"));
      return;
    }
    clearCart();
    router.push(`/pedidos/${data.id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border p-3 text-sm">
        <p className="font-medium">{cart.companyName}</p>
        <p className="text-muted-foreground">
          {cart.items.length} item(ns) · Subtotal {currency.format(cartSubtotal(cart))}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="street">Rua</Label>
            <Input id="street" {...register("street")} />
            {errors.street && (
              <p className="text-sm text-destructive">{errors.street.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="number">Número</Label>
            <Input id="number" {...register("number")} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="complement">Complemento</Label>
          <Input id="complement" {...register("complement")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input id="neighborhood" {...register("neighborhood")} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" {...register("city")} />
            {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="state">UF</Label>
            <Input id="state" maxLength={2} {...register("state")} />
            {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="postal_code">CEP</Label>
          <Input id="postal_code" {...register("postal_code")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">Observações do pedido</Label>
          <Textarea id="notes" {...register("notes")} />
        </div>

        {formError && <p className="text-sm text-destructive">{formError}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando pedido…" : "Confirmar pedido"}
        </Button>
      </form>
    </div>
  );
}

function describeCheckoutError(message: string): string {
  const known: Record<string, string> = {
    company_not_accepting_orders: "Essa empresa não está aceitando pedidos no momento.",
    below_minimum_order: "O valor do pedido está abaixo do mínimo dessa empresa.",
    menu_item_unavailable: "Um dos itens do carrinho não está mais disponível.",
    invalid_option_selection: "A seleção de opções de um dos itens ficou inválida. Revise o carrinho.",
    missing_required_option: "Falta escolher uma opção obrigatória em um dos itens.",
    invalid_option: "Uma das opções escolhidas não é mais válida.",
    empty_order: "O carrinho está vazio.",
  };
  for (const [key, label] of Object.entries(known)) {
    if (message.includes(key)) return label;
  }
  return "Não foi possível concluir o pedido. Tente novamente.";
}
