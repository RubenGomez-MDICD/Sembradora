/**
 * Modelo de datos guardado en el teléfono (plan técnico, sección 4).
 *
 * Reglas comunes a todas las tablas:
 * - `id` es un UUID creado en el teléfono, para poder juntar respaldos sin choques.
 * - `creado` y `actualizado` son fechas ISO. Al juntar dos respaldos gana el registro
 *   con `actualizado` más reciente.
 * - `borrado` marca un registro como borrado sin quitarlo de la base. Así «Deshacer»
 *   lo puede regresar y un respaldo viejo no revive lo que se borró después.
 * - Los montos son centavos enteros.
 */

export type Registro = {
  id: string;
  creado: string;
  actualizado: string;
  borrado?: string;
};

export type TipoMovimiento = "gasto" | "ingreso";

export type Movimiento = Registro & {
  tipo: TipoMovimiento;
  /** Centavos, siempre positivo. El tipo dice si suma o resta. */
  monto: number;
  categoriaId: string;
  nota?: string;
  /** Fecha y hora ISO del movimiento (puede ser distinta de `creado`). */
  fecha: string;
  /** Si es el pago de una deuda (gasto) o el dinero de un préstamo (ingreso). */
  deudaId?: string;
};

export type Categoria = Registro & {
  nombre: string;
  /** Clave del ícono en src/lib/iconos.ts. */
  icono: string;
  tipo: TipoMovimiento;
  /** Creada por la persona (MD-3n). Las de fábrica tienen `propia: false`. */
  propia: boolean;
  /** No aparece entre las opciones (por ejemplo, «Deudas», que se usa sola al anotar un pago). */
  oculta?: boolean;
  orden: number;
};

export type TipoDeuda = "tarjeta" | "persona" | "tienda" | "banco" | "empeno";
export type Frecuencia = "semana" | "quincena" | "mes";

export type Deuda = Registro & {
  nombre: string;
  tipo: TipoDeuda;
  /** Lo que se debía al anotarla, en centavos. */
  montoInicial: number;
  frecuencia: Frecuencia;
  pagoPorPeriodo: number;
  /** Día del próximo pago, AAAA-MM-DD. */
  proximoPago?: string;
  /** Costo extra anual en porcentaje (CAT), si se sabe. */
  interes?: number;
};

export type UnidadPlazo = "semanas" | "meses";

export type Meta = Registro & {
  nombre: string;
  icono: string;
  montoObjetivo: number;
  plazo: number;
  unidad: UnidadPlazo;
  frecuenciaAporte: Frecuencia;
  /** Día en que empieza el plan, AAAA-MM-DD. */
  inicio: string;
};

export type Tanda = Registro & {
  /** Lo que se aporta cada vez, en centavos. */
  monto: number;
  frecuencia: Frecuencia;
  personas: number;
  /** Número que te toca (1 es la primera en recibir). */
  turno: number;
  inicio: string;
  metaId?: string;
};

export type Tope = Registro & {
  categoriaId: string;
  montoSemanal: number;
};

export type TipoCalculo = "sueldo" | "derechos";

export type Calculo = Registro & {
  tipo: TipoCalculo;
  entrada: Record<string, unknown>;
  resultado: Record<string, unknown>;
};

/**
 * Avance de un flujo de varios pasos (Mi sueldo, Mis derechos, Mis ahorros).
 * Se guarda al cambiar cada campo para poder retomarlo. Su `id` es el nombre del flujo.
 */
export type Borrador = Registro & {
  datos: Record<string, unknown>;
};

/** Preferencias sueltas. Su `id` es la clave (por ejemplo «pin» o «ultimoRespaldo»). */
export type Ajuste = Registro & {
  valor: unknown;
};

export type Tablas = {
  movimientos: Movimiento;
  categorias: Categoria;
  deudas: Deuda;
  metas: Meta;
  tandas: Tanda;
  topes: Tope;
  calculos: Calculo;
  borradores: Borrador;
  ajustes: Ajuste;
};

export type NombreTabla = keyof Tablas;

export const TABLAS: NombreTabla[] = ["movimientos", "categorias", "deudas", "metas", "tandas", "topes", "calculos", "borradores", "ajustes"];

/** Lo que no hace falta escribir al crear: lo pone el repositorio. */
export type Nuevo<T extends Registro> = Omit<T, keyof Registro> & Partial<Pick<T, "id">>;
