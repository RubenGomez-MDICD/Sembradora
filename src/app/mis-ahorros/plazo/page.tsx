"use client";

import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Button, Stack, Text } from "@chakra-ui/react";
import { Alert, Segmented, TextField } from "@/components/ds";
import { Paso } from "@/components/paso";
import type { FrecuenciaAporte } from "@/lib/calculos/ahorro";
import type { UnidadPlazo } from "@/lib/db/tipos";
import { useFlujo } from "@/lib/db/use-flujo";
import { parsePesos } from "@/lib/format";
import { FLUJO_AHORROS, enMinuscula, nombreDeMeta, type DatosMeta } from "../flujo";

/** Figma: AH-2 · Cuánto y cuándo (paso 2 de 3) */
export default function CuantoYCuando() {
  const router = useRouter();
  const { datos, cambiar, estado, reintentar, terminar } = useFlujo<DatosMeta>(FLUJO_AHORROS);
  const [errores, setErrores] = useState<{ monto?: string; plazo?: string }>({});
  const d = datos ?? {};
  const { nombre } = nombreDeMeta(d);
  const emergencias = d.clase === "emergencias";

  const calcular = async () => {
    const e: typeof errores = {};
    if (!parsePesos(d.monto)) e.monto = "Escribe cuánto necesitas, por ejemplo 30,000.";
    const plazo = Number(d.plazo);
    if (!Number.isInteger(plazo) || plazo < 1) e.plazo = "Escribe un número entero, por ejemplo 18.";
    setErrores(e);
    if (Object.keys(e).length) return;
    if (!d.unidad || !d.frecuencia) cambiar({ unidad: d.unidad ?? "anios", frecuencia: d.frecuencia ?? "semana" });
    await terminar();
    router.push("/mis-ahorros/plan");
  };

  return (
    <Paso
      seccion="Mis ahorros"
      paso={2}
      total={3}
      backHref={emergencias ? "/mis-ahorros/emergencias" : "/mis-ahorros/meta"}
      titulo="¿Cuánto necesitas y para cuándo?"
      descripcion={nombre ? `Meta: ${enMinuscula(nombre)}` : undefined}
      estado={estado}
      onReintentar={reintentar}
    >
      <TextField
        label="¿Cuánto necesitas?"
        prefix="$"
        size="lg"
        inputMode="decimal"
        value={d.monto ?? ""}
        onChange={(e) => {
          setErrores((x) => ({ ...x, monto: undefined }));
          cambiar({ monto: e.target.value });
        }}
        error={errores.monto}
      />
      <Stack gap="2">
        <TextField
          label="¿En cuánto tiempo?"
          inputMode="numeric"
          value={d.plazo ?? ""}
          onChange={(e) => {
            setErrores((x) => ({ ...x, plazo: undefined }));
            cambiar({ plazo: e.target.value.replace(/\D/g, "") });
          }}
          error={errores.plazo}
          helperText="Escribe un número, por ejemplo 18 meses o 2 años."
        />
        <Segmented
          label="Unidad del plazo"
          value={d.unidad ?? "anios"}
          onValueChange={(e) => cambiar({ unidad: (e.value ?? "anios") as UnidadPlazo })}
          items={[
            { value: "semanas", label: "Semanas" },
            { value: "meses", label: "Meses" },
            { value: "anios", label: "Años" },
          ]}
        />
      </Stack>
      <Stack gap="2">
        <Text id="como-apartar" textStyle="label">
          ¿Cómo prefieres apartar?
        </Text>
        <Segmented
          label="¿Cómo prefieres apartar?"
          value={d.frecuencia ?? "semana"}
          onValueChange={(e) => cambiar({ frecuencia: (e.value ?? "semana") as FrecuenciaAporte })}
          items={[
            { value: "semana", label: "Cada semana" },
            { value: "mes", label: "Cada mes" },
          ]}
        />
      </Stack>
      <Alert status="info" title="¿Estás en una tanda?">
        También cuenta. Puedes sumarla a tu meta cuando te toque.
      </Alert>
      <Stack gap="2">
        <Button size="lg" onClick={calcular}>
          Calcular
        </Button>
        <Button size="lg" variant="ghost" asChild>
          <NextLink href={emergencias ? "/mis-ahorros/emergencias" : "/mis-ahorros/meta"}>Atrás</NextLink>
        </Button>
      </Stack>
    </Paso>
  );
}
