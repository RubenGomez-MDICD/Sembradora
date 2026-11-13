import { getDb } from "./base";
import { diaISO, desdeDiaISO, sumarDias } from "../fechas";
import type { Ajuste, Borrador, Categoria, Deuda, Frecuencia, Movimiento, NombreTabla, Nuevo, Registro, Tablas, TipoMovimiento } from "./tipos";

/* ------------------------------------------------------------------ */
/* Operaciones genéricas                                                 */
/* ------------------------------------------------------------------ */

export const ahora = () => new Date().toISOString();
export const nuevoId = () => crypto.randomUUID();

function tabla<K extends NombreTabla>(nombre: K) {
  return getDb().table<Tablas[K], string>(nombre);
}

export async function crear<K extends NombreTabla>(nombre: K, datos: Nuevo<Tablas[K]>): Promise<Tablas[K]> {
  const t = ahora();
  const registro = { ...datos, id: datos.id ?? nuevoId(), creado: t, actualizado: t } as Tablas[K];
  await tabla(nombre).add(registro);
  return registro;
}

export async function actualizar<K extends NombreTabla>(nombre: K, id: string, cambios: Partial<Omit<Tablas[K], keyof Registro>>) {
  const n = await tabla(nombre).update(id, { ...cambios, actualizado: ahora() } as never);
  if (n === 0) throw new Error(`No existe ${nombre}/${id}`);
}

/** Marca como borrado. Se puede deshacer con `restaurar`. */
export async function borrar(nombre: NombreTabla, id: string) {
  const t = ahora();
  await tabla(nombre).update(id, { borrado: t, actualizado: t } as never);
}

export async function restaurar(nombre: NombreTabla, id: string) {
  await getDb().transaction("rw", tabla(nombre), async () => {
    const r = await tabla(nombre).get(id);
    if (!r) return;
    const { borrado: _borrado, ...resto } = r as Registro;
    await tabla(nombre).put({ ...resto, actualizado: ahora() } as Tablas[typeof nombre]);
  });
}

export const vivos = <T extends Registro>(rs: T[]) => rs.filter((r) => !r.borrado);

export async function listar<K extends NombreTabla>(nombre: K): Promise<Tablas[K][]> {
  return vivos(await tabla(nombre).toArray()) as Tablas[K][];
}

export async function obtener<K extends NombreTabla>(nombre: K, id: string): Promise<Tablas[K] | undefined> {
  const r = await tabla(nombre).get(id);
  return r && !(r as Registro).borrado ? r : undefined;
}

/* ------------------------------------------------------------------ */
/* Movimientos y categorías (Mi dinero)                                  */
/* ------------------------------------------------------------------ */

export async function anotarMovimiento(m: { tipo: TipoMovimiento; monto: number; categoriaId: string; nota?: string; fecha?: string; deudaId?: string }) {
  if (!Number.isInteger(m.monto) || m.monto <= 0) throw new Error("El monto debe ser un número entero de centavos mayor que cero.");
  return crear("movimientos", { ...m, nota: m.nota?.trim() || undefined, fecha: m.fecha ?? ahora() });
}

export async function movimientosEntre(desde: Date, hasta: Date): Promise<Movimiento[]> {
  const rs = await getDb().movimientos.where("fecha").between(desde.toISOString(), hasta.toISOString(), true, false).toArray();
  return vivos(rs);
}

/** Categorías para elegir, en su orden. Las ocultas solo se ven si se piden. */
export async function categoriasDe(tipo: TipoMovimiento, { conOcultas = false } = {}): Promise<Categoria[]> {
  const rs = vivos(await getDb().categorias.where("tipo").equals(tipo).toArray());
  return rs.filter((c) => conOcultas || !c.oculta).sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es"));
}

/** Categoría propia (MD-3n). Queda antes de «Otro». */
export async function crearCategoria(c: { nombre: string; icono: string; tipo: TipoMovimiento }) {
  const nombre = c.nombre.trim();
  if (!nombre) throw new Error("La categoría necesita un nombre.");
  const existentes = await categoriasDe(c.tipo, { conOcultas: true });
  const repetida = existentes.find((e) => e.nombre.localeCompare(nombre, "es", { sensitivity: "base" }) === 0);
  if (repetida) return repetida;
  const orden = Math.max(0, ...existentes.filter((e) => e.orden < 99).map((e) => e.orden)) + 1;
  return crear("categorias", { nombre, icono: c.icono, tipo: c.tipo, propia: true, orden });
}

/* ------------------------------------------------------------------ */
/* Deudas                                                                */
/* ------------------------------------------------------------------ */

