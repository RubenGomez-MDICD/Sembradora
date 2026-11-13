"use client";

import { Heading, Stack, Text } from "@chakra-ui/react";
import { AppHeader } from "@/components/app-header";
import { SaveStatus, StepsBar } from "@/components/ds";
import { Screen } from "@/components/screen";
import type { EstadoGuardado } from "@/lib/db/use-flujo";

/**
 * Marco de cada paso de un flujo (Mis derechos, Mis ahorros…): encabezado con
 * «Paso X de N», barra de pasos, título, contenido y estado de guardado al final.
 */
export function Paso({
  seccion = "Mis derechos",
  paso,
  total = 4,
  backHref,
  titulo,
  descripcion,
  estado,
  onReintentar,
  children,
}: {
  seccion?: string;
  paso: number;
  total?: number;
  backHref: string;
  titulo?: string;
  descripcion?: React.ReactNode;
  estado?: EstadoGuardado;
  onReintentar?: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader type="back" title={seccion} meta={`Paso ${paso} de ${total}`} backHref={backHref} />
      <Screen>
        <StepsBar total={total} current={paso} />
        {titulo ? (
          <Stack gap="2">
            <Heading as="h1" textStyle="h1">
              {titulo}
            </Heading>
            {descripcion ? <Text color="content.muted">{descripcion}</Text> : null}
          </Stack>
        ) : null}
        {children}
        {estado ? <SaveStatus status={estado} onRetry={onReintentar} /> : null}
      </Screen>
    </>
  );
}
