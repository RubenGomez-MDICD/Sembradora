"use client";

import { useRouter } from "next/navigation";
import { Button, Stack } from "@chakra-ui/react";
import { Alert, ProgressBar, Segmented, TextField } from "@/components/ds";
import { Paso } from "@/components/paso";
import { SALARIO_MINIMO } from "@/content/datos-de-ley";
import { comparar } from "@/lib/calculos/sueldo";
import { useFlujo } from "@/lib/db/use-flujo";
import { formatMoney } from "@/lib/format";
import { FLUJO_SUELDO, pagoPorDia, resultadoDe, type DatosSueldo } from "../flujo";

/** Figma: MS-3 · Comparación (paso 4 de 5) */
export default function Pago() {
  const router = useRouter();
  const { datos, cambiar, estado, reintentar, terminar } = useFlujo<DatosSueldo>(FLUJO_SUELDO);
  const d = datos ?? {};
  const r = resultadoDe(d);
  const pago = pagoPorDia(d);
  const c = r && pago ? comparar(r.porDia, pago) : null;
  const max = c ? Math.max(c.teToca, c.tePagan) : 1;

  return (
    <Paso seccion="Mi sueldo" paso={4} total={5} backHref="/mi-sueldo/jornada" titulo="¿Cuánto te pagan ahora?" descripcion="Como te sea más fácil: por día o por semana." estado={estado} onReintentar={reintentar}>
      <Segmented
        label="Cómo te pagan"
        value={d.pagoModo ?? "dia"}
        onValueChange={(e) => cambiar({ pagoModo: (e.value ?? "dia") as DatosSueldo["pagoModo"] })}
        items={[
          { value: "dia", label: "Por día" },
          { value: "semana", label: "Por semana" },
        ]}
      />
      <TextField label="Me pagan" prefix="$" size="lg" inputMode="decimal" value={d.pago ?? ""} onChange={(e) => cambiar({ pago: e.target.value })} helperText={d.pagoModo === "semana" && pago ? `Son ${formatMoney(pago)} al día.` : undefined} />
      {c ? (
        <>
          <Stack gap="3">
            <ProgressBar label="Te toca" amount={formatMoney(c.teToca)} value={(c.teToca / max) * 100} />
            <ProgressBar label="Te pagan" amount={formatMoney(c.tePagan)} value={(c.tePagan / max) * 100} tone="secondary" />
          </Stack>
          {c.justo ? (
            <Alert status="success" title="Tu sueldo está dentro de lo justo">
              Te pagan {formatMoney(c.tePagan)} al día y lo que te toca es {formatMoney(c.teToca)}.
            </Alert>
          ) : (
            <Alert status="warning" title={`Te faltan ${formatMoney(-c.diferencia)} al día`}>
              Es {c.porcentajeMenos} % menos de lo que te toca por tu trabajo.
              {c.bajoMinimo ? ` Además, es menos del mínimo de ley (${formatMoney(SALARIO_MINIMO.trabajoDelHogar)} al día en ${SALARIO_MINIMO.anio}).` : ""}
            </Alert>
          )}
        </>
      ) : null}
      <Button
        size="lg"
        disabled={!c}
        onClick={async () => {
          await terminar();
          router.push("/mi-sueldo/resultado");
        }}
      >
        Ver qué puedo hacer
      </Button>
    </Paso>
  );
}
