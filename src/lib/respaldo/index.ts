"use client";

import { exportarTodo, getDb, guardarAjuste, importar, leerAjuste, validarRespaldo, type Respaldo, type ResultadoImportar } from "@/lib/db";
import { cifrar, descifrar, idDeCodigo, type Sobre } from "./codigo";

export * from "./codigo";

/**
 * Respaldo del lado del teléfono: archivo (MD-8f, MD-10f) y código (MD-9, MD-10).
 * Ajustes que usa:
 * - `respaldoCodigo`: el código, para actualizar el respaldo solo y para quitar el PIN.
 * - `ultimoRespaldo`: fecha ISO del último respaldo con código que se subió.
 */

export const cuantosMovimientos = (r: Respaldo) => r.tablas.movimientos.filter((m) => !m.borrado).length;

/** Ajustes que son de este teléfono y no viajan en un respaldo: el código, su fecha y el PIN. */
const PRIVADOS = new Set(["respaldoCodigo", "ultimoRespaldo", "pin"]);
async function exportarSinPrivados(): Promise<Respaldo> {
  const r = await exportarTodo();
  return { ...r, tablas: { ...r.tablas, ajustes: r.tablas.ajustes.filter((a) => !PRIVADOS.has(a.id)) } };
}

/* ------------------------------------------------------------------ */
/* Archivo                                                               */
/* ------------------------------------------------------------------ */

const corto = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" });

/** «la-sembradora-respaldo-14-oct.txt». Es .txt para que WhatsApp lo acepte como documento. */
export function nombreArchivo(fecha = new Date()) {
  const [dia, mes] = corto.format(fecha).replace(".", "").split(" ");
  return `la-sembradora-respaldo-${dia}-${mes}.txt`;
}

export async function archivoDeRespaldo() {
  const r = await exportarSinPrivados();
  const blob = new Blob([JSON.stringify(r)], { type: "text/plain" });
  return { blob, nombre: nombreArchivo(), movimientos: cuantosMovimientos(r) };
}

export class ArchivoInvalido extends Error {}

export async function leerArchivo(file: File): Promise<Respaldo> {
  let datos: unknown;
  try {
    datos = JSON.parse(await file.text());
  } catch {
    throw new ArchivoInvalido("Este archivo no es un respaldo de La sembradora.");
  }
  try {
    return validarRespaldo(datos);
  } catch (e) {
    throw new ArchivoInvalido((e as Error).message);
  }
}

/* ------------------------------------------------------------------ */
/* Código                                                                */
/* ------------------------------------------------------------------ */

export class SinInternet extends Error {}
export class SinAlmacen extends Error {}
export class NoEncontrado extends Error {}

async function llamar(input: string, init?: RequestInit) {
  if (typeof navigator !== "undefined" && !navigator.onLine) throw new SinInternet("No hay internet.");
  let r: Response;
  try {
    r = await fetch(input, init);
  } catch {
    throw new SinInternet("No hay internet.");
  }
  if (r.status === 503) throw new SinAlmacen("El respaldo con código todavía no está activo.");
  if (r.status === 404) throw new NoEncontrado("No encontramos un respaldo con ese código.");
  if (!r.ok) throw new Error(`Error ${r.status}`);
  return r;
}

/** Cifra todo en el teléfono y sube solo el texto cifrado. */
export async function subirRespaldo(codigo: string) {
  const r = await exportarSinPrivados();
  const sobre = await cifrar(codigo, r);
  await llamar("/api/respaldo", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: await idDeCodigo(codigo), sobre, movimientos: cuantosMovimientos(r) }) });
  const ahora = new Date().toISOString();
  await guardarAjuste("respaldoCodigo", codigo);
  await guardarAjuste("ultimoRespaldo", ahora);
  return { fecha: ahora, movimientos: cuantosMovimientos(r) };
}

/** Baja el respaldo y lo descifra en el teléfono. */
export async function bajarRespaldo(codigo: string): Promise<{ respaldo: Respaldo; guardado: string }> {
  const r = await llamar(`/api/respaldo?id=${await idDeCodigo(codigo)}`);
  const { sobre, guardado } = (await r.json()) as { sobre: Sobre; guardado: string };
  const respaldo = validarRespaldo(await descifrar(codigo, sobre));
  return { respaldo, guardado };
}

export async function recuperar(respaldo: Respaldo, modo: "juntar" | "reemplazar", codigo?: string): Promise<ResultadoImportar> {
  const res = await importar(respaldo, modo);
  if (codigo) await guardarAjuste("respaldoCodigo", codigo);
  return res;
}

/** Lo que hay en este teléfono, para comparar antes de recuperar (MD-10). */
export async function resumenLocal() {
  const movs = (await getDb().movimientos.toArray()).filter((m) => !m.borrado);
  const fechas = movs.map((m) => m.fecha).sort();
  return { movimientos: movs.length, desde: fechas[0], hasta: fechas[fechas.length - 1] };
}

/** Fecha del cambio más reciente en cualquier tabla. */
export async function ultimoCambio(): Promise<string | null> {
  const r = await exportarSinPrivados();
  let max: string | null = null;
  for (const filas of Object.values(r.tablas)) for (const f of filas as { actualizado: string; id: string }[]) if (!max || f.actualizado > max) max = f.actualizado;
  return max;
}

/**
 * Actualiza el respaldo con código si hubo cambios desde el último (MD-9: «se actualiza
 * solo cuando tengas internet»). No avisa nada si falla: se intenta la próxima vez.
 */
export async function actualizarSiHaceFalta() {
  const codigo = await leerAjuste<string>("respaldoCodigo");
  if (!codigo || !navigator.onLine) return;
  const [ultimo, cambio] = await Promise.all([leerAjuste<string>("ultimoRespaldo"), ultimoCambio()]);
  if (ultimo && cambio && cambio <= ultimo) return;
  try {
    await subirRespaldo(codigo);
  } catch {
    /* sin internet o sin almacén: se intenta después */
  }
}
