import { describe, expect, it } from "vitest";
import type { Movimiento, Tanda } from "@/lib/db/tipos";
import { avanceDeMeta, cobroDeTanda, crecimiento, gastoSemanalPromedio, metaDeEmergencias, mitadDelPlazo, periodosEnPlazo, planDeAhorro, textoPlazo } from "./ahorro";

describe("plan de ahorro (AH-2 y AH-3)", () => {
  it("$30,000 en 1 año, cada semana: $577 en 52 semanas", () => {
    expect(planDeAhorro(3_000_000, 1, "anios", "semana")).toEqual({ periodos: 52, aporte: 57700, frecuencia: "semana" });
  });

  it("convierte plazos entre semanas y meses", () => {
    expect(periodosEnPlazo(18, "meses", "mes")).toBe(18);
    expect(periodosEnPlazo(6, "meses", "semana")).toBe(26);
    expect(periodosEnPlazo(2, "anios", "mes")).toBe(24);
    expect(periodosEnPlazo(10, "semanas", "mes")).toBe(2);
    expect(periodosEnPlazo(0, "meses", "mes")).toBe(0);
  });

  it("el aporte se redondea hacia arriba para llegar a la meta", () => {
    const p = planDeAhorro(1_000_000, 3, "meses", "mes");
    expect(p.aporte).toBe(333400);
    expect(p.aporte * p.periodos).toBeGreaterThanOrEqual(1_000_000);
  });

  it("textos de plazo", () => {
    expect(mitadDelPlazo(1, "anios")).toBe("6 meses");
    expect(mitadDelPlazo(2, "anios")).toBe("1 año");
    expect(mitadDelPlazo(18, "meses")).toBe("9 meses");
    expect(mitadDelPlazo(3, "meses")).toBe("7 semanas");
    expect(textoPlazo(1, "anios")).toBe("1 año");
    expect(textoPlazo(18, "meses")).toBe("18 meses");
  });

  it("la gráfica crece hasta la meta en 12 barras", () => {
    const p = planDeAhorro(3_000_000, 1, "anios", "semana");
    const c = crecimiento(p, 3_000_000);
    expect(c).toHaveLength(12);
    expect(c[0].acumulado).toBe(57700);
    expect(c[11]).toEqual({ periodo: 52, acumulado: 3_000_000 });
    expect(c.every((x, i) => i === 0 || x.acumulado >= c[i - 1].acumulado)).toBe(true);
  });
});

describe("tandas (AH-5)", () => {
  it("10 personas de $500, número 7, desde el 20 de octubre: $5,000 el 1 de diciembre", () => {
    expect(cobroDeTanda({ monto: 50000, personas: 10, turno: 7, frecuencia: "semana", inicio: "2026-10-20" })).toEqual({ bolsa: 500000, fecha: "2026-12-01", ronda: 7 });
  });

  it("por quincena y por mes", () => {
    expect(cobroDeTanda({ monto: 1, personas: 1, turno: 3, frecuencia: "quincena", inicio: "2026-10-01" }).fecha).toBe("2026-10-31");
    expect(cobroDeTanda({ monto: 1, personas: 1, turno: 2, frecuencia: "mes", inicio: "2026-01-31" }).fecha).toBe("2026-02-28");
  });
});

describe("avance de la meta (AH-0 y AH-6)", () => {
  const meta = { montoObjetivo: 3_000_000, plazo: 1, unidad: "anios" as const, frecuenciaAporte: "semana" as const, inicio: "2026-09-15", aportado: 288500 };
  const tanda = { monto: 50000, personas: 10, turno: 7, frecuencia: "semana", inicio: "2026-10-20" } as Tanda;

  it("$2,885 de $30,000 después de 5 semanas: va bien", () => {
    const a = avanceDeMeta(meta, [], "2026-10-20");
    expect(a.llevas).toBe(288500);
    expect(Math.round(a.proporcion * 100)).toBe(10);
    expect(a.periodosPasados).toBe(5);
    expect(a.alDia).toBe(true);
  });

  it("la tanda se anuncia antes de su fecha y se suma después", () => {
    expect(avanceDeMeta(meta, [tanda], "2026-11-13")).toMatchObject({ llevas: 288500, proximaTanda: { bolsa: 500000, fecha: "2026-12-01" } });
    expect(avanceDeMeta(meta, [tanda], "2026-12-01").llevas).toBe(788500);
  });

  it("si se atrasa, dice cuánto falta para ir al día", () => {
    const a = avanceDeMeta({ ...meta, aportado: 100000 }, [], "2026-10-20");
    expect(a.alDia).toBe(false);
    expect(a.faltaParaAlDia).toBe(5 * 57700 - 100000);
  });
});

describe("para emergencias (AH-8)", () => {
  const gasto = (dia: number, monto: number) => ({ id: String(dia), tipo: "gasto", monto, categoriaId: "comida", fecha: new Date(2026, 9, dia, 12).toISOString(), creado: "", actualizado: "" }) as Movimiento;

  it("$1,900 por semana × 4.3 = $8,170", () => {
    expect(metaDeEmergencias(190000)).toBe(817000);
  });

  it("promedia las semanas completas con gastos y no cuenta la semana en curso", () => {
    const hoy = new Date(2026, 9, 28); // miércoles
    const movs = [gasto(19, 150000), gasto(21, 50000), gasto(13, 180000), gasto(27, 99999)];
    expect(gastoSemanalPromedio(movs, hoy)).toBe(190000);
    expect(gastoSemanalPromedio([], hoy)).toBeNull();
  });
});
