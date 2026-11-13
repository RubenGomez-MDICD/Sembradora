"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { Alert, CheckboxCardItem } from "@/components/ds";
import { Paso } from "@/components/paso";
import type { Tarea } from "@/content/datos-de-ley";
import { useFlujo } from "@/lib/db/use-flujo";
import { FLUJO_SUELDO, TAREAS, type DatosSueldo } from "../flujo";

/** Figma: MS-1 · Tus tareas (paso 1 de 5) */
export default function Tareas() {
  const router = useRouter();
  const { datos, cambiar, estado, reintentar, terminar } = useFlujo<DatosSueldo>(FLUJO_SUELDO);
  const [error, setError] = useState(false);
  const marcadas = datos?.tareas ?? [];

  const alternar = (t: Tarea, on: boolean) => {
    setError(false);
    cambiar({ tareas: on ? [...marcadas.filter((x) => x !== t), t] : marcadas.filter((x) => x !== t) });
  };

  return (
    <Paso
      seccion="Mi sueldo"
      paso={1}
      total={5}
      backHref="/mi-sueldo"
      titulo="¿Qué haces en la casa?"
      descripcion="Marca todo lo que haces, aunque sea solo algunos días. En el siguiente paso te preguntamos cada cuánto."
      estado={estado}
      onReintentar={reintentar}
    >
      <Stack as="fieldset" gap="2">
        <Text as="legend" srOnly>
          Tus tareas
        </Text>
        {TAREAS.map((t) => (
          <CheckboxCardItem key={t.value} label={t.label} description={t.description} checked={marcadas.includes(t.value)} onCheckedChange={(e) => alternar(t.value, Boolean(e.checked))} />
        ))}
      </Stack>
      {marcadas.length > 1 ? (
        <Alert status="info" title="Haces tareas de varias categorías">
          Lo tomamos en cuenta: cada día cuenta con la tarea más especializada que haces ese día.
        </Alert>
      ) : null}
      {error ? (
        <Box role="alert" color="feedback.error.fg" textStyle="caption">
          Marca por lo menos una tarea.
        </Box>
      ) : null}
      <Button
        size="lg"
        onClick={async () => {
          if (!marcadas.length) return setError(true);
          await terminar();
          router.push("/mi-sueldo/frecuencia");
        }}
      >
        Siguiente
      </Button>
    </Paso>
  );
}
