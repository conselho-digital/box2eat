"use client";

import { useEffect } from "react";

/** Registered unconditionally (not just when the user opts into push) so the
 *  app meets the browser's installability criteria for every visitor. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
