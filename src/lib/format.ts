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
