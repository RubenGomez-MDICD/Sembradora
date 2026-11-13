import { describe, expect, it } from "vitest";
import { calcularSueldo, comparar } from "./sueldo";

const pesos = (c: number) => c / 100;

describe("Mi sueldo: la tarea más especializada de cada día", () => {
  it("caso de Figma (limpieza 5, cocina 3, niñas y niños 5; 5 días, 8 horas): $850 al día", () => {
    const r = calcularSueldo({ dias: 5, horas: 8, tareas: { limpieza: 5, cocina: 3, ninos: 5 } });
    expect(pesos(r.porDia)).toBe(850);
    expect(pesos(r.porSemana)).toBe(4250);
    expect(r.tramos).toEqual([expect.objectContaining({ tarea: "ninos", dias: 5, diario: 85000, categoria: 6, especializada: true })]);
  });

  it("las tareas mejor pagadas ocupan primero sus días y la limpieza nunca baja del mínimo", () => {
    const r = calcularSueldo({ dias: 5, horas: 8, tareas: { limpieza: 5, cocina: 2 } });
    expect(r.tramos.map((t) => [t.tarea, t.dias, pesos(t.diario)])).toEqual([
      ["cocina", 2, 600],
      ["limpieza", 3, 342.47],
    ]);
    expect(pesos(r.porSemana)).toBe(Math.round(1200 + 3 * 342.47));
    expect(pesos(r.porDia)).toBe(Math.round((1200 + 3 * 342.47) / 5));
  });

  it("si las tareas no cubren todos los días, los demás van al mínimo", () => {
    const r = calcularSueldo({ dias: 3, horas: 8, tareas: { ninos: 1 } });
    expect(r.tramos.map((t) => [t.tarea, t.dias])).toEqual([
      ["ninos", 1],
      ["minimo", 2],
    ]);
  });

  it("con menos de 8 horas se paga la parte proporcional", () => {
    const r = calcularSueldo({ dias: 1, horas: 4, tareas: { cocina: 1 } });
    expect(pesos(r.porDia)).toBe(300);
  });

  it("horas extra: al doble hasta 9 a la semana y al triple después (arts. 67 y 68)", () => {
    // 6 días de 10 horas: 12 horas extra; $600 al día = $75 la hora.
    const r = calcularSueldo({ dias: 6, horas: 10, tareas: { cocina: 6 } });
    expect(r.horasExtraSemana).toBe(12);
    expect(pesos(r.ajusteHoras)).toBe(75 * (2 * 9 + 3 * 3));
  });

  it("una tarea marcada con más días de los que va se recorta", () => {
    const r = calcularSueldo({ dias: 2, horas: 8, tareas: { lavado: 5 } });
    expect(r.tramos[0].dias).toBe(2);
  });
});

describe("comparación (MS-3)", () => {
  it("$450 contra $725: te faltan $275, 38 % menos", () => {
    expect(comparar(72500, 45000)).toMatchObject({ diferencia: -27500, porcentajeMenos: 38, justo: false });
  });

  it("$750 contra $725: dentro de lo justo", () => {
    expect(comparar(72500, 75000)).toMatchObject({ justo: true, porcentajeMenos: 0, bajoMinimo: false });
  });

  it("avisa si le pagan menos del mínimo de ley", () => {
    expect(comparar(85000, 30000).bajoMinimo).toBe(true);
  });
});
