"use client";

import { useState } from "react";
import { Download, Share } from "lucide-react";
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
                ? "O Safari não deixa instalar direto pelo site — é só um toque a mais:"
                : "Abra o menu do seu navegador e escolha \"Instalar aplicativo\" ou \"Adicionar à tela inicial\"."}
            </DialogDescription>
          </DialogHeader>
          {platform === "ios" && (
            <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3 text-sm">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background">
                <Share className="size-5" />
              </span>
              <p>
                Toque neste ícone <span className="text-muted-foreground">(compartilhar)</span> na
                barra do Safari e escolha <span className="font-medium">&quot;Adicionar à Tela de Início&quot;</span>.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
