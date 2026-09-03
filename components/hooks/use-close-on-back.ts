"use client";

import { useEffect, useRef } from "react";

/** Makes the device's back gesture/button close something (a dialog, a
 *  fullscreen viewer) instead of navigating away from the page underneath.
 *  Pushes a dummy history entry while `open`, consumed by popstate; if it
 *  closes some other way (a close button, Escape), the cleanup below
 *  removes that entry itself — otherwise it'd sit in the history stack and
 *  eat one extra back press later. */
export function useCloseOnBack(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  const closedByPopStateRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    // Merge into the existing history.state rather than replacing it —
    // Next's App Router stores its own routing data there (the RSC tree
    // used to restore the page on back/forward), and overwriting it with a
    // bare object breaks client-side navigation once this entry is visited.
    history.pushState({ ...(history.state ?? {}), closeOnBack: true }, "");
    const handlePopState = () => {
      closedByPopStateRef.current = true;
      onCloseRef.current();
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (closedByPopStateRef.current) {
        closedByPopStateRef.current = false;
        return;
      }
      if ((history.state as { closeOnBack?: boolean } | null)?.closeOnBack) {
        history.back();
      }
    };
  }, [open]);
}
