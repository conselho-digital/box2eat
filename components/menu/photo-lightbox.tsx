"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, XIcon } from "lucide-react";
import { useCloseOnBack } from "@/components/hooks/use-close-on-back";

/** Fullscreen photo viewer. A single photo opens straight into the
 *  fullscreen view; with more than one, it opens into a grid gallery first
 *  and a tap picks which one to view fullscreen. The device's back
 *  gesture/button closes it instead of navigating the page underneath. */
export function PhotoLightbox({
  photos,
  open,
  onOpenChange,
}: {
  photos: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  // Resets which photo is showing each time the viewer (re)opens — this
  // compares against the previous `open` during render (React's documented
  // pattern for "reset state when a prop changes") rather than an effect,
  // so it doesn't fire again on every `photos` edit while already open.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setViewIndex(photos.length > 1 ? null : 0);
  }

  useCloseOnBack(open, () => onOpenChange(false));

  if (!open || photos.length === 0) return null;

  const showingGrid = viewIndex === null;

  return (
    <div className="fixed inset-0 z-[1200] flex flex-col bg-black/95">
      <div className="flex items-center justify-between p-2">
        {!showingGrid && photos.length > 1 ? (
          <button
            type="button"
            aria-label="Voltar para a galeria"
            onClick={() => setViewIndex(null)}
            className="rounded-full p-2 text-white hover:bg-white/10"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          aria-label="Fechar"
          onClick={() => onOpenChange(false)}
          className="rounded-full p-2 text-white hover:bg-white/10"
        >
          <XIcon className="size-5" />
        </button>
      </div>

      {showingGrid ? (
        <div className="grid flex-1 auto-rows-min grid-cols-3 gap-1 overflow-y-auto p-1">
          {photos.map((url, index) => (
            <button
              key={url + index}
              type="button"
              onClick={() => setViewIndex(index)}
              className="relative aspect-square overflow-hidden"
            >
              <Image src={url} alt="" fill unoptimized className="object-cover" />
            </button>
          ))}
        </div>
      ) : (
        <div className="relative flex-1">
          <Image
            src={photos[viewIndex]}
            alt=""
            fill
            unoptimized
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
}
