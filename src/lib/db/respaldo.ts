import { CATEGORIAS_DE_FABRICA, getDb } from "./base";
import { TABLAS, type NombreTabla, type Registro, type Tablas } from "./tipos";

/**
 * Exportar e importar todos los datos (plan técnico, sección 5).
 * Esta parte no cifra: prepara el contenido que después se guarda en un
 * archivo o se cifra con el código de respaldo.
 */

export const FORMATO = "la-sembradora/respaldo";
export const VERSION_RESPALDO = 1;

export type Respaldo = {
  formato: typeof FORMATO;
  version: number;
  exportado: string;
  tablas: { [K in NombreTabla]: Tablas[K][] };
};

/** Incluye lo borrado: así, al juntar, un borrado reciente le gana a una copia vieja. */
export async function exportarTodo(): Promise<Respaldo> {
  const db = getDb();
  const tablas = {} as Respaldo["tablas"];
  await db.transaction("r", TABLAS.map((t) => db.table(t)), async () => {
    for (const t of TABLAS) (tablas as Record<string, unknown[]>)[t] = await db.table(t).toArray();
  });
  return { formato: FORMATO, version: VERSION_RESPALDO, exportado: new Date().toISOString(), tablas };
}

export class RespaldoInvalido extends Error {}

/** Revisa que el contenido sea un respaldo de este sitio antes de tocar la base. */
export function validarRespaldo(datos: unknown): Respaldo {
  const r = datos as Partial<Respaldo> | null;
  if (!r || typeof r !== "object" || r.formato !== FORMATO) throw new RespaldoInvalido("Este archivo no es un respaldo de La sembradora.");
  if (typeof r.version !== "number" || r.version > VERSION_RESPALDO) throw new RespaldoInvalido("Este respaldo es de una versión más nueva del sitio.");
  if (!r.tablas || typeof r.tablas !== "object") throw new RespaldoInvalido("El respaldo está incompleto.");
  for (const t of TABLAS) {
    const filas = (r.tablas as Record<string, unknown>)[t] ?? [];
    if (!Array.isArray(filas)) throw new RespaldoInvalido("El respaldo está incompleto.");
    for (const f of filas as Partial<Registro>[]) {
      if (!f || typeof f.id !== "string" || typeof f.actualizado !== "string") throw new RespaldoInvalido("El respaldo tiene datos dañados.");
    }
  }
  return r as Respaldo;
}

export type ResultadoImportar = { agregados: number; actualizados: number; sinCambio: number };

/**
 * - `juntar`: une por `id`; si el registro existe en los dos lados, gana el `actualizado` más reciente.
 * - `reemplazar`: borra todo lo del teléfono y deja solo lo del respaldo.
 */
export async function importar(datos: unknown, modo: "juntar" | "reemplazar"): Promise<ResultadoImportar> {
  const respaldo = validarRespaldo(datos);
  const db = getDb();
  const res: ResultadoImportar = { agregados: 0, actualizados: 0, sinCambio: 0 };
  await db.transaction("rw", TABLAS.map((t) => db.table(t)), async () => {
    for (const t of TABLAS) {
      const tbl = db.table<Registro, string>(t);
      const entrantes = (respaldo.tablas[t] ?? []) as Registro[];
      if (modo === "reemplazar") {
        await tbl.clear();
        await tbl.bulkPut(entrantes);
        res.agregados += entrantes.length;
        continue;
      }
      const locales = new Map((await tbl.bulkGet(entrantes.map((e) => e.id))).map((l, i) => [entrantes[i].id, l]));
      const aGuardar: Registro[] = [];
      for (const e of entrantes) {
        const l = locales.get(e.id);
        if (!l) {
          aGuardar.push(e);
          res.agregados++;
        } else if (e.actualizado > l.actualizado) {
          aGuardar.push(e);
          res.actualizados++;
        } else {
          res.sinCambio++;
        }
      }
      if (aGuardar.length) await tbl.bulkPut(aGuardar);
    }
    // Las categorías de fábrica siempre deben existir, aunque el respaldo no las traiga.
    const faltan = (await db.categorias.bulkGet(CATEGORIAS_DE_FABRICA.map((c) => c.id))).flatMap((c, i) => (c ? [] : [CATEGORIAS_DE_FABRICA[i]]));
    if (faltan.length) await db.categorias.bulkAdd(faltan);
  });
  return res;
}
