import Dexie, { type EntityTable } from "dexie";
import type { Ajuste, Borrador, Calculo, Categoria, Deuda, Meta, Movimiento, Tanda, Tope } from "./tipos";

/** Categorías de fábrica (Figma MD-3 y MD-3i). Sus `id` son fijos para que los respaldos se junten sin duplicarlas. */
const FABRICA = "2026-01-01T00:00:00.000Z";
const cat = (id: string, nombre: string, icono: string, tipo: Categoria["tipo"], orden: number, oculta?: boolean): Categoria => ({
  id,
  nombre,
  icono,
  tipo,
  orden,
  propia: false,
  ...(oculta ? { oculta } : {}),
  creado: FABRICA,
  actualizado: FABRICA,
});

export const CATEGORIAS_DE_FABRICA: Categoria[] = [
  cat("comida", "Comida", "utensils", "gasto", 1),
  cat("casa", "Casa", "house", "gasto", 2),
  cat("ninos", "Niños", "baby", "gasto", 3),
  cat("transporte", "Transporte", "bus", "gasto", 4),
  cat("salud", "Salud", "heart-pulse", "gasto", 5),
  cat("tandas", "Tandas", "users", "gasto", 6),
  cat("otro-gasto", "Otro", "ellipsis", "gasto", 99),
  // Se usa sola al anotar el pago de una deuda (MD-18); no aparece entre las opciones.
  cat("deudas", "Deudas", "credit-card", "gasto", 100, true),
  cat("pago-trabajo", "Pago de mi trabajo", "hand-coins", "ingreso", 1),
  cat("tanda", "Tanda", "users", "ingreso", 2),
  cat("apoyo", "Apoyo o programa", "sprout", "ingreso", 3),
  cat("prestamo", "Me prestaron", "wallet", "ingreso", 4),
  cat("otro-ingreso", "Otro", "ellipsis", "ingreso", 99),
];

export class SembradoraDB extends Dexie {
  movimientos!: EntityTable<Movimiento, "id">;
  categorias!: EntityTable<Categoria, "id">;
  deudas!: EntityTable<Deuda, "id">;
  metas!: EntityTable<Meta, "id">;
  tandas!: EntityTable<Tanda, "id">;
  topes!: EntityTable<Tope, "id">;
  calculos!: EntityTable<Calculo, "id">;
  borradores!: EntityTable<Borrador, "id">;
  ajustes!: EntityTable<Ajuste, "id">;

  constructor(nombre = "sembradora") {
    super(nombre);
    // Solo se indexan los campos que se usan para buscar u ordenar.
    this.version(1).stores({
      movimientos: "id, fecha, tipo, categoriaId, deudaId",
      categorias: "id, tipo, orden",
      deudas: "id",
      metas: "id",
      tandas: "id, metaId",
      topes: "id, &categoriaId",
      calculos: "id, tipo, creado",
      borradores: "id",
      ajustes: "id",
    });
    this.on("populate", (tx) => {
      tx.table("categorias").bulkAdd(CATEGORIAS_DE_FABRICA);
    });
  }
}

let instancia: SembradoraDB | null = null;

/** Base del teléfono. Se crea al primer uso, nunca en el servidor. */
export function getDb(): SembradoraDB {
  if (typeof indexedDB === "undefined") throw new Error("El guardado solo funciona en el navegador.");
  instancia ??= new SembradoraDB();
  return instancia;
}

/** Solo para pruebas: usa otra base con nombre propio. */
export function usarDb(db: SembradoraDB) {
  instancia = db;
}
