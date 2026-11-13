"use client";

import { borrar, guardarAjuste, leerAjuste } from "@/lib/db";

/**
 * PIN opcional para teléfonos compartidos (MD-12). No cifra los datos: evita que alguien
 * que toma el teléfono vea Mi dinero sin querer. Se guarda solo su huella (PBKDF2 con sal).
 */

type HuellaPin = { sal: string; huella: string };
const SESION = "sembradora-pin-ok";

const hex = (b: ArrayBuffer | Uint8Array) => Array.from(new Uint8Array(b instanceof Uint8Array ? b : new Uint8Array(b)), (x) => x.toString(16).padStart(2, "0")).join("");
const deHex = (s: string): Uint8Array<ArrayBuffer> => Uint8Array.from(s.match(/../g)!.map((x) => parseInt(x, 16)));

async function huella(pin: string, sal: Uint8Array<ArrayBuffer>) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: sal, iterations: 200_000, hash: "SHA-256" }, base, 256));
}

export const pinValido = (pin: string) => /^\d{4}$/.test(pin);

export async function ponerPin(pin: string) {
  const sal = new Uint8Array(16);
  crypto.getRandomValues(sal);
  await guardarAjuste("pin", { sal: hex(sal), huella: await huella(pin, sal) } satisfies HuellaPin);
  marcarDesbloqueado();
}

export async function hayPin() {
  return Boolean(await leerAjuste<HuellaPin>("pin"));
}

export async function revisarPin(pin: string) {
  const h = await leerAjuste<HuellaPin>("pin");
  if (!h) return true;
  const ok = (await huella(pin, deHex(h.sal))) === h.huella;
  if (ok) marcarDesbloqueado();
  return ok;
}

export async function quitarPin() {
  await borrar("ajustes", "pin");
  marcarDesbloqueado();
}

/** El desbloqueo dura mientras la pestaña esté abierta. */
export function marcarDesbloqueado() {
  try {
    sessionStorage.setItem(SESION, "1");
  } catch {
    /* sin almacenamiento de sesión: se pedirá el PIN de nuevo */
  }
}

export function estaDesbloqueado() {
  try {
    return sessionStorage.getItem(SESION) === "1";
  } catch {
    return false;
  }
}
