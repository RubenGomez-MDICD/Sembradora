/**
 * Fechas en hora local del teléfono. La semana empieza en lunes, como en
 * las gráficas de Mi dinero (Lun … Dom).
 */

export const DIAS_CORTOS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

/** Lunes de la semana de `d`, a las 00:00 locales. */
export function inicioSemana(d: Date): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dia = (r.getDay() + 6) % 7; // lunes = 0
  r.setDate(r.getDate() - dia);
  return r;
}

export function sumarDias(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Índice del día en la semana: lunes 0 … domingo 6. */
export const indiceDia = (d: Date) => (d.getDay() + 6) % 7;

/** AAAA-MM-DD en hora local (no en UTC, que cambiaría el día por la noche). */
export function diaISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dd}`;
}

/** Lee AAAA-MM-DD como fecha local. */
export function desdeDiaISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export const mismoDia = (a: Date, b: Date) => diaISO(a) === diaISO(b);
