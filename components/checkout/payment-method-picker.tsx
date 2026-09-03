"use client";

import { useState } from "react";
import { Banknote, Check, CreditCard, Info, QrCode, Wallet } from "lucide-react";
import {
  PAYMENT_OPTION_INFO,
  PAYMENT_OPTION_LABEL,
  type PaymentOption,
} from "@/lib/domain/payment-methods";

const OPTION_ICON: Record<PaymentOption, typeof Wallet> = {
  google_pay: Wallet,
  samsung_wallet: Wallet,
  apple_pay: Wallet,
  add_card: CreditCard,
  pix: QrCode,
  cash: Banknote,
  card_on_delivery: CreditCard,
};

export function PaymentMethodPicker({
  availableOptions,
  selected,
  onSelect,
}: {
  availableOptions: PaymentOption[];
  selected: PaymentOption | null;
  onSelect: (option: PaymentOption) => void;
}) {
  const [infoOpenFor, setInfoOpenFor] = useState<PaymentOption | null>(null);

  return (
    <div className="flex flex-col divide-y rounded-lg border">
      {availableOptions.map((option) => {
        const Icon = OPTION_ICON[option];
        const isSelected = selected === option;
        const info = PAYMENT_OPTION_INFO[option];
        return (
          <div key={option} className="flex flex-col">
            <div
              role="button"
              tabIndex={0}
              onClick={() => onSelect(option)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(option);
                }
              }}
              className="flex cursor-pointer items-center gap-3 p-3 text-left hover:bg-muted/50"
            >
              <Icon className="size-5 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium">{PAYMENT_OPTION_LABEL[option]}</span>
              {info && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInfoOpenFor((current) => (current === option ? null : option));
                  }}
                  aria-label={`Sobre ${PAYMENT_OPTION_LABEL[option]}`}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted"
                >
                  <Info className="size-4" />
                </button>
              )}
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                  isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input"
                }`}
              >
                {isSelected && <Check className="size-3" />}
              </span>
            </div>
            {infoOpenFor === option && info && (
              <p className="px-3 pb-3 text-xs text-muted-foreground">{info}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
