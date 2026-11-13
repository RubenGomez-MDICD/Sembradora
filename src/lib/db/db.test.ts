import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SembradoraDB, usarDb } from "./base";
import {
  anotarDeuda,
  anotarMovimiento,
  anotarPagoDeuda,
  anotarPrestamo,
  borrar,
  categoriasDe,
  crearCategoria,
  guardarAjuste,
  guardarBorrador,
  leerAjuste,
  leerBorrador,
  listar,
  movimientosEntre,
  obtener,
  restaurar,
  saldoDeuda,
  siguienteFecha,
} from "./repositorio";
import { agruparPorDia, alcancePorDia, estadoTope, resumenSemana } from "./resumen";
import { RespaldoInvalido, exportarTodo, importar } from "./respaldo";
import type { Movimiento } from "./tipos";

let db: SembradoraDB;
let n = 0;

beforeEach(async () => {
  db = new SembradoraDB(`prueba-${++n}`);
  usarDb(db);
  await db.open();
});

afterEach(async () => {
  await db.delete();
});

/** Miércoles 14 de octubre de 2026, como en las pantallas de Figma (MD-5: «Hoy» es miércoles). */
const HOY = new Date(2026, 9, 14, 18, 0);
const en = (dia: number, hora = 12) => new Date(2026, 9, dia, hora).toISOString();

describe("categorías", () => {
  it("crea las de fábrica en el orden de Figma y esconde «Deudas»", async () => {
    const gastos = await categoriasDe("gasto");
    expect(gastos.map((c) => c.nombre)).toEqual(["Comida", "Casa", "Niños", "Transporte", "Salud", "Tandas", "Otro"]);
    const ingresos = await categoriasDe("ingreso");
    expect(ingresos.map((c) => c.nombre)).toEqual(["Pago de mi trabajo", "Tanda", "Apoyo o programa", "Me prestaron", "Otro"]);
    expect((await categoriasDe("gasto", { conOcultas: true })).some((c) => c.id === "deudas")).toBe(true);
  });

  it("una categoría propia queda antes de «Otro» y no se duplica", async () => {
    const escuela = await crearCategoria({ nombre: " Escuela ", icono: "book-open", tipo: "gasto" });
    expect(escuela.nombre).toBe("Escuela");
    const otra = await crearCategoria({ nombre: "escuela", icono: "book-open", tipo: "gasto" });
    expect(otra.id).toBe(escuela.id);
    const nombres = (await categoriasDe("gasto")).map((c) => c.nombre);
    expect(nombres.slice(-2)).toEqual(["Escuela", "Otro"]);
  });
});

describe("movimientos", () => {
  it("guarda centavos enteros y rechaza montos inválidos", async () => {
    const m = await anotarMovimiento({ tipo: "gasto", monto: 12000, categoriaId: "comida", nota: "  Tortillas y verdura " });
    expect(m.nota).toBe("Tortillas y verdura");
    await expect(anotarMovimiento({ tipo: "gasto", monto: 12.5, categoriaId: "comida" })).rejects.toThrow();
    await expect(anotarMovimiento({ tipo: "gasto", monto: 0, categoriaId: "comida" })).rejects.toThrow();
  });

  it("borrar se puede deshacer y lo borrado no aparece en las listas", async () => {
    const m = await anotarMovimiento({ tipo: "gasto", monto: 12000, categoriaId: "comida" });
    await borrar("movimientos", m.id);
    expect(await obtener("movimientos", m.id)).toBeUndefined();
    expect(await listar("movimientos")).toHaveLength(0);
    await restaurar("movimientos", m.id);
    expect((await obtener("movimientos", m.id))?.monto).toBe(12000);
  });

  it("filtra por rango de fechas", async () => {
    await anotarMovimiento({ tipo: "gasto", monto: 100, categoriaId: "comida", fecha: en(11) });
    await anotarMovimiento({ tipo: "gasto", monto: 200, categoriaId: "comida", fecha: en(13) });
    const semana = await movimientosEntre(new Date(2026, 9, 12), new Date(2026, 9, 19));
    expect(semana.map((m) => m.monto)).toEqual([200]);
  });
});

describe("resumen de la semana (MD-4 y MD-5)", () => {
  const movs = (): Movimiento[] =>
    [
      { tipo: "gasto", monto: 8500, fecha: en(12) },
      { tipo: "gasto", monto: 55000, fecha: en(13) },
      { tipo: "gasto", monto: 13800, fecha: en(14, 9) },
      { tipo: "ingreso", monto: 160000, fecha: en(14, 7) },
      { tipo: "gasto", monto: 99999, fecha: en(11) }, // domingo anterior: fuera de la semana
    ].map((m, i) => ({ ...m, id: String(i), categoriaId: i === 1 ? "casa" : "comida", creado: m.fecha, actualizado: m.fecha }) as Movimiento);

  it("suma la semana de lunes a domingo con los datos de Figma", () => {
    const r = resumenSemana(movs(), HOY);
    expect(r.gastos).toBe(77300);
    expect(r.ingresos).toBe(160000);
    expect(r.balance).toBe(82700);
    expect(r.porDia).toEqual([8500, 55000, 13800, null, null, null, null]);
    expect(r.diasTranscurridos).toBe(3);
    expect(r.porCategoria[0]).toEqual({ categoriaId: "casa", monto: 55000 });
  });

  it("balance negativo cuando se gasta de más (MD-4c)", () => {
    const r = resumenSemana([{ ...movs()[1], monto: 190000 }, { ...movs()[3], monto: 155000 }], HOY);
    expect(r.balance).toBe(-35000);
  });

  it("alcance por día y tope al 80 %", () => {
    expect(alcancePorDia(160000)).toBe(22857);
    expect(estadoTope({ montoSemanal: 100000 }, 79999).estado).toBe("bien");
    expect(estadoTope({ montoSemanal: 100000 }, 80000).estado).toBe("cerca");
    expect(estadoTope({ montoSemanal: 100000 }, 120000)).toMatchObject({ estado: "pasado", queda: 0 });
  });

  it("agrupa por día del más reciente al más viejo", () => {
    const g = agruparPorDia(movs());
    expect(g.map((x) => x.fecha.getDate())).toEqual([14, 13, 12, 11]);
    expect(g[0].items.map((m) => m.tipo)).toEqual(["gasto", "ingreso"]);
  });
});

