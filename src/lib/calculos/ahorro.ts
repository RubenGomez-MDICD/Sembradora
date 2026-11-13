import type { Frecuencia, Meta, Movimiento, Tanda, UnidadPlazo } from "@/lib/db/tipos";

/**
 * Cálculos de Mis ahorros (AH-2 a AH-8). Todo en centavos.
 * Los aportes se redondean hacia arriba a pesos cerrados para que la meta se alcance.
 */

export type FrecuenciaAporte = Extract<Frecuencia, "semana" | "mes">;

const SEMANAS_POR_MES = 52 / 12;

/** Cuántos aportes caben en el plazo. 1 año = 52 semanas o 12 meses (AH-3). */
export function periodosEnPlazo(plazo: number, unidad: UnidadPlazo, frecuencia: FrecuenciaAporte): number {
  if (!(plazo > 0)) return 0;
  const semanas = unidad === "semanas" ? plazo : unidad === "meses" ? plazo * SEMANAS_POR_MES : plazo * 52;
  const meses = unidad === "anios" ? plazo * 12 : unidad === "meses" ? plazo : plazo / SEMANAS_POR_MES;
  return Math.max(1, Math.round(frecuencia === "semana" ? semanas : meses));
}

export type Plan = { periodos: number; aporte: number; frecuencia: FrecuenciaAporte };

export function planDeAhorro(monto: number, plazo: number, unidad: UnidadPlazo, frecuencia: FrecuenciaAporte): Plan {
  const periodos = periodosEnPlazo(plazo, unidad, frecuencia);
  const aporte = periodos ? Math.ceil(monto / periodos / 100) * 100 : 0;
  return { periodos, aporte, frecuencia };
}

/** «1 año», «18 meses», «2 años», «10 semanas». */
export function textoPlazo(plazo: number, unidad: UnidadPlazo) {
  const n = plazo;
  if (unidad === "anios") return `${n} ${n === 1 ? "año" : "años"}`;
  if (unidad === "meses") return `${n} ${n === 1 ? "mes" : "meses"}`;
  return `${n} ${n === 1 ? "semana" : "semanas"}`;
}

/** La mitad del plazo, para la etiqueta del centro de la gráfica: 1 año → «6 meses». */
export function mitadDelPlazo(plazo: number, unidad: UnidadPlazo) {
  if (unidad === "anios") {
    const meses = plazo * 6;
    return meses % 12 === 0 ? textoPlazo(meses / 12, "anios") : textoPlazo(meses, "meses");
  }
  if (unidad === "meses") return plazo % 2 === 0 ? textoPlazo(plazo / 2, "meses") : textoPlazo(Math.round((plazo * 52) / 24), "semanas");
  return textoPlazo(Math.round(plazo / 2), "semanas");
}

export const textoPeriodos = (n: number, f: FrecuenciaAporte) => (f === "semana" ? `${n} ${n === 1 ? "semana" : "semanas"}` : `${n} ${n === 1 ? "mes" : "meses"}`);

/**
 * Puntos para la gráfica «Así crece tu ahorro» (AH-3): lo acumulado al final de
 * cada tramo, hasta 12 barras. El primero es «Hoy» (un aporte).
 */
export function crecimiento(plan: Plan, monto: number, barras = 12) {
  const n = Math.min(barras, plan.periodos);
  return Array.from({ length: n }, (_, i) => {
    const periodo = Math.max(1, Math.round(((i + 1) * plan.periodos) / n));
    return { periodo, acumulado: Math.min(monto, i === 0 ? plan.aporte : periodo * plan.aporte) };
  });
}

/* ------------------------------------------------------------------ */
/* Tandas (AH-5)                                                         */
/* ------------------------------------------------------------------ */

function sumarPeriodos(dia: string, n: number, f: Frecuencia) {
  const [y, m, d] = dia.split("-").map(Number);
  if (f === "mes") {
    const ultimo = new Date(Date.UTC(y, m - 1 + n + 1, 0)).getUTCDate();
    return new Date(Date.UTC(y, m - 1 + n, Math.min(d, ultimo))).toISOString().slice(0, 10);
  }
  return new Date(Date.UTC(y, m - 1, d + n * (f === "semana" ? 7 : 15))).toISOString().slice(0, 10);
}

/** Cuánto recibes (todas las personas, tú incluida) y cuándo, según tu número. */
export function cobroDeTanda(t: Pick<Tanda, "monto" | "personas" | "turno" | "frecuencia" | "inicio">) {
  return { bolsa: t.monto * t.personas, fecha: sumarPeriodos(t.inicio, t.turno - 1, t.frecuencia), ronda: t.turno };
}

/* ------------------------------------------------------------------ */
/* Avance de una meta (AH-0 y AH-6)                                      */
/* ------------------------------------------------------------------ */

const DIA = 86_400_000;
const utc = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

export function avanceDeMeta(meta: Pick<Meta, "montoObjetivo" | "plazo" | "unidad" | "frecuenciaAporte" | "inicio" | "aportado">, tandas: Tanda[], hoy: string) {
  const frecuencia = meta.frecuenciaAporte === "mes" ? "mes" : "semana";
  const plan = planDeAhorro(meta.montoObjetivo, meta.plazo, meta.unidad, frecuencia);
  const cobradas = tandas.map(cobroDeTanda);
  const deTandas = cobradas.filter((c) => c.fecha <= hoy).reduce((s, c) => s + c.bolsa, 0);
  const proxima = cobradas.filter((c) => c.fecha > hoy).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  const llevas = Math.min(meta.montoObjetivo, meta.aportado + deTandas);
  const dias = Math.max(0, Math.floor((utc(hoy) - utc(meta.inicio)) / DIA));
  const periodosPasados = Math.min(plan.periodos, frecuencia === "semana" ? Math.floor(dias / 7) : Math.floor(dias / (365 / 12)));
  const esperado = Math.min(meta.montoObjetivo, periodosPasados * plan.aporte);
  return {
    plan,
    llevas,
    proporcion: meta.montoObjetivo > 0 ? llevas / meta.montoObjetivo : 0,
    periodosPasados,
    alDia: llevas >= esperado,
    faltaParaAlDia: Math.max(0, esperado - llevas),
    completa: llevas >= meta.montoObjetivo,
    proximaTanda: proxima,
  };
}

/* ------------------------------------------------------------------ */
/* Para emergencias (AH-8)                                               */
/* ------------------------------------------------------------------ */

export const SEMANAS_EN_UN_MES = 4.3;

/**
 * Gasto semanal promedio de las últimas 4 semanas completas con gastos anotados.
 * `null` si no hay gastos para calcularlo.
 */
export function gastoSemanalPromedio(movimientos: Movimiento[], hoy: Date): number | null {
  const lunes = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - ((hoy.getDay() + 6) % 7));
  const semanas: number[] = [];
  for (let i = 1; i <= 4; i++) {
    const desde = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() - 7 * i);
    const hasta = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + 7);
    const total = movimientos.filter((m) => !m.borrado && m.tipo === "gasto" && new Date(m.fecha) >= desde && new Date(m.fecha) < hasta).reduce((s, m) => s + m.monto, 0);
    if (total > 0) semanas.push(total);
  }
  if (!semanas.length) return null;
  return Math.round(semanas.reduce((s, x) => s + x, 0) / semanas.length);
}

/** Un mes de gastos, redondeado a pesos: $1,900 × 4.3 = $8,170. */
export const metaDeEmergencias = (gastoSemanal: number) => Math.round((gastoSemanal * SEMANAS_EN_UN_MES) / 100) * 100;
