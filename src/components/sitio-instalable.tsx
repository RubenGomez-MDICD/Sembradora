"use client";

import { useEffect } from "react";
import { notify } from "@/components/ds";
import { getDb } from "@/lib/db";

/**
 * Todo lo que hace que el sitio funcione como app:
 * - registra el service worker (solo en producción) y avisa cuando hay versión nueva;
 * - avisa al quedarse sin internet y al volver;
 * - si no hay internet, evita abrir enlaces a otros sitios y lo explica;
 * - pide al navegador que no borre los datos del teléfono (almacenamiento persistente);
 * - guarda el aviso de instalación de Android para mostrarlo en Inicio.
 */

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
let eventoInstalar: EventoInstalar | null = null;
const oyentes = new Set<() => void>();

export const puedeInstalar = () => eventoInstalar !== null;
export const alCambiarInstalable = (f: () => void) => (oyentes.add(f), () => void oyentes.delete(f));
export async function instalar() {
  if (!eventoInstalar) return false;
  await eventoInstalar.prompt();
  const { outcome } = await eventoInstalar.userChoice;
  eventoInstalar = null;
  oyentes.forEach((f) => f());
  return outcome === "accepted";
}

/** Pide que los datos no se borren solos. Solo si ya hay algo anotado, para no preguntar de más. */
async function pedirPersistencia() {
  if (!navigator.storage?.persist || (await navigator.storage.persisted())) return;
  const db = getDb();
  const [m, metas, c] = await Promise.all([db.movimientos.count(), db.metas.count(), db.calculos.count()]);
  if (m + metas + c > 0) await navigator.storage.persist();
}

export function SitioInstalable() {
  useEffect(() => {
    const capturar = (e: Event) => {
      e.preventDefault();
      eventoInstalar = e as EventoInstalar;
      oyentes.forEach((f) => f());
    };
    window.addEventListener("beforeinstallprompt", capturar);

    const sinRed = () => notify({ title: "Sin internet. Lo que anotes se guarda en tu teléfono.", status: "info" });
    const conRed = () => notify({ title: "Volvió el internet" });
    window.addEventListener("offline", sinRed);
    window.addEventListener("online", conRed);

    // Enlaces a otros sitios: sin internet no abren, mejor decirlo.
    const alTocar = (e: MouseEvent) => {
      if (navigator.onLine) return;
      const a = (e.target as HTMLElement).closest?.("a[href^='http']") as HTMLAnchorElement | null;
      if (!a || a.host === location.host || a.host === "wa.me") return;
      e.preventDefault();
      notify({ title: "Necesitas internet para abrir esa página", status: "info" });
    };
    document.addEventListener("click", alTocar, true);

    const t = setTimeout(() => void pedirPersistencia().catch(() => {}), 3000);
    const alOcultar = () => document.visibilityState === "hidden" && void pedirPersistencia().catch(() => {});
    document.addEventListener("visibilitychange", alOcultar);

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) void registrar();

    return () => {
      window.removeEventListener("beforeinstallprompt", capturar);
      window.removeEventListener("offline", sinRed);
      window.removeEventListener("online", conRed);
      document.removeEventListener("click", alTocar, true);
      document.removeEventListener("visibilitychange", alOcultar);
      clearTimeout(t);
    };
  }, []);
  return null;
}

async function registrar() {
  const version = process.env.NEXT_PUBLIC_VERSION ?? "local";
  const yaHabia = Boolean(navigator.serviceWorker.controller);
  const reg = await navigator.serviceWorker.register(`/sw.js?v=${version}`, { scope: "/" });

  // La página donde se instaló por primera vez no pasó por el service worker: se le pide guardarla.
  navigator.serviceWorker.ready.then((r) => r.active?.postMessage({ tipo: "GUARDAR", ruta: location.pathname + location.search }));

  const ofrecer = (w: ServiceWorker) =>
    notify({
      title: "Hay una versión nueva de La sembradora",
      status: "info",
      action: { label: "Actualizar", onClick: () => w.postMessage({ tipo: "ACTUALIZAR" }) },
    });
  if (reg.waiting && yaHabia) ofrecer(reg.waiting);
  reg.addEventListener("updatefound", () => {
    const nuevo = reg.installing;
    nuevo?.addEventListener("statechange", () => {
      if (nuevo.state === "installed" && navigator.serviceWorker.controller) ofrecer(nuevo);
    });
  });
  let recargando = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!yaHabia || recargando) return;
    recargando = true;
    location.reload();
  });
}
