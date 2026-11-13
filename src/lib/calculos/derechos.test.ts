import { describe, expect, it } from "vitest";
import { diasDeVacaciones } from "@/content/datos-de-ley";
import { DatosIncompletos, antiguedad, calcularDerechos, textoAntiguedad } from "./derechos";

/** Casos de las pantallas de Figma: $450 al día desde el 1 de marzo de 2022. */
const BASE = { sueldoDiario: 45000, inicio: "2022-03-01" };
const montos = (r: ReturnType<typeof calcularDerechos>) => Object.fromEntries(r.renglones.map((x) => [x.id, x.monto / 100]));

describe("antigüedad", () => {
  it("4 años y 7 meses al 15 de octubre de 2026 (DR-1)", () => {
    const a = antiguedad("2022-03-01", "2026-10-15");
    expect(a).toMatchObject({ anios: 4, meses: 7, dias: 14 });
    expect(a.enAnios).toBeCloseTo(4.5833, 4);
    expect(textoAntiguedad(a)).toBe("4 años y 7 meses");
  });

  it("textos cortos", () => {
    expect(textoAntiguedad({ anios: 1, meses: 0 })).toBe("1 año");
    expect(textoAntiguedad({ anios: 0, meses: 1 })).toBe("1 mes");
    expect(textoAntiguedad({ anios: 0, meses: 0 })).toBe("menos de un mes");
  });

  it("29 de febrero cumple años el 28", () => {
    expect(antiguedad("2024-02-29", "2025-02-28").anios).toBe(1);
  });
});

describe("vacaciones por año (art. 76)", () => {
  it("sigue la tabla de la reforma de 2023", () => {
    expect([1, 2, 3, 4, 5, 6, 10, 11, 15, 16].map(diasDeVacaciones)).toEqual([12, 14, 16, 18, 20, 22, 22, 24, 24, 26]);
    expect(diasDeVacaciones(0)).toBe(12);
  });
});

describe("sigue trabajando (DR-2 y DR-2b)", () => {
  it("$450 al día y 4 años: $16,875 al año", () => {
    const r = calcularDerechos({ ...BASE, situacion: "sigue", hoy: "2026-10-15" });
    expect(montos(r)).toEqual({ aguinaldo: 6750, vacaciones: 8100, prima: 2025 });
    expect(r.total / 100).toBe(16875);
    expect(r.bajoMinimo).toBe(false);
  });

  it("$300 al día: se calcula con el mínimo ($12,842) y se dice lo de su sueldo ($11,250)", () => {
    const r = calcularDerechos({ ...BASE, sueldoDiario: 30000, situacion: "sigue", hoy: "2026-10-15" });
    expect(r.bajoMinimo).toBe(true);
    expect(montos(r)).toEqual({ aguinaldo: 5137, vacaciones: 6164, prima: 1541 });
    expect(r.total / 100).toBe(12842);
    expect(r.totalConSueldoActual! / 100).toBe(11250);
    expect(r.renglones[0].nota).toContain("salario mínimo");
  });

  it("en el primer año usa 12 días de vacaciones", () => {
    const r = calcularDerechos({ ...BASE, inicio: "2026-05-01", situacion: "sigue", hoy: "2026-10-15" });
    expect(r.renglones[1].nota).toBe("12 días · art. 76 LFT");
  });
});

describe("me despidieron (DR-2L)", () => {
  const r = calcularDerechos({ ...BASE, situacion: "despido", ultimoDia: "2026-10-15" });

  it("liquidación con los renglones de Figma", () => {
    expect(montos(r)).toMatchObject({ indemnizacion: 40500, "veinte-dias": 41250, "prima-antiguedad": 24750, aguinaldo: 5326 });
    expect(r.diasDelAnio).toBe(288);
    expect(r.diasVacacionesDelAnio).toBe(20);
  });

  it("vacaciones del año: 229 días desde el aniversario del 1 de marzo, contando los dos extremos", () => {
    // Figma usa 228 días ($5,622); aquí se cuenta también el último día, igual que en el aguinaldo.
    expect(montos(r).vacaciones).toBe(5647);
    expect(montos(r).prima).toBe(1412);
  });

  it("el total es la suma de los renglones y hay 2 meses para reclamar", () => {
    expect(r.total).toBe(r.renglones.reduce((s, x) => s + x.monto, 0));
    expect(r.limiteParaReclamar).toBe("2026-12-15");
  });

  it("la prima de antigüedad usa como tope dos salarios mínimos generales", () => {
    const alto = calcularDerechos({ ...BASE, sueldoDiario: 100000, situacion: "despido", ultimoDia: "2026-10-15" });
    // 12 × 4.5833 × (2 × $315.04)
    expect(montos(alto)["prima-antiguedad"]).toBe(Math.round(12 * (4 + 7 / 12) * 630.08));
  });
});

describe("yo me fui (DR-2F)", () => {
  it("finiquito sin prima de antigüedad antes de 15 años", () => {
    const r = calcularDerechos({ ...BASE, situacion: "renuncia", ultimoDia: "2026-10-15" });
    expect(Object.keys(montos(r))).toEqual(["aguinaldo", "vacaciones", "prima"]);
    expect(r.limiteParaReclamar).toBeUndefined();
  });

  it("con 15 años o más se suma la prima de antigüedad", () => {
    const r = calcularDerechos({ ...BASE, inicio: "2010-01-01", situacion: "renuncia", ultimoDia: "2026-10-15" });
    expect(r.renglones.some((x) => x.id === "prima-antiguedad")).toBe(true);
  });

  it("si empezó este año, el aguinaldo cuenta desde su primer día", () => {
    const r = calcularDerechos({ ...BASE, inicio: "2026-10-01", situacion: "renuncia", ultimoDia: "2026-10-15" });
    expect(r.diasDelAnio).toBe(15);
  });
});

describe("datos incompletos", () => {
  it("avisa qué falta", () => {
    expect(() => calcularDerechos({ ...BASE, sueldoDiario: 0, situacion: "sigue" })).toThrow(DatosIncompletos);
    expect(() => calcularDerechos({ ...BASE, situacion: "despido" })).toThrow(/último día/);
    expect(() => calcularDerechos({ ...BASE, situacion: "renuncia", ultimoDia: "2021-01-01" })).toThrow(/antes/);
  });
});
