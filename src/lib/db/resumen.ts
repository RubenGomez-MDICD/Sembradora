import { indiceDia, inicioSemana, sumarDias } from "../fechas";
import type { Movimiento, Tope } from "./tipos";

/**
 * Resúmenes de Mi dinero. Son funciones puras sobre listas de movimientos,
 * para probarlas sin base de datos y reutilizarlas en las pantallas.
 */

export type ResumenSemana = {
  desde: Date;
  hasta: Date;
  ingresos: number;
  gastos: number;
  /** Ingresos menos gastos. Negativo cuando se gastó de más (MD-4c). */
  balance: number;
  /** Gasto por día, de lunes a domingo. `null` en los días que todavía no llegan. */
  porDia: (number | null)[];
  porCategoria: { categoriaId: string; monto: number }[];
  diasTranscurridos: number;
};

export function resumenSemana(movimientos: Movimiento[], hoy: Date = new Date()): ResumenSemana {
  const desde = inicioSemana(hoy);
  const hasta = sumarDias(desde, 7);
  const deLaSemana = movimientos.filter((m) => {
    if (m.borrado) return false;
    const f = new Date(m.fecha);
    return f >= desde && f < hasta;
  });
  const hoyIdx = indiceDia(hoy);
  const porDia: (number | null)[] = Array.from({ length: 7 }, (_, i) => (i <= hoyIdx ? 0 : null));
  const cats = new Map<string, number>();
  let ingresos = 0;
  let gastos = 0;
  for (const m of deLaSemana) {
    if (m.tipo === "ingreso") {
      ingresos += m.monto;
      continue;
    }
    gastos += m.monto;
    const i = indiceDia(new Date(m.fecha));
    porDia[i] = (porDia[i] ?? 0) + m.monto;
    cats.set(m.categoriaId, (cats.get(m.categoriaId) ?? 0) + m.monto);
  }
  const porCategoria = [...cats].map(([categoriaId, monto]) => ({ categoriaId, monto })).sort((a, b) => b.monto - a.monto);
  return { desde, hasta, ingresos, gastos, balance: ingresos - gastos, porDia, porCategoria, diasTranscurridos: hoyIdx + 1 };
}

/** Lo que alcanza por día con lo que entró en la semana (línea punteada de MD-5). Centavos enteros. */
export const alcancePorDia = (ingresos: number) => Math.floor(ingresos / 7);

/** Avance de un tope semanal (MD-14). Avisa al llegar al 80 %. */
export function estadoTope(tope: Pick<Tope, "montoSemanal">, gastado: number) {
  const proporcion = tope.montoSemanal > 0 ? gastado / tope.montoSemanal : 0;
  return {
    gastado,
    queda: Math.max(0, tope.montoSemanal - gastado),
    proporcion,
    estado: proporcion >= 1 ? ("pasado" as const) : proporcion >= 0.8 ? ("cerca" as const) : ("bien" as const),
  };
}

/** Movimientos agrupados por día, del más reciente al más viejo (MD-5). */
export function agruparPorDia(movimientos: Movimiento[]) {
  const grupos = new Map<string, Movimiento[]>();
  const ordenados = movimientos.filter((m) => !m.borrado).sort((a, b) => b.fecha.localeCompare(a.fecha));
  for (const m of ordenados) {
    const d = new Date(m.fecha);
    const clave = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave)!.push(m);
  }
  return [...grupos.values()].map((items) => ({ fecha: new Date(items[0].fecha), items }));
}
