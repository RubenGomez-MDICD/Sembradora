"use client";

import { useEffect } from "react";

const CADA = 2 * 60 * 1000;
const MARCA = "sembradora-ultimo-intento-respaldo";

/**
 * Si hay código de respaldo, sube los cambios sin pedir nada (MD-9): al abrir el sitio,
 * al volver a internet y al salir de la pestaña. Como mucho cada 2 minutos.
 * Se carga después de que la página ya funciona y no pesa en la primera carga.
 */
export function RespaldoAutomatico() {
  useEffect(() => {
    const intentar = async () => {
      try {
        const ultimo = Number(sessionStorage.getItem(MARCA) ?? 0);
        if (Date.now() - ultimo < CADA) return;
        sessionStorage.setItem(MARCA, String(Date.now()));
      } catch {
        /* sin sessionStorage: se intenta igual */
      }
      const { actualizarSiHaceFalta } = await import("@/lib/respaldo");
      await actualizarSiHaceFalta();
    };
    const alOcultar = () => document.visibilityState === "hidden" && void intentar();
    const t = setTimeout(intentar, 5000);
    window.addEventListener("online", intentar);
    document.addEventListener("visibilitychange", alOcultar);
    return () => {
      clearTimeout(t);
      window.removeEventListener("online", intentar);
      document.removeEventListener("visibilitychange", alOcultar);
    };
  }, []);
  return null;
}
