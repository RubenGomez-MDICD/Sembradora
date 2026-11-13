import { describe, expect, it } from "vitest";
import type { Deuda, Movimiento } from "@/lib/db/tipos";
import { avanceTope, detalleDeuda, estadoBalance, ideas, pagoAlMes, resumen, resumenDeudas } from "./dinero";

const HOY = new Date(2026, 9, 14, 18); // miércoles 14 de octubre de 2026
let n = 0;
const mov = (tipo: "gasto" | "ingreso", monto: number, categoriaId: string, dia = 14, extra: Partial<Movimiento> = {}): Movimiento => {
  const fecha = new Date(2026, 9, dia, 12).toISOString();
  return { id: String(++n), tipo, monto, categoriaId, fecha, creado: fecha, actualizado: fecha, ...extra };
};

/** La semana de Figma (MD-4): entraron $3,150 y se gastaron $1,900. */
const semanaFigma = () => [
  mov("ingreso", 160000, "pago-trabajo"),
  mov("ingreso", 155000, "pago-trabajo", 12),
  mov("gasto", 85000, "comida", 13),
  mov("gasto", 40000, "casa", 13),
  mov("gasto", 30000, "ninos", 12),
  mov("gasto", 1800, "transporte", 12),
  mov("gasto", 1800, "transporte", 13),
  mov("gasto", 16400, "transporte", 14),
  mov("gasto", 15000, "tandas", 14),
];

describe("balance (MD-4, MD-4b, MD-4c, MD-4p)", () => {
  it("te queda $1,250 de $3,150 con $1,900 en gastos", () => {
    const r = resumen(semanaFigma(), "semana", HOY);
    expect(r).toMatchObject({ ingresos: 315000, gastos: 190000, balance: 125000 });
    expect(r.porCategoria[0]).toEqual({ categoriaId: "comida", monto: 85000 });
    expect(estadoBalance(r)).toBe("normal");
  });

  it("estados: vacío, solo gastos y gastaste de más", () => {
    expect(estadoBalance({ ingresos: 0, gastos: 0, balance: 0 })).toBe("vacio");
    expect(estadoBalance({ ingresos: 0, gastos: 190000, balance: -190000 })).toBe("soloGastos");
    expect(estadoBalance({ ingresos: 155000, gastos: 190000, balance: -35000 })).toBe("deMas");
  });

  it("separa lo prestado de lo que entró", () => {
    const r = resumen([...semanaFigma(), mov("ingreso", 100000, "prestamo")], "semana", HOY);
    expect(r).toMatchObject({ ingresos: 415000, prestado: 100000, balance: 225000 });
  });

  it("el mes cuenta desde el día 1", () => {
    const r = resumen([mov("gasto", 100, "comida", 1), mov("gasto", 100, "comida", 14), mov("gasto", 999, "comida", 30, { fecha: new Date(2026, 8, 30).toISOString() })], "mes", HOY);
    expect(r.gastos).toBe(200);
  });
});

describe("deudas (MD-15 a MD-18)", () => {
  const hermana: Deuda = { id: "h", nombre: "Préstamo de mi hermana", tipo: "persona", montoInicial: 300000, frecuencia: "quincena", pagoPorPeriodo: 50000, proximoPago: "2026-10-31", creado: "", actualizado: "" };

  it("con $1,500 pagados de $3,000 faltan 3 pagos y terminas el 30 de noviembre", () => {
    const pagos = [mov("gasto", 150000, "deudas", 1, { deudaId: "h" })];
    expect(detalleDeuda(hermana, pagos)).toMatchObject({ pagado: 150000, falta: 150000, pagos: 3, termina: "2026-11-30", proporcion: 0.5 });
  });

  it("lo que pagas al mes y su proporción de lo que te entra", () => {
    expect(pagoAlMes({ pagoPorPeriodo: 15000, frecuencia: "semana" })).toBe(65000);
    const r = resumenDeudas([hermana], [mov("ingreso", 1000000, "pago-trabajo", 10)], HOY);
    expect(r.alMes).toBe(100000);
    expect(r.proporcionDelIngreso).toBeCloseTo(0.1);
    expect(r.total).toBe(300000);
  });

  it("lo que toca pagar esta semana y la próxima fecha", () => {
    const refri: Deuda = { ...hermana, id: "r", nombre: "Refrigerador", tipo: "tienda", frecuencia: "semana", pagoPorPeriodo: 15000, proximoPago: "2026-10-16" };
    const r = resumenDeudas([hermana, refri], [], HOY);
    expect(r.estaSemana).toBe(15000);
    expect(r.proximo?.deuda.id).toBe("r");
  });

  it("las deudas liquidadas no cuentan", () => {
    const r = resumenDeudas([hermana], [mov("gasto", 300000, "deudas", 1, { deudaId: "h" })], HOY);
    expect(r.activas).toHaveLength(0);
  });
});

describe("tope (MD-14) e ideas (MD-13)", () => {
  it("comida $850 contra un tope de $700: te pasaste por $150", () => {
    const r = resumen(semanaFigma(), "semana", HOY);
    expect(avanceTope({ categoriaId: "comida", montoSemanal: 70000 }, r)).toMatchObject({ estado: "pasado", diferencia: 15000 });
    expect(avanceTope({ categoriaId: "comida", montoSemanal: 100000 }, r).estado).toBe("cerca");
  });

  it("ideas con las cifras de la semana", () => {
    const i = ideas(resumen(semanaFigma(), "semana", HOY));
    expect(i.mayor).toMatchObject({ categoriaId: "comida", monto: 85000 });
    expect(Math.round(i.mayor!.proporcion * 100)).toBe(45);
    expect(i.apartar).toEqual({ monto: 15000, de: 315000 });
    expect(i.chicos).toMatchObject({ categoriaId: "transporte", monto: 3600 });
    expect(i.tanda).toBe(15000);
  });

  it("sin datos no hay cifras", () => {
    expect(ideas(resumen([], "semana", HOY))).toMatchObject({ hayDatos: false, mayor: null, apartar: null, chicos: null });
  });
});
