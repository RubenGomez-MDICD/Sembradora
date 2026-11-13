/**
 * Valores que cambian cada año (plan técnico, sección 6).
 * Se actualizan aquí, con su fuente, sin tocar los cálculos.
 * Montos en centavos.
 */

export const SALARIO_MINIMO = {
  anio: 2026,
  /** Salario mínimo profesional de personas trabajadoras del hogar, zona general. */
  trabajoDelHogar: 34247,
  /** Salario mínimo general, zona general. Se usa como tope de la prima de antigüedad (arts. 162 y 486 LFT). */
  general: 31504,
  fuente: "CONASAMI, Resolución de salarios mínimos 2026 (DOF, diciembre de 2025). Zona general; en la Zona Libre de la Frontera Norte es de $440.87.",
} as const;

/**
 * Días de vacaciones por año cumplido (art. 76 LFT, reforma de 2023).
 * Del año 1 al 5 suben 2 días por año; después, 2 días cada 5 años.
 */
export function diasDeVacaciones(aniosCumplidos: number): number {
  const a = Math.max(1, Math.floor(aniosCumplidos));
  if (a <= 5) return 10 + 2 * a;
  return 20 + 2 * Math.ceil((a - 5) / 5);
}

export const LEY = {
  diasAguinaldo: 15, // art. 87
  primaVacacional: 0.25, // art. 80
  diasIndemnizacion: 90, // art. 50 fr. III (tres meses)
  diasPorAnioNoReinstalacion: 20, // arts. 49 fr. IV y 50 fr. II
  diasPrimaAntiguedad: 12, // art. 162
  aniosPrimaAntiguedadSiRenuncias: 15, // art. 162 fr. III
  mesesParaReclamarDespido: 2, // art. 518
} as const;

/**
 * Tabulador de Salario Digno de CACEH (2024), sueldo por día de cada categoría.
 * Fuente: CACEH, «Manual de salario justo para las personas trabajadoras del hogar, 2024».
 * El tabulador no dice cómo combinar categorías ni ajusta por horas o tamaño de casa;
 * la regla de combinación de Mi sueldo está en src/lib/calculos/sueldo.ts.
 * La categoría 1 de 2024 ($270.60) quedó abajo del mínimo de 2026: el cálculo usa el mínimo como piso.
 */
export const TABULADOR_CACEH = {
  anio: 2024,
  fuente: "CACEH, Manual de salario justo para las personas trabajadoras del hogar (2024).",
  categorias: {
    limpieza: { categoria: 1, nombre: "Limpieza general", diario: 27060 },
    lavado: { categoria: 2, nombre: "Lavado y planchado", diario: 48500 },
    cocina: { categoria: 4, nombre: "Cocina", diario: 60000 },
    jardin: { categoria: 5, nombre: "Jardinería o mascotas", diario: 80000 },
    ninos: { categoria: 6, nombre: "Cuidado de niñas y niños", diario: 85000, especializada: true },
    mayores: { categoria: 7, nombre: "Cuidado de personas mayores", diario: 85000, especializada: true },
  },
} as const;

export type Tarea = keyof typeof TABULADOR_CACEH.categorias;
