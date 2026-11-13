import { calcularDerechos, DatosIncompletos, type Situacion } from "@/lib/calculos/derechos";
import { formatFechaCorta, formatMoney, parsePesos } from "@/lib/format";

/** Avance de la calculadora de Mis derechos, guardado en el borrador «mis-derechos». */
export const FLUJO_DERECHOS = "mis-derechos";

export type DatosDerechos = {
  contrato?: "si" | "no" | "nose";
  /** Lo que escribió la persona, tal cual (por ejemplo «450»). */
  sueldo?: string;
  inicio?: string;
  situacion?: Situacion;
  ultimoDia?: string;
};

export type ErroresDerechos = Partial<Record<"sueldo" | "inicio" | "situacion" | "ultimoDia", string>>;

/** Revisa los datos del paso 2 y dice qué falta, campo por campo. */
export function validarDatos(d: DatosDerechos, hoy = new Date().toISOString().slice(0, 10)): ErroresDerechos {
  const e: ErroresDerechos = {};
  const sueldo = parsePesos(d.sueldo);
  if (!d.sueldo) e.sueldo = "Escribe cuánto te pagan al día.";
  else if (!sueldo) e.sueldo = "Escribe solo el número, por ejemplo 450.";
  if (!d.inicio) e.inicio = "Elige el día en que empezaste.";
  else if (d.inicio > hoy) e.inicio = "Esa fecha todavía no llega.";
  if (!d.situacion) e.situacion = "Elige una opción.";
  if (d.situacion && d.situacion !== "sigue") {
    if (!d.ultimoDia) e.ultimoDia = "Elige tu último día de trabajo.";
    else if (d.inicio && d.ultimoDia < d.inicio) e.ultimoDia = "Tu último día no puede ser antes del primero.";
  }
  return e;
}

export function resultadoDe(d: DatosDerechos) {
  try {
    return calcularDerechos({ sueldoDiario: parsePesos(d.sueldo) ?? 0, inicio: d.inicio ?? "", situacion: d.situacion ?? "sigue", ultimoDia: d.ultimoDia });
  } catch (err) {
    if (err instanceof DatosIncompletos) return null;
    throw err;
  }
}

/** Texto para mandar las cuentas por WhatsApp (DR-2L y DR-2F). */
export function textoParaCompartir(r: NonNullable<ReturnType<typeof resultadoDe>>, titulo: string) {
  const lineas = [
    `${titulo}: ${formatMoney(r.total)}`,
    "",
    ...r.renglones.map((x) => `• ${x.etiqueta}: ${formatMoney(x.monto)} (${x.nota})`),
    "",
    `Sueldo: ${formatMoney(r.sueldoDiario)} al día.${r.bajoMinimo ? ` Calculado con el mínimo de ley: ${formatMoney(r.base)}.` : ""}`,
    r.limiteParaReclamar ? `Para reclamar: hasta el ${formatFechaCorta(r.limiteParaReclamar)} (art. 518 LFT).` : "",
    "Montos aproximados, calculados con la Ley Federal del Trabajo en La sembradora.",
  ];
  return lineas.filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n").trim();
}

export const enlaceWhatsApp = (texto: string) => `https://wa.me/?text=${encodeURIComponent(texto)}`;
