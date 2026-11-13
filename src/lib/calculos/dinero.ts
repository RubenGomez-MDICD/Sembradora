import { inicioSemana, sumarDias } from "@/lib/fechas";
import { saldoDeuda, siguienteFecha } from "@/lib/db/repositorio";
import type { Deuda, Frecuencia, Movimiento, Tope } from "@/lib/db/tipos";

/**
 * Cálculos de Mi dinero (MD-4 a MD-18). Funciones puras sobre los registros,
 * para probarlas sin base de datos. Todo en centavos.
 */

export type Periodo = "semana" | "mes";

export type Resumen = {
  periodo: Periodo;
  desde: Date;
  hasta: Date;
  ingresos: number;
  /** Parte de los ingresos que fue dinero prestado (MD-4p). */
  prestado: number;
  gastos: number;
  balance: number;
  porCategoria: { categoriaId: string; monto: number }[];
  movimientos: Movimiento[];
};

export function rangoDe(periodo: Periodo, hoy: Date) {
  if (periodo === "semana") {
    const desde = inicioSemana(hoy);
    return { desde, hasta: sumarDias(desde, 7) };
  }
  return { desde: new Date(hoy.getFullYear(), hoy.getMonth(), 1), hasta: new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1) };
}

export function resumen(movimientos: Movimiento[], periodo: Periodo, hoy = new Date()): Resumen {
  const { desde, hasta } = rangoDe(periodo, hoy);
  const del = movimientos.filter((m) => !m.borrado && new Date(m.fecha) >= desde && new Date(m.fecha) < hasta);
  let ingresos = 0;
  let prestado = 0;
  let gastos = 0;
  const cats = new Map<string, number>();
  for (const m of del) {
    if (m.tipo === "ingreso") {
      ingresos += m.monto;
      if (m.categoriaId === "prestamo") prestado += m.monto;
    } else {
      gastos += m.monto;
      cats.set(m.categoriaId, (cats.get(m.categoriaId) ?? 0) + m.monto);
    }
  }
  const porCategoria = [...cats].map(([categoriaId, monto]) => ({ categoriaId, monto })).sort((a, b) => b.monto - a.monto);
  return { periodo, desde, hasta, ingresos, prestado, gastos, balance: ingresos - gastos, porCategoria, movimientos: del };
}

/** Qué versión del balance se muestra (MD-1, MD-4, MD-4b, MD-4c). */
export function estadoBalance(r: Pick<Resumen, "ingresos" | "gastos" | "balance">) {
  if (!r.ingresos && !r.gastos) return "vacio" as const;
  if (!r.ingresos) return "soloGastos" as const;
  if (r.balance < 0) return "deMas" as const;
  return "normal" as const;
}

/* ------------------------------------------------------------------ */
/* Deudas                                                                */
/* ------------------------------------------------------------------ */

const POR_MES: Record<Frecuencia, number> = { semana: 52 / 12, quincena: 2, mes: 1 };

/** Lo que se paga al mes en una deuda, según cada cuánto se paga. */
export const pagoAlMes = (d: Pick<Deuda, "pagoPorPeriodo" | "frecuencia">) => Math.round(d.pagoPorPeriodo * POR_MES[d.frecuencia]);

export function detalleDeuda(deuda: Deuda, movimientos: Movimiento[]) {
  const s = saldoDeuda(deuda, movimientos);
  const pagos = deuda.pagoPorPeriodo > 0 ? Math.ceil(s.falta / deuda.pagoPorPeriodo) : null;
  let termina: string | null = null;
  if (pagos && deuda.proximoPago) {
    termina = deuda.proximoPago;
    for (let i = 1; i < pagos; i++) termina = siguienteFecha(termina, deuda.frecuencia);
  }
  return { ...s, pagos, termina, proporcion: s.total > 0 ? s.pagado / s.total : 0 };
}

