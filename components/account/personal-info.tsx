"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { NameForm } from "@/components/account/name-form";
import { ContactPhoneForm } from "@/components/account/contact-phone-form";
import { EmailForm } from "@/components/account/email-form";
import { AddressForm } from "@/components/account/address-form";
import type { UserAddress } from "@/lib/domain/address";

type Field = "nome" | "contato" | "email" | "endereco" | null;

function Row({
  label,
  value,
  verified,
  onClick,
  children,
  open,
  footer,
}: {
  label: string;
  value: string;
  verified?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  open?: boolean;
  footer?: React.ReactNode;
}) {
  return (
    <div className="border-b py-3 last:border-b-0">
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={cn(
          "flex w-full items-center justify-between gap-3 text-left",
          !onClick && "cursor-default",
        )}
      >
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="flex items-center gap-1.5 font-medium">
            {value}
            {verified && <BadgeCheck className="size-4 text-primary" />}
          </p>
        </div>
        {onClick && (
          <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")} />
        )}
      </button>
      {footer && <div className="mt-2">{footer}</div>}
      {open && children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function PersonalInfo({
  userId,
  fullName,
  email,
  loginPhone,
  loginPhoneConfirmed,
  contactPhone,
  address,
}: {
  userId: string;
  fullName: string;
  email: string;
  loginPhone: string | null;
  loginPhoneConfirmed: boolean;
  contactPhone: string | null;
  address: UserAddress | null;
}) {
  const [open, setOpen] = useState<Field>(null);
  const [currentName, setCurrentName] = useState(fullName);
  const [currentContactPhone, setCurrentContactPhone] = useState(contactPhone);

  function toggle(field: Field) {
    setOpen((current) => (current === field ? null : field));
  }

  return (
    <div className="flex flex-col">
      <Row
        label="Nome"
        value={currentName || "Sem nome"}
        onClick={() => toggle("nome")}
        open={open === "nome"}
      >
        <NameForm
          userId={userId}
          fullName={currentName}
          onSaved={(value) => {
            setCurrentName(value);
            setOpen(null);
          }}
        />
      </Row>

      <Row
        label="Número de telefone (login)"
        value={loginPhone || "Nenhum telefone verificado"}
        verified={loginPhoneConfirmed}
        footer={
          <Link href="/conta/seguranca" className="text-sm text-primary underline underline-offset-4">
            {loginPhoneConfirmed ? "Trocar número" : "Verificar telefone"}
          </Link>
        }
      />

      <Row
        label="Telefone de contato"
        value={currentContactPhone || "Não informado"}
        onClick={() => toggle("contato")}
        open={open === "contato"}
      >
        <ContactPhoneForm
          userId={userId}
          phone={currentContactPhone}
          onSaved={(value) => {
            setCurrentContactPhone(value);
            setOpen(null);
          }}
        />
      </Row>

      <Row label="E-mail" value={email} verified onClick={() => toggle("email")} open={open === "email"}>
        <EmailForm currentEmail={email} />
      </Row>

      <Row
        label="Endereço"
        value={address ? `${address.street}, ${address.number}` : "Nenhum endereço salvo"}
        onClick={() => toggle("endereco")}
        open={open === "endereco"}
      >
        <AddressForm userId={userId} initialAddress={address} />
      </Row>
    </div>
  );
}
