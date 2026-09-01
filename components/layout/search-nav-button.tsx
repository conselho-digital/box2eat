"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchNavButton() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = value.trim();
    router.push(query ? `/?q=${encodeURIComponent(query)}` : "/");
    setOpen(false);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        render={
          <button
            type="button"
            className="flex flex-1 flex-col items-center gap-0.5 py-1 text-xs text-muted-foreground"
          >
            <Search className="size-5" />
            Pesquisar
          </button>
        }
      />
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/30 duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup className="fixed inset-x-0 top-0 z-50 flex flex-col gap-3 bg-popover p-4 text-popover-foreground shadow-xl outline-none duration-200 data-open:animate-in data-open:slide-in-from-top data-closed:animate-out data-closed:slide-out-to-top">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                type="text"
                placeholder="Buscar restaurantes…"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-11 rounded-xl pl-10"
              />
            </div>
            <DialogPrimitive.Close
              render={<button type="button" className="text-sm text-muted-foreground" />}
            >
              Cancelar
            </DialogPrimitive.Close>
          </form>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
