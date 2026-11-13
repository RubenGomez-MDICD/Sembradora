import type { Frecuencia, TipoMovimiento } from "@/lib/db/tipos";

/** Movimiento en curso (MD-2 y MD-3), guardado en el borrador «movimiento». */
export const FLUJO_MOVIMIENTO = "movimiento";

export type DatosMovimiento = {
  tipo?: TipoMovimiento;
  monto?: string;
  categoriaId?: string;
  nota?: string;
  /** Solo para «Me prestaron» (MD-3p). */
  quien?: string;
  pago?: string;
  frecuencia?: Frecuencia;
  primerPago?: string;
};
