import { SALARIO_MINIMO, TABULADOR_CACEH, type Tarea } from "@/content/datos-de-ley";

/**
 * Mi sueldo (MS-1 a MS-5). Regla decidida el 13 de noviembre de 2026:
 *
 * 1. Cada día trabajado se paga con la categoría de CACEH más alta entre las tareas de ese día.
 * 2. Como no sabemos qué días hace cada tarea, las más especializadas ocupan primero sus días
 *    (supuesto favorable a la trabajadora). Los días que queden se pagan con el mínimo de ley.
 * 3. Ningún día vale menos que el salario mínimo de trabajo del hogar.
 * 4. Jornada de 8 horas. Con menos horas, la parte proporcional. Las horas extra se pagan al doble
 *    hasta 9 a la semana y al triple las que pasen de 9 (arts. 67 y 68 LFT).
 *
 * El tamaño de la casa y el número de personas no cambian el monto: el tabulador no los considera.
 * Todo en centavos.
 */

export type EntradaSueldo = {
  /** Días que va a la casa por semana (1 a 7). */
  dias: number;
  /** Días por semana de cada tarea marcada. */
  tareas: Partial<Record<Tarea, number>>;
  /** Horas por día. */
  horas: number;
};

export type Tramo = { tarea: Tarea | "minimo"; nombre: string; categoria?: number; especializada?: boolean; dias: number; diario: number; subtotal: number };

export type ResultadoSueldo = {
  /** Lo que te toca por día, en pesos cerrados (promedio de la semana, con horas). */
  porDia: number;
  porSemana: number;
  tramos: Tramo[];
  /** Ajuste por horas en la semana: negativo si son menos de 8, positivo por horas extra. */
  ajusteHoras: number;
  horasExtraSemana: number;
  dias: number;
  horas: number;
};

const JORNADA = 8;
const aPesos = (c: number) => Math.round(c / 100) * 100;

export function calcularSueldo(e: EntradaSueldo): ResultadoSueldo {
  const dias = Math.min(7, Math.max(1, Math.round(e.dias)));
  const minimo = SALARIO_MINIMO.trabajoDelHogar;
  const marcadas = (Object.entries(e.tareas) as [Tarea, number][])
    .filter(([, d]) => d > 0)
    .map(([t, d]) => ({ t, d: Math.min(dias, Math.round(d)), info: TABULADOR_CACEH.categorias[t] }))
    .sort((a, b) => b.info.diario - a.info.diario || a.info.categoria - b.info.categoria);

  const tramos: Tramo[] = [];
  let quedan = dias;
  for (const m of marcadas) {
    if (!quedan) break;
    const d = Math.min(m.d, quedan);
    const diario = Math.max(minimo, m.info.diario);
    tramos.push({ tarea: m.t, nombre: m.info.nombre, categoria: m.info.categoria, especializada: "especializada" in m.info ? m.info.especializada : undefined, dias: d, diario, subtotal: d * diario });
    quedan -= d;
  }
  if (quedan) tramos.push({ tarea: "minimo", nombre: "Otros días (mínimo de ley)", dias: quedan, diario: minimo, subtotal: quedan * minimo });

  const base = tramos.reduce((s, t) => s + t.subtotal, 0);
  const horas = Math.max(1, e.horas);
  let ajusteHoras = 0;
  let horasExtraSemana = 0;
  if (horas < JORNADA) {
    ajusteHoras = Math.round(base * (horas / JORNADA)) - base;
  } else if (horas > JORNADA) {
    horasExtraSemana = (horas - JORNADA) * dias;
    const porHora = base / dias / JORNADA;
    const dobles = Math.min(9, horasExtraSemana);
    const triples = horasExtraSemana - dobles;
    ajusteHoras = Math.round(porHora * (2 * dobles + 3 * triples));
  }
  const semana = base + ajusteHoras;
  return { porDia: aPesos(semana / dias), porSemana: aPesos(semana), tramos, ajusteHoras, horasExtraSemana, dias, horas };
}

export type Comparacion = { teToca: number; tePagan: number; diferencia: number; porcentajeMenos: number; justo: boolean; bajoMinimo: boolean };

/** MS-3: lo que te pagan contra lo que te toca, por día. */
export function comparar(teToca: number, tePagan: number): Comparacion {
  const diferencia = tePagan - teToca;
  return {
    teToca,
    tePagan,
    diferencia,
    porcentajeMenos: diferencia < 0 ? Math.round((-diferencia / teToca) * 100) : 0,
    justo: diferencia >= 0,
    bajoMinimo: tePagan < SALARIO_MINIMO.trabajoDelHogar,
  };
}