describe("deudas (MD-3p, MD-16, MD-18)", () => {
  it("un préstamo recibido crea un ingreso y una deuda", async () => {
    const { deuda, ingreso } = await anotarPrestamo({ nombre: "Préstamo de mi hermana", monto: 100000, frecuencia: "quincena", pagoPorPeriodo: 50000, primerPago: "2026-10-31" });
    expect(ingreso).toMatchObject({ tipo: "ingreso", categoriaId: "prestamo", deudaId: deuda.id, monto: 100000 });
    expect(deuda).toMatchObject({ tipo: "persona", montoInicial: 100000 });
    // El ingreso del préstamo no cuenta como pago.
    expect(saldoDeuda(deuda, await listar("movimientos"))).toMatchObject({ pagado: 0, falta: 100000 });
  });

  it("cada pago es un gasto en «Deudas» y recorre el próximo pago", async () => {
    const deuda = await anotarDeuda({ nombre: "Refrigerador", tipo: "tienda", montoInicial: 600000, frecuencia: "semana", pagoPorPeriodo: 15000, proximoPago: "2026-10-16" });
    await anotarPagoDeuda(deuda.id, 15000);
    const movs = await listar("movimientos");
    expect(movs[0]).toMatchObject({ tipo: "gasto", categoriaId: "deudas", deudaId: deuda.id, nota: "Refrigerador" });
    expect((await obtener("deudas", deuda.id))?.proximoPago).toBe("2026-10-23");
    expect(saldoDeuda(deuda, movs)).toMatchObject({ pagado: 15000, falta: 585000, liquidada: false });
  });

  it("si un paso falla no se guarda nada a medias", async () => {
    await expect(anotarPrestamo({ nombre: "X", monto: -5, frecuencia: "mes", pagoPorPeriodo: 1 })).rejects.toThrow();
    expect(await listar("deudas")).toHaveLength(0);
    expect(await listar("movimientos")).toHaveLength(0);
  });

  it("la fecha mensual respeta meses cortos", () => {
    expect(siguienteFecha("2026-01-31", "mes")).toBe("2026-02-28");
    expect(siguienteFecha("2026-10-31", "quincena")).toBe("2026-11-15");
    expect(siguienteFecha("2026-12-28", "semana")).toBe("2027-01-04");
  });
});

describe("borradores y ajustes", () => {
  it("el avance de un flujo se junta campo por campo", async () => {
    await guardarBorrador("mi-sueldo", { tareas: ["limpieza"] });
    await guardarBorrador("mi-sueldo", { dias: 3 });
    expect(await leerBorrador("mi-sueldo")).toEqual({ tareas: ["limpieza"], dias: 3 });
  });

  it("guarda y lee ajustes", async () => {
    await guardarAjuste("ultimoRespaldo", "2026-11-12");
    expect(await leerAjuste("ultimoRespaldo")).toBe("2026-11-12");
  });
});

describe("respaldo: exportar e importar (plan, sección 5)", () => {
  it("juntar: gana el registro con el cambio más reciente, incluso un borrado", async () => {
    const a = await anotarMovimiento({ tipo: "gasto", monto: 12000, categoriaId: "comida" });
    const b = await anotarMovimiento({ tipo: "gasto", monto: 5000, categoriaId: "casa" });
    const copia = await exportarTodo();

    // Después del respaldo, en el teléfono se borra «a».
    await new Promise((r) => setTimeout(r, 5));
    await borrar("movimientos", a.id);
    // Y en el respaldo «b» tiene un cambio más nuevo.
    const bEnCopia = copia.tablas.movimientos.find((m) => m.id === b.id)!;
    bEnCopia.monto = 7000;
    bEnCopia.actualizado = new Date(Date.now() + 60_000).toISOString();

    const res = await importar(copia, "juntar");
    expect(res.actualizados).toBe(1);
    expect(await obtener("movimientos", a.id)).toBeUndefined(); // el borrado no revive
    expect((await obtener("movimientos", b.id))?.monto).toBe(7000);
  });

  it("reemplazar deja solo lo del respaldo y conserva las categorías de fábrica", async () => {
    const copia = await exportarTodo();
    copia.tablas.categorias = [];
    await anotarMovimiento({ tipo: "gasto", monto: 100, categoriaId: "comida" });
    await importar(copia, "reemplazar");
    expect(await listar("movimientos")).toHaveLength(0);
    expect((await categoriasDe("gasto")).length).toBe(7);
  });

  it("rechaza archivos que no son respaldos sin tocar la base", async () => {
    await anotarMovimiento({ tipo: "gasto", monto: 100, categoriaId: "comida" });
    await expect(importar({ hola: 1 }, "reemplazar")).rejects.toBeInstanceOf(RespaldoInvalido);
    await expect(importar({ formato: "la-sembradora/respaldo", version: 99, tablas: {} }, "juntar")).rejects.toThrow(/más nueva/);
    expect(await listar("movimientos")).toHaveLength(1);
  });
});
