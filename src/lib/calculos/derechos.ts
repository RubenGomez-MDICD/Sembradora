import { LEY, SALARIO_MINIMO, diasDeVacaciones } from "@/content/datos-de-ley";

/**
 * Calculadora de prestaciones (Mis derechos, DR-1 a DR-2F).
 * Todo en centavos. Cada renglón se redondea a pesos cerrados y el total es la suma
 * de los renglones, para que lo que se ve siempre cuadre.
 *
 * Supuestos (se dicen en pantalla como «montos aproximados»):
 * - Las vacaciones de años anteriores ya se tomaron y se pagaron.
 * - El sueldo es el que se paga por día, sin sumar alimentos ni habitación.
 * - Si el sueldo es menor al mínimo de ley, se calcula con el mínimo (art. 85 LFT).
 */

export type Situacion = "sigue" | "despido" | "renuncia";

export type EntradaDerechos = {
  /** Centavos por día. */
  sueldoDiario: number;
  /** AAAA-MM-DD */
  inicio: string;
  situacion: Situacion;
  /** AAAA-MM-DD. Obligatorio si ya no trabaja ahí. */
  ultimoDia?: string;
  /** AAAA-MM-DD. Solo para pruebas; por omisión, hoy. */
  hoy?: string;
};

export type Renglon = { id: string; etiqueta: string; nota: string; monto: number; glosario?: string };

export type ResultadoDerechos = {
  situacion: Situacion;
  sueldoDiario: number;
  /** Sueldo con el que se calcula: el que pagan o el mínimo, el que sea mayor. */
  base: number;
  bajoMinimo: boolean;
  antiguedad: Antiguedad;
  renglones: Renglon[];
  total: number;
  /** Solo si sigue trabajando y gana menos del mínimo: lo que daría con su sueldo actual. */
  totalConSueldoActual?: number;
  /** Solo si la despidieron: último día para reclamar (art. 518). */
  limiteParaReclamar?: string;
  /** Días del año que cuentan para el aguinaldo proporcional. */
  diasDelAnio?: number;
  /** Días de vacaciones del año en curso, antes de sacar la parte proporcional. */
  diasVacacionesDelAnio?: number;
};

/* ------------------------------------------------------------------ */
/* Fechas                                                                */
/* ------------------------------------------------------------------ */

const DIA = 86_400_000;
const utc = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
/** Días entre dos fechas, contando los dos extremos. */
const diasIncluyendo = (desde: string, hasta: string) => Math.round((utc(hasta) - utc(desde)) / DIA) + 1;

function sumarAnios(s: string, n: number) {
  const [y, m, d] = s.split("-").map(Number);
  const ultimo = new Date(Date.UTC(y + n, m, 0)).getUTCDate(); // 29 de febrero → 28
  return iso(Date.UTC(y + n, m - 1, Math.min(d, ultimo)));
}

export function sumarMeses(s: string, n: number) {
  const [y, m, d] = s.split("-").map(Number);
  const ultimo = new Date(Date.UTC(y, m - 1 + n + 1, 0)).getUTCDate();
  return iso(Date.UTC(y, m - 1 + n, Math.min(d, ultimo)));
}

export type Antiguedad = { anios: number; meses: number; dias: number; /** Años con fracción de meses: 4 años y 7 meses = 4.58 */ enAnios: number };

export function antiguedad(inicio: string, hasta: string): Antiguedad {
  if (utc(hasta) < utc(inicio)) return { anios: 0, meses: 0, dias: 0, enAnios: 0 };
  let anios = 0;
  while (utc(sumarAnios(inicio, anios + 1)) <= utc(hasta)) anios++;
  const aniversario = sumarAnios(inicio, anios);
  let meses = 0;
  while (meses < 11 && utc(sumarMeses(aniversario, meses + 1)) <= utc(hasta)) meses++;
  const dias = Math.round((utc(hasta) - utc(sumarMeses(aniversario, meses))) / DIA);
  return { anios, meses, dias, enAnios: anios + meses / 12 };
}

/** «4 años y 7 meses», «1 año», «3 meses», «menos de un mes». */
export function textoAntiguedad(a: Pick<Antiguedad, "anios" | "meses">) {
  const partes = [];
  if (a.anios) partes.push(`${a.anios} ${a.anios === 1 ? "año" : "años"}`);
  if (a.meses) partes.push(`${a.meses} ${a.meses === 1 ? "mes" : "meses"}`);
  return partes.length ? partes.join(" y ") : "menos de un mes";
}

/* ------------------------------------------------------------------ */
/* Cálculo                                                               */
/* ------------------------------------------------------------------ */

