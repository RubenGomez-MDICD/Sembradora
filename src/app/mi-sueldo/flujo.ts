import { TABULADOR_CACEH, type Tarea } from "@/content/datos-de-ley";
import { calcularSueldo, type ResultadoSueldo } from "@/lib/calculos/sueldo";
import { formatMoney, parsePesos } from "@/lib/format";

/** Avance de Mi sueldo (MS-1 a MS-3), guardado en el borrador «mi-sueldo». */
export const FLUJO_SUELDO = "mi-sueldo";

export type DatosSueldo = {
  tareas?: Tarea[];
  dias?: string;
  /** Días por semana de cada tarea. */
  frecuencia?: Partial<Record<Tarea, string>>;
  horas?: string;
  pagoModo?: "dia" | "semana";
  pago?: string;
};

/** Tareas de MS-1, en el orden de Figma, con su descripción. */
export const TAREAS: { value: Tarea; label: string; description: string }[] = [
  { value: "limpieza", label: "Limpieza general", description: "Barrer, trapear, sacudir, tender camas y lavar baños." },
  { value: "cocina", label: "Cocina", description: "Preparación de alimentos." },
  { value: "lavado", label: "Lavado y planchado", description: "Lavar, tender, doblar y planchar ropa." },
  { value: "ninos", label: "Cuidado de niñas y niños", description: "Bañarlos, darles de comer, llevarlos a la escuela o cuidarlos. Cuenta como especializada." },
  { value: "mayores", label: "Cuidado de personas mayores", description: "Acompañar, dar medicinas o ayudar a moverse. Cuenta como especializada." },
  { value: "jardin", label: "Jardinería o mascotas", description: "Regar, podar, pasear o bañar mascotas." },
];

export const nombreTarea = (t: Tarea) => TAREAS.find((x) => x.value === t)?.label ?? TABULADOR_CACEH.categorias[t].nombre;

/** Calcula con lo que haya en el borrador; `null` si falta algo. */
export function resultadoDe(d: DatosSueldo): ResultadoSueldo | null {
  const dias = Number(d.dias);
  const horas = Number(d.horas ?? 8);
  if (!d.tareas?.length || !(dias >= 1) || !(horas >= 1)) return null;
  const tareas: Partial<Record<Tarea, number>> = {};
  for (const t of d.tareas) tareas[t] = Number(d.frecuencia?.[t] ?? dias);
  return calcularSueldo({ dias, horas, tareas });
}

/** Lo que le pagan hoy, por día. */
export function pagoPorDia(d: DatosSueldo): number | null {
  const p = parsePesos(d.pago);
  const dias = Number(d.dias);
  if (!p || !(dias >= 1)) return null;
  return d.pagoModo === "semana" ? Math.round(p / dias) : p;
}

/** «5 días a la semana», «1 día a la semana». */
export const textoDias = (n: number) => `${n} ${n === 1 ? "día" : "días"} a la semana`;

export function textoTarifa(r: ResultadoSueldo) {
  const lineas = [
    `Mi tarifa por día: ${formatMoney(r.porDia)}`,
    `${r.horas} horas al día, ${textoDias(r.dias)} · ${formatMoney(r.porSemana)} a la semana`,
    "",
    ...r.tramos.map((t) => `• ${t.dias} ${t.dias === 1 ? "día" : "días"} de ${t.nombre}${t.categoria ? ` (categoría ${t.categoria} de CACEH)` : ""}: ${formatMoney(t.diario)} al día`),
    r.ajusteHoras ? `• Ajuste por horas: ${formatMoney(r.ajusteHoras, { sign: "always" })} a la semana` : "",
    "",
    "Cálculo con el Tabulador de Salario Digno de CACEH (2024) y la Ley Federal del Trabajo, en La sembradora.",
  ];
  return lineas.filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n").trim();
}
