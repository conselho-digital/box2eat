"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { createCoupon, listCompanyCoupons, setCouponActive, type Coupon } from "@/lib/domain/coupons";
import { couponSchema, PROMO_TYPES, type CouponInput } from "@/lib/validations/coupon";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const PROMO_TYPE_HELP: Record<keyof typeof PROMO_TYPES, string> = {
  discount: "Um desconto simples em % ou R$ no pedido.",
  loyalty_purchases:
    "Pra clientes fiéis: combine com o cliente a partir de quantas compras ele ganha o código (ex.: na 5ª compra) e avise por WhatsApp.",
  loyalty_spend:
    "Troca por produto: avise o cliente que, ao atingir um valor gasto acumulado, ele ganha esse código pra resgatar um item.",
  buy_x_get_y:
    "Pague 1 leve 2 / ganhe um brinde: use desconto fixo (R$) igual ao preço do item grátis, e pedido mínimo igual ao preço do item pago.",
};

function describeCouponError(message: string) {
  if (message.includes("coupons_company_code_idx") || message.includes("duplicate key")) {
    return "Já existe um cupom com esse código.";
  }
  return "Não foi possível criar o cupom.";
}

export function CouponManager({ companyId }: { companyId: string }) {
  const queryClient = useQueryClient();
  const queryKey = ["company-coupons", companyId];

  const { data: coupons, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listCompanyCoupons(supabase, companyId);
      if (error) throw error;
      return data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CouponInput>({
    resolver: zodResolver(couponSchema),
    defaultValues: { discountType: "percentage", promoType: "discount" },
  });
  const [formError, setFormError] = useState<string | null>(null);
  const selectedPromoType = useWatch({ control, name: "promoType" });

  async function onSubmit(values: CouponInput) {
    setFormError(null);
    const supabase = createClient();
    const { error } = await createCoupon(supabase, companyId, values);
    if (error) {
      setFormError(describeCouponError(error.message));
      return;
    }
    reset({ discountType: "percentage", promoType: "discount" });
    queryClient.invalidateQueries({ queryKey });
  }

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const supabase = createClient();
      const { error } = await setCouponActive(supabase, id, isActive);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-lg border p-4">
        <h2 className="font-medium">Novo cupom</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="promoType">Tipo de promoção</Label>
            <select
              id="promoType"
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
              {...register("promoType")}
            >
              {Object.entries(PROMO_TYPES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {selectedPromoType && (
              <p className="text-xs text-muted-foreground">
                {PROMO_TYPE_HELP[selectedPromoType as keyof typeof PROMO_TYPES]}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="code">Código</Label>
            <Input id="code" placeholder="BEMVINDO10" {...register("code")} />
            {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="discountType">Tipo de desconto</Label>
            <select
              id="discountType"
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
              {...register("discountType")}
            >
              <option value="percentage">Percentual (%)</option>
              <option value="fixed">Valor fixo (R$)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="discountValue">Valor do desconto</Label>
            <Input id="discountValue" type="number" step="0.01" min="0" {...register("discountValue")} />
            {errors.discountValue && (
              <p className="text-sm text-destructive">{errors.discountValue.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="minOrderValue">Pedido mínimo (R$)</Label>
            <Input id="minOrderValue" type="number" step="0.01" min="0" {...register("minOrderValue")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="maxUses">Limite de usos (total)</Label>
            <Input id="maxUses" type="number" min="1" placeholder="Sem limite" {...register("maxUses")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="maxUsesPerUser">Limite por cliente</Label>
            <Input
              id="maxUsesPerUser"
              type="number"
              min="1"
              placeholder="1"
              {...register("maxUsesPerUser")}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="validUntil">Válido até</Label>
            <Input id="validUntil" type="date" {...register("validUntil")} />
          </div>
        </div>
        {formError && <p className="text-sm text-destructive">{formError}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting ? "Criando…" : "Criar cupom"}
        </Button>
      </form>

      <div className="flex flex-col gap-3">
        <h2 className="font-medium">Cupons</h2>
        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
        {!isLoading && (!coupons || coupons.length === 0) && (
          <p className="text-sm text-muted-foreground">Nenhum cupom criado ainda.</p>
        )}
        {coupons?.map((coupon) => (
          <CouponRow
            key={coupon.id}
            coupon={coupon}
            onToggle={(isActive) => toggleActive.mutate({ id: coupon.id, isActive })}
          />
        ))}
      </div>
    </div>
  );
}

function CouponRow({ coupon, onToggle }: { coupon: Coupon; onToggle: (isActive: boolean) => void }) {
  const value =
    coupon.discount_type === "percentage"
      ? `${coupon.discount_value}%`
      : currency.format(coupon.discount_value);
  const usage = coupon.max_uses ? `${coupon.uses_count}/${coupon.max_uses} usos` : `${coupon.uses_count} usos`;

  return (
    <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
      <div>
        <p className="font-medium">
          {coupon.code} · {value}
        </p>
        <p className="text-xs text-muted-foreground">
          {PROMO_TYPES[coupon.promo_type as keyof typeof PROMO_TYPES] ?? coupon.promo_type}
          {" · "}
          {usage}
          {coupon.min_order_value > 0 && ` · Mín. ${currency.format(coupon.min_order_value)}`}
          {coupon.valid_until &&
            ` · Até ${new Date(coupon.valid_until).toLocaleDateString("pt-BR")}`}
        </p>
      </div>
      <Button size="sm" variant="outline" onClick={() => onToggle(!coupon.is_active)}>
        {coupon.is_active ? "Desativar" : "Ativar"}
      </Button>
    </div>
  );
}