const aPesos = (centavos: number) => Math.round(centavos / 100) * 100;
const hoyISO = () => {
  const d = new Date();
  return iso(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
};

export class DatosIncompletos extends Error {}

export function calcularDerechos(e: EntradaDerechos): ResultadoDerechos {
  if (!Number.isFinite(e.sueldoDiario) || e.sueldoDiario <= 0) throw new DatosIncompletos("Falta cuánto te pagan al día.");
  if (!e.inicio) throw new DatosIncompletos("Falta desde cuándo trabajas ahí.");
  const salio = e.situacion !== "sigue";
  if (salio && !e.ultimoDia) throw new DatosIncompletos("Falta tu último día.");
  const fin = salio ? e.ultimoDia! : (e.hoy ?? hoyISO());
  if (utc(fin) < utc(e.inicio)) throw new DatosIncompletos("El último día no puede ser antes del primero.");

  const minimo = SALARIO_MINIMO.trabajoDelHogar;
  const bajoMinimo = e.sueldoDiario < minimo;
  const base = Math.max(e.sueldoDiario, minimo);
  const ant = antiguedad(e.inicio, fin);
  const res: ResultadoDerechos = { situacion: e.situacion, sueldoDiario: e.sueldoDiario, base, bajoMinimo, antiguedad: ant, renglones: [], total: 0 };

  if (!salio) {
    // DR-2: lo que te toca cada año. Las vacaciones son las del último año cumplido.
    const anual = (sueldo: number) => {
      const dv = diasDeVacaciones(ant.anios);
      const vacaciones = aPesos(dv * sueldo);
      return [
        { id: "aguinaldo", etiqueta: "Aguinaldo", nota: `15 días de ${bajoMinimo ? "salario mínimo" : "sueldo"} · art. 87 LFT`, monto: aPesos(LEY.diasAguinaldo * sueldo), glosario: "aguinaldo" },
        { id: "vacaciones", etiqueta: "Vacaciones pagadas", nota: `${dv} días · art. 76 LFT`, monto: vacaciones, glosario: "vacaciones" },
        { id: "prima", etiqueta: "Prima vacacional", nota: "25 % de tus vacaciones · art. 80 LFT", monto: aPesos(LEY.primaVacacional * dv * sueldo), glosario: "prima-vacacional" },
      ];
    };
    res.renglones = anual(base);
    if (bajoMinimo) res.totalConSueldoActual = anual(e.sueldoDiario).reduce((s, r) => s + r.monto, 0);
  } else {
    // Parte proporcional del año en que termina (finiquito, DR-2F).
    const anioFin = fin.slice(0, 4);
    const desdeAguinaldo = utc(e.inicio) > utc(`${anioFin}-01-01`) ? e.inicio : `${anioFin}-01-01`;
    const diasDelAnio = diasIncluyendo(desdeAguinaldo, fin);
    const aniversario = sumarAnios(e.inicio, ant.anios);
    const diasDesdeAniversario = diasIncluyendo(aniversario, fin);
    const diasVacacionesDelAnio = diasDeVacaciones(ant.anios + 1);
    const vacaciones = aPesos((diasVacacionesDelAnio * base * diasDesdeAniversario) / 365);
    res.diasDelAnio = diasDelAnio;
    res.diasVacacionesDelAnio = diasVacacionesDelAnio;

    const finiquito: Renglon[] = [
      { id: "aguinaldo", etiqueta: "Aguinaldo de este año", nota: `Por ${diasDelAnio} días de ${anioFin} · art. 87 LFT`, monto: aPesos((LEY.diasAguinaldo * base * diasDelAnio) / 365), glosario: "aguinaldo" },
      { id: "vacaciones", etiqueta: "Vacaciones de este año", nota: `Parte de tus ${diasVacacionesDelAnio} días · art. 76 y 79 LFT`, monto: vacaciones, glosario: "vacaciones" },
      { id: "prima", etiqueta: "Prima vacacional", nota: "25 % de tus vacaciones · art. 80 LFT", monto: aPesos(LEY.primaVacacional * vacaciones), glosario: "prima-vacacional" },
    ];

    // La prima de antigüedad usa un sueldo de hasta dos salarios mínimos generales (arts. 162 y 486).
    const basePrima = Math.min(base, 2 * SALARIO_MINIMO.general);
    const primaAntiguedad: Renglon = { id: "prima-antiguedad", etiqueta: "Prima de antigüedad", nota: "12 días por año · art. 162 LFT", monto: aPesos(LEY.diasPrimaAntiguedad * ant.enAnios * basePrima), glosario: "prima-antiguedad" };

    if (e.situacion === "despido") {
      // DR-2L: liquidación. En el trabajo del hogar no se puede obligar a reinstalar (art. 49 fr. IV), por eso se suman los 20 días por año.
      res.renglones = [
        { id: "indemnizacion", etiqueta: "Indemnización de 3 meses", nota: "90 días de sueldo · art. 50 LFT", monto: aPesos(LEY.diasIndemnizacion * base), glosario: "liquidacion" },
        { id: "veinte-dias", etiqueta: "20 días por cada año", nota: "En el trabajo del hogar no te pueden obligar a volver · art. 49 y 50 LFT", monto: aPesos(LEY.diasPorAnioNoReinstalacion * ant.enAnios * base) },
        primaAntiguedad,
        ...finiquito,
      ];
      res.limiteParaReclamar = sumarMeses(fin, LEY.mesesParaReclamarDespido);
    } else {
      res.renglones = ant.anios >= LEY.aniosPrimaAntiguedadSiRenuncias ? [...finiquito, primaAntiguedad] : finiquito;
    }
  }

  res.total = res.renglones.reduce((s, r) => s + r.monto, 0);
  return res;
}