export function resumenDeudas(deudas: Deuda[], movimientos: Movimiento[], hoy = new Date()) {
  const activas = deudas.filter((d) => !d.borrado).map((d) => ({ deuda: d, ...detalleDeuda(d, movimientos) })).filter((d) => !d.liquidada);
  const total = activas.reduce((s, d) => s + d.falta, 0);
  const alMes = activas.reduce((s, d) => s + pagoAlMes(d.deuda), 0);
  const proximo = activas
    .filter((d) => d.deuda.proximoPago)
    .sort((a, b) => a.deuda.proximoPago!.localeCompare(b.deuda.proximoPago!))[0];
  // Lo que toca pagar esta semana: pagos con fecha de aquí al domingo.
  const { hasta } = rangoDe("semana", hoy);
  const finSemana = new Date(hasta.getTime() - 1);
  const hoyISO = isoLocal(hoy);
  const estaSemana = activas.filter((d) => d.deuda.proximoPago && d.deuda.proximoPago >= hoyISO && d.deuda.proximoPago <= isoLocal(finSemana)).reduce((s, d) => s + d.deuda.pagoPorPeriodo, 0);
  // Ingreso mensual: lo que entró en los últimos 30 días, sin contar préstamos.
  const hace30 = sumarDias(hoy, -30);
  const ingresoMes = movimientos.filter((m) => !m.borrado && m.tipo === "ingreso" && m.categoriaId !== "prestamo" && new Date(m.fecha) >= hace30 && new Date(m.fecha) <= hoy).reduce((s, m) => s + m.monto, 0);
  return { activas, total, alMes, proximo, estaSemana, ingresoMes, proporcionDelIngreso: ingresoMes > 0 ? alMes / ingresoMes : null };
}

function isoLocal(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Topes (MD-14)                                                         */
/* ------------------------------------------------------------------ */

export function avanceTope(tope: Pick<Tope, "categoriaId" | "montoSemanal">, semana: Resumen) {
  const gastado = semana.porCategoria.find((c) => c.categoriaId === tope.categoriaId)?.monto ?? 0;
  const proporcion = tope.montoSemanal > 0 ? gastado / tope.montoSemanal : 0;
  return { gastado, proporcion, estado: proporcion >= 1 ? ("pasado" as const) : proporcion >= 0.8 ? ("cerca" as const) : ("bien" as const), diferencia: gastado - tope.montoSemanal };
}

/* ------------------------------------------------------------------ */
/* Ideas (MD-13)                                                         */
/* ------------------------------------------------------------------ */

const CHICO = 10000; // gastos de menos de $100

export function ideas(semana: Resumen) {
  const mayor = semana.porCategoria[0] ?? null;
  // Aparta primero: 5 % de lo que entró, redondeado hacia abajo a múltiplos de $50.
  const ingresosPropios = semana.ingresos - semana.prestado;
  const apartar = Math.floor((ingresosPropios * 0.05) / 5000) * 5000;
  // Gastos chicos: la categoría que más suma en pagos de menos de $100.
  const chicos = new Map<string, number>();
  for (const m of semana.movimientos) if (m.tipo === "gasto" && m.monto < CHICO && m.categoriaId !== "deudas") chicos.set(m.categoriaId, (chicos.get(m.categoriaId) ?? 0) + m.monto);
  const [chicoCat, chicoMonto] = [...chicos].sort((a, b) => b[1] - a[1])[0] ?? [null, 0];
  const tanda = semana.porCategoria.find((c) => c.categoriaId === "tandas")?.monto ?? 0;
  return {
    hayDatos: semana.gastos > 0,
    mayor: mayor ? { ...mayor, proporcion: mayor.monto / semana.gastos } : null,
    apartar: apartar > 0 ? { monto: apartar, de: ingresosPropios } : null,
    chicos: chicoCat ? { categoriaId: chicoCat, monto: chicoMonto, alMes: Math.round((chicoMonto * 4.3) / 1000) * 1000 } : null,
    tanda: tanda || null,
  };
}
