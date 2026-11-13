"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { HandCoins, PiggyBank, Scale, Wallet, type LucideIcon } from "lucide-react";
import { LinkCard } from "@/components/ds";
import { getDb } from "@/lib/db";
import { validarDatos, type DatosDerechos } from "@/app/mis-derechos/flujo";
import type { DatosSueldo } from "@/app/mi-sueldo/flujo";
import type { DatosMeta } from "@/app/mis-ahorros/flujo";
import type { DatosMovimiento } from "@/app/mi-dinero/anotar/flujo";

type Pendiente = { href: string; titulo: string; descripcion: string; icon: LucideIcon; actualizado: string };
const faltan = (n: number) => (n === 1 ? "Te falta 1 paso" : `Te faltan ${n} pasos`);

/** Qué paso sigue en cada flujo según lo que ya se guardó. `null` si no hay nada a medias. */
function pendienteDe(flujo: string, d: Record<string, unknown>, actualizado: string, sueldoGuardadoDespues: boolean): Pendiente | null {
  if (flujo === "mi-sueldo") {
    const s = d as DatosSueldo;
    if (!s.tareas?.length) return null;
    if (s.pago && sueldoGuardadoDespues) return null;
    const paso = !s.dias ? 2 : !s.horas ? 3 : !s.pago ? 4 : 5;
    const href = ["", "/mi-sueldo/tareas", "/mi-sueldo/frecuencia", "/mi-sueldo/jornada", "/mi-sueldo/pago", "/mi-sueldo/resultado"][paso];
    return { href, titulo: `Mi sueldo · Paso ${paso} de 5`, descripcion: paso === 5 ? "Ya casi: mira qué puedes hacer con tu resultado." : `${faltan(5 - paso + 1)} para saber cuánto te toca.`, icon: HandCoins, actualizado };
  }
  if (flujo === "mis-derechos") {
    const x = d as DatosDerechos;
    if (!x.contrato) return null;
    const errores = validarDatos(x);
    if (!Object.keys(errores).length) return null;
    return { href: "/mis-derechos/datos", titulo: "Mis derechos · Paso 2 de 4", descripcion: `${faltan(3)} para saber lo que te toca por ley.`, icon: Scale, actualizado };
  }
  if (flujo === "mis-ahorros") {
    const m = d as DatosMeta;
    if (!m.clase) return null;
    const paso = !m.monto || !m.plazo ? 2 : 3;
    return { href: paso === 2 ? "/mis-ahorros/plazo" : "/mis-ahorros/plan", titulo: `Mis ahorros · Paso ${paso} de 3`, descripcion: paso === 3 ? "Tu plan ya está listo: guárdalo." : "Te falta decir cuánto necesitas y para cuándo.", icon: PiggyBank, actualizado };
  }
  if (flujo === "movimiento") {
    const m = d as DatosMovimiento;
    if (!m.monto) return null;
    return { href: "/mi-dinero/anotar/categoria", titulo: "Mi dinero · Paso 2 de 3", descripcion: `Te falta decir ${m.tipo === "ingreso" ? "de dónde vino" : "en qué fue"} para guardarlo.`, icon: Wallet, actualizado };
  }
  return null;
}

/**
 * «Continúa donde te quedaste» (IN-1): el flujo a medias más reciente.
 * No aparece si no hay nada pendiente.
 */
export function Continuar() {
  const p = useLiveQuery(async () => {
    const db = getDb();
    const [borradores, calculos] = await Promise.all([db.borradores.toArray(), db.calculos.where("tipo").equals("sueldo").toArray()]);
    const ultimoSueldo = calculos.filter((c) => !c.borrado).map((c) => c.creado).sort().pop() ?? "";
    const lista = borradores
      .filter((b) => !b.borrado)
      .map((b) => pendienteDe(b.id, b.datos, b.actualizado, ultimoSueldo >= b.actualizado))
      .filter((x): x is Pendiente => Boolean(x))
      .sort((a, b) => b.actualizado.localeCompare(a.actualizado));
    return lista[0] ?? null;
  });
  if (!p) return null;
  return <LinkCard href={p.href} icon={p.icon} eyebrow="Continúa donde te quedaste" title={p.titulo} description={p.descripcion} />;
}
