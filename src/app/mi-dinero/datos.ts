"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getDb, vivos } from "@/lib/db";
import type { Categoria, Deuda, TipoDeuda } from "@/lib/db/tipos";
import { formatFechaCorta, formatMoney } from "@/lib/format";
import { icono } from "@/lib/iconos";

/** Todas las categorías (también las propias y la oculta «Deudas»), por id. */
export function useCategoriasMapa() {
  return useLiveQuery(async () => new Map(vivos(await getDb().categorias.toArray()).map((c) => [c.id, c] as const)));
}

export const nombreCategoria = (mapa: Map<string, Categoria> | undefined, id: string) => mapa?.get(id)?.nombre ?? "Otro";
export const iconoCategoria = (mapa: Map<string, Categoria> | undefined, id: string) => icono(mapa?.get(id)?.icono);

/** Tipos de deuda de MD-16, con su ícono y descripción. */
export const TIPOS_DEUDA: { value: TipoDeuda; label: string; description: string; icono: string }[] = [
  { value: "tarjeta", label: "Tarjeta de crédito", description: "Del banco o de una tienda departamental.", icono: "credit-card" },
  { value: "persona", label: "Préstamo de una persona", description: "Familia, amistades o tus patrones.", icono: "handshake" },
  { value: "tienda", label: "Crédito en tienda o abonos", description: "Muebles, celular o aparatos que pagas por semana.", icono: "store" },
  { value: "banco", label: "Préstamo de banco, financiera o app", description: "Con contrato y con intereses.", icono: "landmark" },
  { value: "empeno", label: "Empeño", description: "Dejaste algo a cambio de dinero.", icono: "gem" },
];

export const tipoDeuda = (t: TipoDeuda) => TIPOS_DEUDA.find((x) => x.value === t)!;

/** Subtítulo de una deuda: «Tarjeta de crédito · CAT de 85 %», «Préstamo de una persona · sin intereses». */
export function subtituloDeuda(d: Pick<Deuda, "tipo" | "interes">) {
  const base = d.tipo === "tienda" ? "Crédito en tienda, en abonos" : tipoDeuda(d.tipo).label;
  if (d.interes) return `${base} · CAT de ${d.interes} %`;
  return d.tipo === "persona" ? `${base} · sin intereses` : base;
}

export const FRECUENCIAS = [
  { value: "semana", label: "Cada semana" },
  { value: "quincena", label: "Cada quincena" },
  { value: "mes", label: "Cada mes" },
] as const;

export const textoFrecuencia = (f: string) => FRECUENCIAS.find((x) => x.value === f)?.label.toLowerCase() ?? "";

const hora = new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit" });
export const formatHora = (iso: string) => hora.format(new Date(iso));

const diaLargo = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric" });
/** «Hoy», «Ayer», «Lunes 12». */
export function nombreDia(fecha: Date, hoy = new Date()) {
  const a = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()).getTime();
  const b = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
  const dif = Math.round((b - a) / 86_400_000);
  if (dif === 0) return "Hoy";
  if (dif === 1) return "Ayer";
  const s = diaLargo.format(fecha);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Texto del próximo pago en cada tarjeta, según el tipo de deuda. */
export function textoProximo(d: Deuda) {
  if (!d.proximoPago) return `${formatMoney(d.pagoPorPeriodo)} cada vez`;
  const f = formatFechaCorta(d.proximoPago);
  if (d.tipo === "tarjeta") return `Pago mínimo: ${formatMoney(d.pagoPorPeriodo)} el ${f}`;
  if (d.tipo === "tienda") return `Abono de ${formatMoney(d.pagoPorPeriodo)} el ${f}`;
  return `${formatMoney(d.pagoPorPeriodo)} el ${f}`;
}

