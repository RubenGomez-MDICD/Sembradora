"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Stack } from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";
import { IconOptions, RadioCardGroup, TextField } from "@/components/ds";
import { Paso } from "@/components/paso";
import { useFlujo } from "@/lib/db/use-flujo";
import { icono } from "@/lib/iconos";
import { CLASES, FLUJO_AHORROS, ICONOS_META, type DatosMeta } from "../flujo";

/** Figma: AH-1 · Tu meta y AH-1b · Otra meta (paso 1 de 3) */
export default function TuMeta() {
  const router = useRouter();
  const { datos, cambiar, estado, reintentar, terminar } = useFlujo<DatosMeta>(FLUJO_AHORROS);
  const [error, setError] = useState<string>();
  const d = datos ?? {};
  const otra = d.clase === "otra";

  const siguiente = async () => {
    if (!d.clase || d.clase === "emergencias") return setError("Elige una meta.");
    if (otra && !d.otra?.trim()) return setError("Escribe para qué es tu meta.");
    await terminar();
    router.push("/mis-ahorros/plazo");
  };

  return (
    <Paso seccion="Mis ahorros" paso={1} total={3} backHref="/mis-ahorros" titulo="¿Para qué quieres ahorrar?" descripcion="Elige una meta. Después puedes agregar más." estado={estado} onReintentar={reintentar}>
      <RadioCardGroup
        aria-label="Metas"
        value={d.clase && d.clase !== "emergencias" ? d.clase : null}
        onValueChange={(e) => {
          setError(undefined);
          cambiar({ clase: e.value ?? undefined, ...(e.value === "otra" && !d.icono ? { icono: "bus" } : {}) });
        }}
        options={[...CLASES.map((c) => ({ value: c.value, label: c.label })), { value: "otra", label: "Otra meta", description: otra ? "Escríbela con tus palabras y elige un ícono." : "Escríbela con tus palabras" }]}
      />
      {otra ? (
        <Stack gap="4" bg="surface.subtle" borderRadius="l3" p="4">
          <TextField
            label="¿Para qué es tu meta?"
            placeholder="Ej. un viaje a mi pueblo"
            value={d.otra ?? ""}
            onChange={(e) => {
              setError(undefined);
              cambiar({ otra: e.target.value });
            }}
          />
          <IconOptions label="Elige un ícono" value={d.icono ?? "bus"} onChange={(v) => cambiar({ icono: v })} options={ICONOS_META.map((o) => ({ ...o, icon: icono(o.value) }))} />
        </Stack>
      ) : null}
      {error ? (
        <Box role="alert" color="feedback.error.fg" textStyle="caption">
          {error}
        </Box>
      ) : null}
      <Button size="lg" onClick={siguiente}>
        Siguiente <ChevronRight aria-hidden />
      </Button>
    </Paso>
  );
}
