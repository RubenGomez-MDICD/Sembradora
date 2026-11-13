"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useBorrador } from "./hooks";
import { guardarBorrador } from "./repositorio";

export type EstadoGuardado = "saved" | "saving" | "error";

/**
 * Datos de un flujo de varios pasos que se guardan solos en el teléfono
 * (plan técnico, sección 4: «el avance se guarda al cambiar un campo»).
 *
 * - `datos` es `null` mientras se lee lo guardado.
 * - `cambiar` actualiza la pantalla al momento y guarda poco después
 *   (se juntan los cambios de quien escribe rápido).
 * - `estado` alimenta a SaveStatus; `reintentar` vuelve a guardar si falló.
 */
export function useFlujo<T extends Record<string, unknown>>(flujo: string, espera = 400) {
  const guardado = useBorrador(flujo);
  const [datos, setDatos] = useState<T | null>(null);
  const [estado, setEstado] = useState<EstadoGuardado | undefined>(undefined);
  const pendiente = useRef<Partial<T>>({});
  const reloj = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (guardado && datos === null) {
      setDatos(guardado as T);
      if (Object.keys(guardado).length) setEstado("saved");
    }
  }, [guardado, datos]);

  const guardarYa = useCallback(async () => {
    const cambios = pendiente.current;
    pendiente.current = {};
    try {
      await guardarBorrador(flujo, cambios);
      setEstado((e) => (Object.keys(pendiente.current).length ? e : "saved"));
    } catch {
      pendiente.current = { ...cambios, ...pendiente.current };
      setEstado("error");
    }
  }, [flujo]);

  const cambiar = useCallback(
    (cambios: Partial<T>) => {
      setDatos((d) => ({ ...(d ?? {}), ...cambios }) as T);
      pendiente.current = { ...pendiente.current, ...cambios };
      setEstado("saving");
      if (reloj.current) clearTimeout(reloj.current);
      reloj.current = setTimeout(guardarYa, espera);
    },
    [guardarYa, espera],
  );

  // Si la persona sale de la pantalla antes de que se guarde, se guarda al momento.
  useEffect(
    () => () => {
      if (reloj.current) {
        clearTimeout(reloj.current);
        if (Object.keys(pendiente.current).length) void guardarBorrador(flujo, pendiente.current);
      }
    },
    [flujo],
  );

  const reintentar = useCallback(() => {
    setEstado("saving");
    void guardarYa();
  }, [guardarYa]);

  /** Guarda lo pendiente antes de navegar a otro paso. */
  const terminar = useCallback(async () => {
    if (reloj.current) clearTimeout(reloj.current);
    if (Object.keys(pendiente.current).length) await guardarYa();
  }, [guardarYa]);

  return { datos, cambiar, estado, reintentar, terminar };
}
