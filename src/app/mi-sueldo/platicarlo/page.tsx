"use client";

import NextLink from "next/link";
import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react";
import { AppHeader } from "@/components/app-header";
import { NumberedSteps } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import { useBorrador } from "@/lib/db/hooks";
import { formatMoney } from "@/lib/format";
import { FLUJO_SUELDO, resultadoDe, type DatosSueldo } from "../flujo";
import { useUltimoCalculo } from "../ultimo";

/** Figma: MS-6 · Cómo platicar de tu sueldo */
export default function PlaticarSueldo() {
  const borrador = useBorrador(FLUJO_SUELDO) as DatosSueldo | undefined;
  const ultimo = useUltimoCalculo();
  const porDia = (borrador && resultadoDe(borrador)?.porDia) || (typeof ultimo?.resultado?.sueldoDiario === "number" ? ultimo.resultado.sueldoDiario : null);
  const monto = porDia ? formatMoney(porDia) : "[tu tarifa]";

  return (
    <>
      <AppHeader type="back" title="Mi sueldo" meta="Platicarlo" backHref="/mi-sueldo/resultado" />
      <Screen>
        <PageTitle title="Cómo platicar de tu sueldo con tus patrones">Una guía para pedir un pago justo. Tú decides cuándo y cómo.</PageTitle>
        <NumberedSteps
          items={[
            { title: "Elige un buen momento", description: "Sin prisas, al inicio o al final del día y sin otras personas." },
            { title: "Lleva tu tarifa", description: "Muéstrales de dónde sale: tus tareas, tus días y el tabulador de CACEH." },
            { title: "Di cuánto y desde cuándo", description: "Propón un monto y una fecha. Si hace falta, pídelo en dos partes." },
            { title: "Que quede por escrito", description: "Anoten el nuevo sueldo en tu contrato o en un recado firmado (art. 331 Ter LFT)." },
          ]}
        />
        <Box as="figure" m="0" bg="brand.secondary.subtle" borderRadius="l3" p="4">
          <Heading as="h2" textStyle="overline" color="brand.secondary.fg" mb="2">
            Lo que puedes decir
          </Heading>
          <Text as="blockquote" textStyle="bodyLg">
            “Revisé cuánto se paga por el trabajo que hago aquí. Según el tabulador de CACEH, me tocan {monto} al día. ¿Podemos platicar de mi sueldo?”
          </Text>
        </Box>
        <Stack gap="2">
          <Button size="lg" asChild>
            <NextLink href="/mi-sueldo/tarifa">Ver mi tarifa para compartir</NextLink>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <NextLink href="/mis-derechos/contrato/armar">Arma tu contrato</NextLink>
          </Button>
          <Button size="lg" variant="ghost" asChild>
            <NextLink href="/">Volver al inicio</NextLink>
          </Button>
        </Stack>
      </Screen>
    </>
  );
}
