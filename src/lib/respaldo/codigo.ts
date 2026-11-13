/**
 * Código de respaldo y cifrado (plan técnico, sección 5).
 *
 * El código tiene tres grupos: una palabra de la milpa y dos grupos de 4 letras y números,
 * por ejemplo MILPA-7K3Q-92XD. Los grupos 2 y 3 no usan O, 0, I ni 1 para que no se confundan.
 *
 * Del código salen dos cosas por separado:
 * - un identificador (SHA-256) con el que el servidor guarda el respaldo, y
 * - una llave (PBKDF2 → AES-GCM) que nunca sale del teléfono.
 * El servidor solo ve el identificador y texto cifrado.
 */

export const PALABRAS = ["MILPA", "MAIZ", "FRIJOL", "CHILE", "CALABAZA", "ELOTE", "NOPAL", "SEMILLA", "SURCO", "COSECHA", "TIERRA", "LLUVIA", "RAIZ", "HOJA", "FLOR", "SOL"] as const;
/** 32 caracteres: sin O, 0, I ni 1. */
export const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const ITERACIONES = 600_000;
const SAL = new TextEncoder().encode("la-sembradora/respaldo/v1");

function aleatorio(n: number) {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return b;
}

export function nuevoCodigo(): string {
  const palabra = PALABRAS[aleatorio(1)[0] % PALABRAS.length];
  // 256 es múltiplo de 32: el módulo no sesga ningún carácter.
  const grupo = () => Array.from(aleatorio(4), (x) => ALFABETO[x % ALFABETO.length]).join("");
  return `${palabra}-${grupo()}-${grupo()}`;
}

export type RevisionCodigo = { ok: true; codigo: string } | { ok: false; error: "vacio" | "incompleto" | "letra-o" | "letra-i" | "cero" | "uno" | "palabra" | "invalido" };

/**
 * Acepta minúsculas, espacios y el código sin guiones («milpa 7k3q 92xd», «MILPA7K3Q92XD»).
 * Si algo no cuadra, dice qué para poder explicarlo (MD-11 y MD-11b).
 */
export function revisarCodigo(texto: string): RevisionCodigo {
  const limpio = texto.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!limpio) return { ok: false, error: "vacio" };
  const palabra = [...PALABRAS].sort((a, b) => b.length - a.length).find((p) => limpio.startsWith(p));
  if (!palabra) return { ok: false, error: limpio.length < 8 ? "incompleto" : "palabra" };
  const resto = limpio.slice(palabra.length);
  if (resto.length < 8) return { ok: false, error: "incompleto" };
  if (resto.length > 8) return { ok: false, error: "invalido" };
  if (resto.includes("O")) return { ok: false, error: "letra-o" };
  if (resto.includes("I")) return { ok: false, error: "letra-i" };
  if (resto.includes("0")) return { ok: false, error: "cero" };
  if (resto.includes("1")) return { ok: false, error: "uno" };
  if ([...resto].some((c) => !ALFABETO.includes(c))) return { ok: false, error: "invalido" };
  return { ok: true, codigo: `${palabra}-${resto.slice(0, 4)}-${resto.slice(4)}` };
}

export const MENSAJES_CODIGO: Record<Exclude<RevisionCodigo, { ok: true }>["error"], string> = {
  vacio: "Escribe tu código de respaldo.",
  incompleto: "Faltan letras o números: son 3 grupos, como MILPA-7K3Q-92XD.",
  "letra-o": "Ese código tiene una letra O y los códigos no la usan. Quizá es una Q o un 9.",
  "letra-i": "Ese código tiene una letra I y los códigos no la usan. Quizá es una J o una L.",
  cero: "Ese código tiene un cero y los códigos no lo usan. Quizá es una Q o un 9.",
  uno: "Ese código tiene un uno y los códigos no lo usan. Quizá es una L o un 7.",
  palabra: "El código empieza con una palabra, como MILPA o NOPAL. Revisa la primera parte.",
  invalido: "Revisa el código: son 3 grupos, como MILPA-7K3Q-92XD.",
};

const hex = (b: ArrayBuffer) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join("");
/** Base64 por partes: con muchos movimientos, pasarlo de una vez rompe la pila del navegador. */
function b64(b: ArrayBuffer | Uint8Array) {
  const bytes = b instanceof Uint8Array ? b : new Uint8Array(b);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
const deB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

/** Identificador público del respaldo. No sirve para descifrar. */
export async function idDeCodigo(codigo: string) {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`id:${codigo}`)));
}

async function llave(codigo: string) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(`llave:${codigo}`), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: SAL, iterations: ITERACIONES, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export type Sobre = { v: 1; iv: string; datos: string };

export async function cifrar(codigo: string, contenido: unknown): Promise<Sobre> {
  const iv = aleatorio(12);
  const texto = new TextEncoder().encode(JSON.stringify(contenido));
  const datos = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await llave(codigo), texto);
  return { v: 1, iv: b64(iv), datos: b64(datos) };
}

export class CodigoIncorrecto extends Error {}

export async function descifrar(codigo: string, sobre: Sobre): Promise<unknown> {
  try {
    const plano = await crypto.subtle.decrypt({ name: "AES-GCM", iv: deB64(sobre.iv) }, await llave(codigo), deB64(sobre.datos));
    return JSON.parse(new TextDecoder().decode(plano));
  } catch {
    throw new CodigoIncorrecto("El código no abre este respaldo.");
  }
}
