"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { AppleLogo, AndroidLogo } from "@/components/layout/os-icons";
import { useInstallApp } from "@/components/pwa/install-app-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function GetAppMenuItem() {
  const { platform, isStandalone, canPrompt, requestInstall } = useInstallApp();
  const [showInstructions, setShowInstructions] = useState(false);

  if (isStandalone) return null;

  const Icon = platform === "ios" ? AppleLogo : platform === "android" ? AndroidLogo : Download;

  async function handleClick() {
    if (canPrompt) {
      await requestInstall();
      return;
    }
    setShowInstructions(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted"
      >
        <Icon className="size-5" />
        Obter aplicação
      </button>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Instalar o Box2eat</DialogTitle>
            <DialogDescription>
              {platform === "ios"
                ? "Toque no ícone de compartilhar do Safari e escolha \"Adicionar à Tela de Início\"."
                : "Abra o menu do seu navegador e escolha \"Instalar aplicativo\" ou \"Adicionar à tela inicial\"."}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
