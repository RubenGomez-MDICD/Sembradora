"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Text } from "@chakra-ui/react";
import { useLiveQuery } from "dexie-react-hooks";
import { Alert, DateField, RadioCardGroup, TextField } from "@/components/ds";
import { SALARIO_MINIMO } from "@/content/datos-de-ley";
import { antiguedad, sumarMeses, textoAntiguedad, type Situacion } from "@/lib/calculos/derechos";
import { getDb } from "@/lib/db";
import { useFlujo } from "@/lib/db/use-flujo";
import { diaISO } from "@/lib/fechas";
import { formatFechaLarga, formatMoney, parsePesos } from "@/lib/format";
import { FLUJO_DERECHOS, validarDatos, type DatosDerechos, type ErroresDerechos } from "../flujo";
import { Paso } from "../paso";

/** Último sueldo diario calculado en Mi sueldo, si existe (DR-1c). */
function useSueldoDeMiSueldo() {
  return useLiveQuery(async () => {
    const calculos = await getDb().calculos.where("tipo").equals("sueldo").toArray();
    const ultimo = calculos.filter((c) => !c.borrado).sort((a, b) => b.creado.localeCompare(a.creado))[0];
    const centavos = ultimo?.resultado?.sueldoDiario;
    return typeof centavos === "number" ? centavos : null;
  });
}

/** Figma: DR-1 · Tus datos, con sus estados DR-1b (menos del mínimo), DR-1c, DR-1d y DR-1e. Paso 2 de 4. */
export default function Datos() {
  const router = useRouter();
  const { datos, cambiar, estado, reintentar, terminar } = useFlujo<DatosDerechos>(FLUJO_DERECHOS);
  const [errores, setErrores] = useState<ErroresDerechos>({});
  const deMiSueldo = useSueldoDeMiSueldo();
  const prellenado = useRef(false);
  const [vinoDeMiSueldo, setVinoDeMiSueldo] = useState(false);

  // DR-1c: si no hay sueldo escrito y existe un cálculo de Mi sueldo, se usa ese.
  useEffect(() => {
    if (prellenado.current || !datos || deMiSueldo === undefined) return;
    prellenado.current = true;
    if (!datos.sueldo && deMiSueldo) {
      cambiar({ sueldo: String(deMiSueldo / 100) });
      setVinoDeMiSueldo(true);
    }
  }, [datos, deMiSueldo, cambiar]);

  const hoy = diaISO(new Date());
  const d = datos ?? {};
  const sueldo = parsePesos(d.sueldo);
  const bajoMinimo = sueldo !== null && sueldo < SALARIO_MINIMO.trabajoDelHogar;
  const salio = d.situacion === "despido" || d.situacion === "renuncia";
  const hasta = salio && d.ultimoDia ? d.ultimoDia : hoy;
  const lleva = d.inicio && d.inicio <= hasta ? textoAntiguedad(antiguedad(d.inicio, hasta)) : null;
  const limite = d.situacion === "despido" && d.ultimoDia ? sumarMeses(d.ultimoDia, 2) : null;

  const cambiarYLimpiar = (c: Partial<DatosDerechos>) => {
    cambiar(c);
    setErrores((e) => {
      const n = { ...e };
      for (const k of Object.keys(c)) delete n[k as keyof ErroresDerechos];
      return n;
    });
  };

  const calcular = async () => {
    const e = validarDatos(d, hoy);
    setErrores(e);
    if (Object.keys(e).length) {
      // Lleva el foco al primer campo con error para que se vea y se escuche.
      const primero = (["sueldo", "inicio", "situacion", "ultimoDia"] as const).find((k) => e[k]);
      document.querySelector<HTMLElement>(`[data-campo="${primero}"] input`)?.focus();
      return;
    }
    await terminar();
    router.push("/mis-derechos/resultado");
  };

  return (
    <Paso paso={2} backHref="/mis-derechos/contrato" titulo="Calcula tus prestaciones" descripcion="Con tres datos te decimos lo que te corresponde por ley." estado={estado} onReintentar={reintentar}>
      <div data-campo="sueldo">
        <TextField
          label="¿Cuánto te pagan al día?"
          prefix="$"
          inputMode="decimal"
          autoComplete="off"
          value={d.sueldo ?? ""}
          onChange={(e) => {
            setVinoDeMiSueldo(false);
            cambiarYLimpiar({ sueldo: e.target.value });
          }}
          error={errores.sueldo}
          helperText={vinoDeMiSueldo ? "Lo tomamos de tu cálculo en Mi sueldo. Puedes cambiarlo." : undefined}
        />
      </div>
      {bajoMinimo ? (
        <Alert status="warning" title="Te pagan menos del mínimo de ley">
          En {SALARIO_MINIMO.anio}, lo menos que te pueden pagar es {formatMoney(SALARIO_MINIMO.trabajoDelHogar)} al día (salario mínimo para personas trabajadoras del hogar, CONASAMI). Te mostramos tus prestaciones con el mínimo y con lo que te pagan.
        </Alert>
      ) : null}

      <div data-campo="inicio">
        <DateField label="¿Desde cuándo trabajas en esa casa?" value={d.inicio ?? ""} max={hoy} onChange={(e) => cambiarYLimpiar({ inicio: e.target.value })} error={errores.inicio} helperText={lleva ? `Llevas ${lleva}.` : undefined} />
      </div>

      <div data-campo="situacion">
        <RadioCardGroup
          label="¿Sigues trabajando ahí?"
          value={d.situacion ?? null}
          onValueChange={(e) => cambiarYLimpiar({ situacion: e.value as Situacion })}
          options={[
            { value: "sigue", label: "Sí, sigo trabajando" },
            { value: "despido", label: "Ya no, me despidieron", description: "Calculamos también tu liquidación" },
            { value: "renuncia", label: "Ya no, yo me fui", description: "Calculamos tu finiquito" },
          ]}
        />
        {errores.situacion ? (
          <Text textStyle="caption" color="feedback.error.fg" mt="1">
            {errores.situacion}
          </Text>
        ) : null}
      </div>

      {salio ? (
        <div data-campo="ultimoDia">
          <DateField label="¿Cuál fue tu último día?" value={d.ultimoDia ?? ""} min={d.inicio} max={hoy} onChange={(e) => cambiarYLimpiar({ ultimoDia: e.target.value })} error={errores.ultimoDia} />
        </div>
      ) : null}

      {d.situacion === "despido" ? (
        <Alert status="warning" title="Tienes 2 meses para reclamar">
          Cuentan desde tu último día (art. 518 LFT){limite ? `: tienes hasta el ${formatFechaLarga(limite)}` : ""}. En la PROFEDET te asesoran gratis y te acompañan en la conciliación.
        </Alert>
      ) : null}
      {d.situacion === "renuncia" ? (
        <Alert status="info" title="Aunque tú te vayas, te toca tu finiquito">
          Aguinaldo, vacaciones y prima por el tiempo que trabajaste este año, más los días que no te hayan pagado.
        </Alert>
      ) : null}

      <Button size="lg" onClick={calcular}>
        Calcular
      </Button>
    </Paso>
  );
}