const DIAS_POR_FRECUENCIA: Record<Exclude<Frecuencia, "mes">, number> = { semana: 7, quincena: 15 };

/** Fecha del siguiente pago a partir de una fecha AAAA-MM-DD. */
export function siguienteFecha(dia: string, frecuencia: Frecuencia): string {
  const d = desdeDiaISO(dia);
  if (frecuencia === "mes") {
    const r = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    // Mismo día del mes siguiente, o el último si ese mes es más corto (31 → 30).
    const ultimo = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
    r.setDate(Math.min(d.getDate(), ultimo));
    return diaISO(r);
  }
  return diaISO(sumarDias(d, DIAS_POR_FRECUENCIA[frecuencia]));
}

export async function anotarDeuda(d: Nuevo<Deuda>) {
  if (!Number.isInteger(d.montoInicial) || d.montoInicial <= 0) throw new Error("El monto de la deuda debe ser mayor que cero.");
  return crear("deudas", { ...d, nombre: d.nombre.trim() });
}

/**
 * Me prestaron (MD-3p): el dinero entra como ingreso y la deuda queda en «Lo que debes».
 * Las dos cosas se guardan juntas o ninguna.
 */
export async function anotarPrestamo(p: { nombre: string; monto: number; frecuencia: Frecuencia; pagoPorPeriodo: number; primerPago?: string; nota?: string; fecha?: string }) {
  const db = getDb();
  return db.transaction("rw", db.deudas, db.movimientos, async () => {
    const deuda = await anotarDeuda({ nombre: p.nombre, tipo: "persona", montoInicial: p.monto, frecuencia: p.frecuencia, pagoPorPeriodo: p.pagoPorPeriodo, proximoPago: p.primerPago });
    const ingreso = await anotarMovimiento({ tipo: "ingreso", monto: p.monto, categoriaId: "prestamo", nota: p.nota, fecha: p.fecha, deudaId: deuda.id });
    return { deuda, ingreso };
  });
}

/** Pago de una deuda (MD-18): un gasto en «Deudas» y el próximo pago se recorre un periodo. */
export async function anotarPagoDeuda(deudaId: string, monto: number, fecha?: string) {
  const db = getDb();
  return db.transaction("rw", db.deudas, db.movimientos, async () => {
    const deuda = await obtener("deudas", deudaId);
    if (!deuda) throw new Error("No encontramos esa deuda.");
    const pago = await anotarMovimiento({ tipo: "gasto", monto, categoriaId: "deudas", deudaId, fecha, nota: deuda.nombre });
    if (deuda.proximoPago) await actualizar("deudas", deudaId, { proximoPago: siguienteFecha(deuda.proximoPago, deuda.frecuencia) });
    return pago;
  });
}

/** Lo pagado son los gastos ligados a la deuda; el préstamo recibido (ingreso) no cuenta como pago. */
export function saldoDeuda(deuda: Pick<Deuda, "id" | "montoInicial">, movimientos: Movimiento[]) {
  const pagado = vivos(movimientos)
    .filter((m) => m.deudaId === deuda.id && m.tipo === "gasto")
    .reduce((s, m) => s + m.monto, 0);
  const falta = Math.max(0, deuda.montoInicial - pagado);
  return { pagado, falta, total: deuda.montoInicial, liquidada: falta === 0 };
}

/* ------------------------------------------------------------------ */
/* Borradores de flujos y ajustes                                        */
/* ------------------------------------------------------------------ */

export async function leerBorrador(flujo: string): Promise<Record<string, unknown> | undefined> {
  return (await obtener("borradores", flujo))?.datos;
}

/** Junta los cambios con lo que ya había. Se llama al cambiar cada campo. */
export async function guardarBorrador(flujo: string, cambios: Record<string, unknown>) {
  const db = getDb();
  await db.transaction("rw", db.borradores, async () => {
    const previo = await db.borradores.get(flujo);
    const t = ahora();
    const datos = { ...(previo && !previo.borrado ? previo.datos : {}), ...cambios };
    const registro: Borrador = { id: flujo, datos, creado: previo?.creado ?? t, actualizado: t };
    await db.borradores.put(registro);
  });
}

export const descartarBorrador = (flujo: string) => borrar("borradores", flujo);

export async function leerAjuste<T>(clave: string): Promise<T | undefined> {
  return (await obtener("ajustes", clave))?.valor as T | undefined;
}

export async function guardarAjuste(clave: string, valor: unknown) {
  const previo = await getDb().ajustes.get(clave);
  const t = ahora();
  const registro: Ajuste = { id: clave, valor, creado: previo?.creado ?? t, actualizado: t };
  await getDb().ajustes.put(registro);
}
