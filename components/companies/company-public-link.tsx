"use client";

import { useState } from "react";
import Link from "next/link";
import { Share2, Check } from "lucide-react";

export function CompanyPublicLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/${slug}`;

    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch {
        // User cancelled the share sheet — nothing to do.
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex min-w-0 items-center gap-1">
      <button
        type="button"
        onClick={handleShare}
        aria-label="Compartilhar link da loja"
        className="shrink-0 text-primary"
      >
        {copied ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
      </button>
      <Link
        href={`/${slug}`}
        target="_blank"
        className="truncate text-xs text-primary hover:underline"
      >
        Ver loja pública
      </Link>
    </div>
  );
}
