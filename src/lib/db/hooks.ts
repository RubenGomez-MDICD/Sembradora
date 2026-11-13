"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getDb } from "./base";
import { categoriasDe, leerBorrador, vivos } from "./repositorio";
import type { NombreTabla, Tablas, TipoMovimiento } from "./tipos";

/**
 * Lecturas que se actualizan solas cuando cambia la base.
 * Devuelven `undefined` mientras cargan (y en el servidor), para que la pantalla
 * pueda mostrar su estado de carga sin parpadear entre «vacío» y «con datos».
 */

export function useTabla<K extends NombreTabla>(nombre: K): Tablas[K][] | undefined {
  return useLiveQuery(async () => vivos(await getDb().table<Tablas[K], string>(nombre).toArray()) as Tablas[K][], [nombre]);
}

export function useRegistro<K extends NombreTabla>(nombre: K, id: string | undefined): Tablas[K] | null | undefined {
  return useLiveQuery(async () => {
    if (!id) return null;
    const r = await getDb().table<Tablas[K], string>(nombre).get(id);
    return r && !(r as { borrado?: string }).borrado ? r : null;
  }, [nombre, id]);
}

export const useCategorias = (tipo: TipoMovimiento) => useLiveQuery(() => categoriasDe(tipo), [tipo]);

export const useBorrador = (flujo: string) => useLiveQuery(async () => (await leerBorrador(flujo)) ?? {}, [flujo]);
