import { formatFechaLarga, formatMoney, parsePesos } from "@/lib/format";

/** Datos de «Arma tu contrato» (DR-5a), guardados en el borrador «contrato». */
export const FLUJO_CONTRATO = "contrato";

export type DatosContrato = {
  trabajadora?: string;
  patron?: string;
  direccion?: string;
  inicio?: string;
  tareas?: string;
  sueldo?: string;
  frecuenciaPago?: string;
  horario?: string;
  descanso?: string;
  dormir?: "no" | "si";
};

export const TAREAS = [
  { value: "limpieza", label: "Limpieza de la casa", clausula: "limpieza de la casa" },
  { value: "limpieza-alimentos", label: "Limpieza y alimentos", clausula: "limpieza y preparación de alimentos" },
  { value: "limpieza-alimentos-ninos", label: "Limpieza, alimentos y cuidado de niñas y niños", clausula: "limpieza, preparación de alimentos y cuidado de niñas y niños" },
  { value: "ninos", label: "Cuidado de niñas y niños", clausula: "cuidado de niñas y niños" },
  { value: "personas", label: "Cuidado de personas mayores o enfermas", clausula: "cuidado de personas mayores o enfermas" },
];

export const FRECUENCIAS_PAGO = [
  { value: "semana", label: "Cada semana" },
  { value: "quincena", label: "Cada quincena" },
  { value: "mes", label: "Cada mes" },
];

export const DESCANSOS = [
  { value: "sab-dom", label: "Sábado y domingo" },
  { value: "dom-sab-tarde", label: "Domingo y sábado por la tarde" },
  { value: "dom-lun-manana", label: "Domingo y lunes por la mañana" },
];

export const DORMIR = [
  { value: "no", label: "No, entro y salgo cada día" },
  { value: "si", label: "Sí, vivo en la casa donde trabajo" },
];

const RAYA = "______________________";
const o = (s: string | undefined) => (s && s.trim() ? s.trim() : RAYA);
const etiqueta = (lista: { value: string; label: string }[], v?: string) => lista.find((x) => x.value === v)?.label;

/**
 * Cláusulas del contrato (DR-5b), con base en el art. 331 Ter LFT y el modelo de CACEH.
 * Lo que falte queda con raya para llenarlo a mano.
 */
export function clausulas(d: DatosContrato) {
  const sueldo = parsePesos(d.sueldo);
  const tareas = TAREAS.find((t) => t.value === d.tareas)?.clausula;
  const frecuencia = etiqueta(FRECUENCIAS_PAGO, d.frecuenciaPago)?.toLowerCase();
  const descanso = etiqueta(DESCANSOS, d.descanso)?.toLowerCase();
  const vive = d.dormir === "si";
  const lista = [
    `Lugar de trabajo: ${o(d.direccion)}.`,
    `Inicio: ${d.inicio ? formatFechaLarga(d.inicio) : RAYA}, por tiempo indeterminado.`,
    `Trabajo: ${tareas ?? RAYA}.`,
    `Sueldo: ${sueldo ? formatMoney(sueldo) : RAYA} al día, pagados ${frecuencia ?? RAYA}.`,
    `Horario: ${o(d.horario)}. Descanso: ${descanso ? descanso.charAt(0).toUpperCase() + descanso.slice(1) : RAYA}.`,
    "Vacaciones pagadas según la ley, con prima del 25 %, y aguinaldo de 15 días por año.",
    "Inscripción al IMSS desde el primer día, a cargo de la persona empleadora.",
    vive
      ? "Habitación digna e higiénica y alimentos de la misma calidad que los de la casa. Descanso nocturno de 9 horas seguidas y 3 horas de descanso durante el día (art. 333 LFT). Herramientas y uniforme a cargo de la persona empleadora."
      : "Alimentos durante la jornada, de la misma calidad que los de la casa. Herramientas y uniforme a cargo de la persona empleadora.",
    "Terminación conforme a la Ley Federal del Trabajo.",
  ];
  return {
    entre: `Entre ${o(d.patron)} (persona empleadora) y ${o(d.trabajadora)} (persona trabajadora del hogar).`,
    lista,
  };
}

export function contratoComoTexto(d: DatosContrato) {
  const c = clausulas(d);
  return ["CONTRATO DE TRABAJO DEL HOGAR", "", c.entre, "", ...c.lista.map((l, i) => `${i + 1}. ${l}`), "", "Con base en el artículo 331 Ter de la LFT y el modelo de contrato de CACEH."].join("\n");
}
