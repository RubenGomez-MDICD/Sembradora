"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Button, Stack, Text } from "@chakra-ui/react";
import { SelectField } from "@/components/ds";
import { Paso } from "@/components/paso";
import { TABULADOR_CACEH } from "@/content/datos-de-ley";
import { useFlujo } from "@/lib/db/use-flujo";
import { FLUJO_SUELDO, TAREAS, textoDias, type DatosSueldo } from "../flujo";

/** Figma: MS-1b · Cada cuánto (paso 2 de 5) */
export default function Frecuencia() {
  const router = useRouter();
  const { datos, cambiar, estado, reintentar, terminar } = useFlujo<DatosSueldo>(FLUJO_SUELDO);
  const d = datos ?? {};
  const dias = Number(d.dias ?? 5);
  const marcadas = TAREAS.filter((t) => d.tareas?.includes(t.value));

  const opcionesTarea = [{ value: String(dias), label: dias === 1 ? "El día que voy" : `Los ${dias} días` }, ...Array.from({ length: dias - 1 }, (_, i) => ({ value: String(dias - 1 - i), label: textoDias(dias - 1 - i) }))];

  return (
    <Paso
      seccion="Mi sueldo"
      paso={2}
      total={5}
      backHref="/mi-sueldo/tareas"
      titulo="¿Cada cuánto lo haces?"
      descripcion="Hay tareas de todos los días y otras de algunos días. Así el cálculo se parece a tu semana real."
      estado={estado}
      onReintentar={reintentar}
    >
      <SelectField
        label="¿Cuántos días a la semana vas a esa casa?"
        value={String(dias)}
        onChange={(e) => {
          const n = Number(e.target.value);
          // Si baja el número de días, ninguna tarea puede quedar con más días que esos.
          const frecuencia = Object.fromEntries(Object.entries(d.frecuencia ?? {}).map(([k, v]) => [k, String(Math.min(n, Number(v)))]));
          cambiar({ dias: String(n), frecuencia });
        }}
        options={Array.from({ length: 7 }, (_, i) => ({ value: String(i + 1), label: i === 0 ? "1 día" : `${i + 1} días` }))}
      />
      <Stack gap="1">
        <Text textStyle="label">Tus tareas</Text>
        <Text textStyle="caption" color="content.muted">
          Solo aparecen las que marcaste.
        </Text>
      </Stack>
      {marcadas.length ? (
        <Stack gap="4">
          {marcadas.map((t) => (
            <SelectField
              key={t.value}
              label={t.label}
              value={d.frecuencia?.[t.value] ?? String(dias)}
              onChange={(e) => cambiar({ frecuencia: { ...d.frecuencia, [t.value]: e.target.value } })}
              options={opcionesTarea}
              helperText={"especializada" in TABULADOR_CACEH.categorias[t.value] ? "Cuenta como especializada." : undefined}
            />
          ))}
        </Stack>
      ) : (
        <Text color="content.muted">
          Todavía no marcas tareas.{" "}
          <NextLink href="/mi-sueldo/tareas">Regresa al paso 1</NextLink>.
        </Text>
      )}
      <Stack gap="2">
        <Button
          size="lg"
          disabled={!marcadas.length}
          onClick={async () => {
            if (!d.dias) cambiar({ dias: String(dias) });
            await terminar();
            router.push("/mi-sueldo/jornada");
          }}
        >
          Siguiente
        </Button>
        <Button size="lg" variant="ghost" asChild>
          <NextLink href="/mi-sueldo/tareas">Atrás</NextLink>
        </Button>
      </Stack>
    </Paso>
  );
}
