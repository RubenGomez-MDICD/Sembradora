import type { UnidadPlazo } from "@/lib/db/tipos";
import type { FrecuenciaAporte } from "@/lib/calculos/ahorro";

/** Avance de «Mis metas» (AH-1 a AH-3), guardado en el borrador «mis-ahorros». */
export const FLUJO_AHORROS = "mis-ahorros";

export type DatosMeta = {
  clase?: string;
  /** Nombre escrito para «Otra meta». */
  otra?: string;
  icono?: string;
  monto?: string;
  plazo?: string;
  unidad?: UnidadPlazo;
  frecuencia?: FrecuenciaAporte;
};

/** Metas sugeridas (AH-1). */
export const CLASES = [
  { value: "casa", label: "Terminar o construir mi casa", nombre: "Terminar mi casa", icono: "house" },
  { value: "mayor", label: "Ahorrar para cuando sea mayor", nombre: "Para cuando sea mayor", icono: "piggy-bank" },
  { value: "estudiar", label: "Estudiar una carrera", nombre: "Estudiar una carrera", icono: "book-open" },
  { value: "negocio", label: "Poner mi negocio", nombre: "Poner mi negocio", icono: "store" },
];

/** Íconos para «Otra meta» (AH-1b). */
export const ICONOS_META = [
  { value: "bus", label: "Viaje" },
  { value: "house", label: "Casa" },
  { value: "book-open", label: "Escuela" },
  { value: "baby", label: "Niñas y niños" },
  { value: "heart-pulse", label: "Salud" },
  { value: "sprout", label: "Crecer" },
  { value: "wallet", label: "Dinero" },
  { value: "coins", label: "Ahorro" },
];

export function nombreDeMeta(d: DatosMeta) {
  if (d.clase === "emergencias") return { nombre: "Para emergencias", icono: "heart-pulse" };
  if (d.clase === "otra") return { nombre: d.otra?.trim() ?? "", icono: d.icono ?? "sprout" };
  const c = CLASES.find((x) => x.value === d.clase);
  return c ? { nombre: c.nombre, icono: c.icono } : { nombre: "", icono: "sprout" };
}

/** «Terminar mi casa» → «terminar mi casa», para «Meta: terminar mi casa» (AH-2). */
export const enMinuscula = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
