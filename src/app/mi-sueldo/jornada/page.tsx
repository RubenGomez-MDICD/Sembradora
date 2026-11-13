"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Button, Stack } from "@chakra-ui/react";
import { Alert, Stat, TextField } from "@/components/ds";
import { Paso } from "@/components/paso";
import { useFlujo } from "@/lib/db/use-flujo";
import { formatMoney } from "@/lib/format";
import { FLUJO_SUELDO, resultadoDe, type DatosSueldo } from "../flujo";

/**
 * Figma: MS-2 · Cálculo (paso 3 de 5).
 * Por la decisión del 13 de noviembre, el tamaño de la casa y las personas ya no se preguntan:
 * el tabulador de CACEH no los considera. Queda la jornada, que sí cambia el monto (LFT).
 */
export default function Jornada() {
  const router = useRouter();
  const { datos, cambiar, estado, reintentar, terminar } = useFlujo<DatosSueldo>(FLUJO_SUELDO);
  const d = datos ?? {};
  const horas = Number(d.horas ?? 8);
  const r = datos ? resultadoDe({ ...d, horas: d.horas || "8" }) : null;

  return (
    <Paso seccion="Mi sueldo" paso={3} total={5} backHref="/mi-sueldo/frecuencia" titulo="Tu jornada" descripcion="La ley cuenta 8 horas por día. Si trabajas más, las horas extra se pagan aparte." estado={estado} onReintentar={reintentar}>
      <TextField label="¿Cuántas horas trabajas al día?" suffix="horas" inputMode="numeric" value={d.horas ?? "8"} onChange={(e) => cambiar({ horas: e.target.value.replace(/\D/g, "").slice(0, 2) })} />
      {horas > 11 ? (
        <Alert status="warning" title="Son más horas de las que permite la ley">
          La ley permite hasta 3 horas extra al día (art. 66 LFT). Igual te las deben pagar: las contamos en tu sueldo.
        </Alert>
      ) : null}
      {r ? (
        <Stat
          label="Por todo lo que haces te tocan"
          value={`${formatMoney(r.porDia)} al día`}
          helpText={`${formatMoney(r.porSemana)} a la semana (${r.dias} ${r.dias === 1 ? "día" : "días"}) · Tabulador de Salario Digno, CACEH (2024)`}
        />
      ) : null}
      <Stack gap="2">
        <Button
          size="lg"
          disabled={!r}
          onClick={async () => {
            if (!d.horas) cambiar({ horas: "8" });
            await terminar();
            router.push("/mi-sueldo/pago");
          }}
        >
          Siguiente
        </Button>
        <Button size="lg" variant="ghost" asChild>
          <NextLink href="/mi-sueldo/frecuencia">Atrás</NextLink>
        </Button>
      </Stack>
    </Paso>
  );
}
