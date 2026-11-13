"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading, Stack } from "@chakra-ui/react";
import { AppHeader } from "@/components/app-header";
import { DateField, SaveStatus, SelectField, TextField } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import { SALARIO_MINIMO } from "@/content/datos-de-ley";
import { useBorrador } from "@/lib/db/hooks";
import { useFlujo } from "@/lib/db/use-flujo";
import { formatMoney, parsePesos } from "@/lib/format";
import { FLUJO_DERECHOS, type DatosDerechos } from "../../flujo";
import { DESCANSOS, DORMIR, FLUJO_CONTRATO, FRECUENCIAS_PAGO, TAREAS, type DatosContrato } from "../contrato";

const conVacia = (opciones: { value: string; label: string }[]) => [{ value: "", label: "Elige una opción" }, ...opciones];

/** Figma: DR-5a · Arma tu contrato */
export default function ArmarContrato() {
  const router = useRouter();
  const { datos, cambiar, estado, reintentar, terminar } = useFlujo<DatosContrato>(FLUJO_CONTRATO);
  const derechos = useBorrador(FLUJO_DERECHOS) as DatosDerechos | undefined;
  const prellenado = useRef(false);

  // «Llenamos lo que ya sabemos»: inicio y sueldo de la calculadora, si no se han escrito aquí.
  useEffect(() => {
    if (prellenado.current || !datos || !derechos) return;
    prellenado.current = true;
    const c: Partial<DatosContrato> = {};
    if (!datos.inicio && derechos.inicio) c.inicio = derechos.inicio;
    if (!datos.sueldo && derechos.sueldo) c.sueldo = derechos.sueldo;
    if (Object.keys(c).length) cambiar(c);
  }, [datos, derechos, cambiar]);

  const d = datos ?? {};
  const sueldo = parsePesos(d.sueldo);
  const bajo = sueldo !== null && sueldo < SALARIO_MINIMO.trabajoDelHogar;
  const minimo = `Lo menos por ley en ${SALARIO_MINIMO.anio}: ${formatMoney(SALARIO_MINIMO.trabajoDelHogar)}.`;
  const campo = (k: keyof DatosContrato) => ({
    value: (d[k] as string | undefined) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => cambiar({ [k]: e.target.value } as Partial<DatosContrato>),
  });

  return (
    <>
      <AppHeader type="back" title="Mis derechos" meta="Tu contrato" backHref="/mis-derechos/contrato" />
      <Screen>
        <PageTitle title="Arma tu contrato">Llenamos lo que ya sabemos. Revisa, cambia lo que haga falta y descárgalo para firmarlo con tus patrones.</PageTitle>

        <Stack as="fieldset" gap="4">
          <Heading as="legend" textStyle="h3" mb="4">
            Quiénes firman
          </Heading>
          <TextField label="Tu nombre completo" autoComplete="name" {...campo("trabajadora")} />
          <TextField label="Nombre de tu patrona o patrón" autoComplete="off" {...campo("patron")} />
          <TextField label="Dirección de la casa" autoComplete="street-address" {...campo("direccion")} />
        </Stack>

        <Stack as="fieldset" gap="4">
          <Heading as="legend" textStyle="h3" mb="4">
            Tu trabajo
          </Heading>
          <DateField label="¿Desde cuándo trabajas ahí?" {...campo("inicio")} />
          <SelectField label="Tareas" options={conVacia(TAREAS)} {...campo("tareas")} />
          <TextField
            label="Sueldo por día"
            prefix="$"
            inputMode="decimal"
            {...campo("sueldo")}
            error={bajo ? `Es menos del mínimo de ley. ${minimo}` : undefined}
            helperText={derechos?.sueldo && d.sueldo === derechos.sueldo ? `De tu cálculo en Mis derechos. ${minimo}` : minimo}
          />
          <SelectField label="¿Cada cuánto te pagan?" options={conVacia(FRECUENCIAS_PAGO)} {...campo("frecuenciaPago")} />
        </Stack>

        <Stack as="fieldset" gap="4">
          <Heading as="legend" textStyle="h3" mb="4">
            Horario y descansos
          </Heading>
          <TextField label="Horario" placeholder="Ej. 8:00 a 16:00, de lunes a viernes" {...campo("horario")} />
          <SelectField label="Días de descanso" options={conVacia(DESCANSOS)} helperText="La ley pide al menos día y medio seguido a la semana (art. 336 LFT)." {...campo("descanso")} />
          <SelectField label="¿Te quedas a dormir?" options={conVacia(DORMIR)} {...campo("dormir")} />
        </Stack>

        <Button
          size="lg"
          onClick={async () => {
            await terminar();
            router.push("/mis-derechos/contrato/ver");
          }}
        >
          Ver mi contrato
        </Button>
        {estado ? <SaveStatus status={estado} onRetry={reintentar} /> : null}
      </Screen>
    </>
  );
}
