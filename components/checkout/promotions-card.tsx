"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { listActiveCouponsForCompany } from "@/lib/domain/coupons";
import { describePromotionBadge } from "@/lib/domain/restaurant-display";

/** Just the count, clickable to see what's available and go add more items
 *  from the store to take advantage of them. */
export function PromotionsCard({
  companyId,
  companySlug,
}: {
  companyId: string;
  companySlug: string;
}) {
  const [open, setOpen] = useState(false);
  const { data: coupons } = useQuery({
    queryKey: ["checkout-promotions", companyId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listActiveCouponsForCompany(supabase, companyId);
      if (error) throw error;
      return data;
    },
  });

  const count = coupons?.length ?? 0;
  if (count === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-lg border p-3 text-left hover:bg-muted/50"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <Tag className="size-4 text-primary" />
          Promoções disponíveis
        </span>
        <span className="text-sm font-semibold text-primary">{count}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promoções</DialogTitle>
            <DialogDescription>
              Volte ao cardápio pra adicionar itens que aproveitem essas promoções.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col divide-y rounded-lg border">
            {coupons?.map((coupon) => (
              <div key={coupon.id} className="p-3 text-sm">
                <p className="font-medium">{coupon.code}</p>
                <p className="text-muted-foreground">
                  {describePromotionBadge({
                    promoType: coupon.promo_type,
                    discountType: coupon.discount_type,
                    discountValue: coupon.discount_value,
                  })}
                </p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button render={<Link href={`/${companySlug}`} />} nativeButton={false}>
              Ver cardápio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
