"use client";

import { useSyncExternalStore } from "react";

function suscribir(avisar: () => void) {
  window.addEventListener("online", avisar);
  window.addEventListener("offline", avisar);
  return () => {
    window.removeEventListener("online", avisar);
    window.removeEventListener("offline", avisar);
  };
}

/**
 * ¿Hay internet? Se actualiza al perder o recuperar la conexión.
 * En el servidor siempre es «sí», para que la página no cambie al hidratarse con conexión.
 */
export function useEnLinea() {
  return useSyncExternalStore(
    suscribir,
    () => navigator.onLine,
    () => true,
  );
}
