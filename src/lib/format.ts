/**
 * Formato de dinero y fechas para México.
 * Los montos se guardan en centavos enteros (plan técnico, sección 4).
 * Se muestran sin decimales cuando son pesos cerrados: «$1,250»; con decimales si los hay: «$342.47».
 */
const pesos = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", currencyDisplay: "narrowSymbol", minimumFractionDigits: 0, maximumFractionDigits: 0 });
const pesosConCentavos = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", currencyDisplay: "narrowSymbol", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatMoney(cents: number, opts: { sign?: "auto" | "always" | "never" } = {}) {
  const abs = Math.abs(cents);
  const text = abs % 100 === 0 ? pesos.format(abs / 100) : pesosConCentavos.format(abs / 100);
  const sign = opts.sign ?? "auto";
  if (sign === "never") return text;
  if (cents < 0) return `-${text}`;
  if (sign === "always" && cents > 0) return `+${text}`;
  return text;
}

const fechaCorta = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long" });
export const formatDay = (d: Date) => fechaCorta.format(d);

/** Porcentaje entero para mostrar, sin perder el valor exacto que usa la barra. */
export const percent = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

/**
 * Lee lo que la persona escribe como pesos y lo pasa a centavos.
 * Acepta «1,500», «1500.50», «$ 450» y «450,5» (coma decimal). Vacío o inválido → null.
 */
export function parsePesos(texto: string | undefined | null): number | null {
  if (!texto) return null;
  let s = String(texto).replace(/[$\s]/g, "");
  // «1,500» y «1,500.50»: la coma separa miles. «450,5»: la coma es decimal.
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, "");
  else s = s.replace(",", ".");
  if (!/^\d+(\.\d{0,2})?$/.test(s)) return null;
  const centavos = Math.round(Number(s) * 100);
  return Number.isFinite(centavos) ? centavos : null;
}

const fechaLarga = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const fechaSinAnio = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", timeZone: "UTC" });
const utcDeISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
/** «2026-10-15» → «15 de octubre de 2026». */
export const formatFechaLarga = (dia: string) => fechaLarga.format(utcDeISO(dia));
/** «2026-10-15» → «15 de octubre». */
export const formatFechaCorta = (dia: string) => fechaSinAnio.format(utcDeISO(dia));
