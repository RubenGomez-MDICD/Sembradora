"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { crear, getDb } from "@/lib/db";
import type { ResultadoSueldo } from "@/lib/calculos/sueldo";
import type { DatosSueldo } from "./flujo";

/** Último cálculo guardado de Mi sueldo. */
export function useUltimoCalculo() {
  return useLiveQuery(async () => {
    const cs = (await getDb().calculos.where("tipo").equals("sueldo").toArray()).filter((c) => !c.borrado);
    return cs.sort((a, b) => b.creado.localeCompare(a.creado))[0] ?? null;
  });
}


/**
 * Guarda el cálculo de Mi sueldo. `resultado.sueldoDiario` es lo que Mis derechos
 * usa para llenar «¿Cuánto te pagan al día?» (DR-1c).
 */
export function guardarCalculo(entrada: DatosSueldo, r: ResultadoSueldo, pagoDiario: number | null) {
  return crear("calculos", { tipo: "sueldo", entrada: { ...entrada }, resultado: { sueldoDiario: r.porDia, porSemana: r.porSemana, dias: r.dias, horas: r.horas, tramos: r.tramos, ajusteHoras: r.ajusteHoras, pagoDiario } });
}
