"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { createQrLoginRequest, getQrLoginStatus, type QrLoginStatus } from "@/lib/domain/qr-login";

const POLL_INTERVAL_MS = 2000;

export function QrLoginPanel() {
  const router = useRouter();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<QrLoginStatus>("pending");
  const [error, setError] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);

  const generate = useCallback(async () => {
    setError(null);
    setStatus("pending");
    setQrDataUrl(null);
    try {
      const supabase = createClient();
      const { data: token, error: createError } = await createQrLoginRequest(supabase);
      if (createError || !token) throw createError ?? new Error("Falha ao gerar QR code");

      tokenRef.current = token;
      const url = `${window.location.origin}/login/qr/${token}`;
      const dataUrl = await QRCode.toDataURL(url, { width: 240, margin: 1 });
      setQrDataUrl(dataUrl);
    } catch {
      setError("Não foi possível gerar o QR code. Tente novamente.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time QR token fetch on mount
    generate();
  }, [generate]);

  useEffect(() => {
    if (!qrDataUrl || status !== "pending") return;

    const supabase = createClient();
    const interval = setInterval(async () => {
      const token = tokenRef.current;
      if (!token) return;

      const { data: row, error: pollError } = await getQrLoginStatus(supabase, token);
      if (pollError || !row) return;

      if (row.status === "expired") {
        setStatus("expired");
        return;
      }

      if (row.status === "confirmed" && row.token_hash) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: row.token_hash,
          type: "magiclink",
        });
        if (verifyError) {
          setError("Não foi possível concluir o login. Tente novamente.");
          setStatus("expired");
          return;
        }
        setStatus("confirmed");
        router.push("/conta");
        router.refresh();
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [qrDataUrl, status, router]);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-sm text-muted-foreground">
        Abra o Box2eat no seu celular já conectado e leia o código para entrar
        neste dispositivo.
      </p>

      <div className="flex size-60 items-center justify-center rounded-lg border bg-muted">
        {status === "expired" ? (
          <div className="flex flex-col items-center gap-2 p-4">
            <p className="text-sm text-muted-foreground">QR code expirado</p>
            <Button type="button" size="sm" onClick={generate}>
              Gerar novo código
            </Button>
          </div>
        ) : qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- data: URI generated client-side, not a Next-optimizable asset
          <img src={qrDataUrl} alt="QR code para login" className="size-56" />
        ) : (
          <p className="text-sm text-muted-foreground">Gerando…</p>
        )}
      </div>

      {status === "confirmed" && (
        <p className="text-sm text-primary">Conectado! Redirecionando…</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
