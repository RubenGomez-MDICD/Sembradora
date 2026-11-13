"use client";

import NextLink from "next/link";
import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { AppHeader } from "@/components/app-header";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import { useBorrador } from "@/lib/db/hooks";
import { enlaceWhatsApp } from "../../flujo";
import { FLUJO_CONTRATO, clausulas, contratoComoTexto, type DatosContrato } from "../contrato";

/**
 * Figma: DR-5b · Tu contrato.
 * «Descargar PDF» abre la impresión del teléfono, donde se elige «Guardar como PDF»;
 * la hoja impresa muestra solo el contrato (ver globals.css).
 */
export default function VerContrato() {
  const datos = useBorrador(FLUJO_CONTRATO) as DatosContrato | undefined;
  const c = clausulas(datos ?? {});

  return (
    <>
      <AppHeader type="back" title="Mis derechos" meta="Tu contrato" backHref="/mis-derechos/contrato/armar" />
      <Screen>
        <Box data-no-imprimir>
          <PageTitle title="Tu contrato">Léanlo con calma, firmen dos copias y quédate con una.</PageTitle>
        </Box>
        <Box as="article" data-imprimir bg="surface.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="l3" p="5" aria-busy={datos === undefined}>
          <Heading as="h2" textStyle="overline" color="content.default" mb="3">
            Contrato de trabajo del hogar
          </Heading>
          <Text textStyle="bodySm" mb="3">
            {c.entre}
          </Text>
          <Stack as="ol" gap="2" listStyleType="none" p="0" m="0">
            {c.lista.map((l, i) => (
              <Text as="li" key={i} textStyle="bodySm">
                {i + 1}. {l}
              </Text>
            ))}
          </Stack>
          <Flex gap="4" mt="10">
            {["Firma de la trabajadora", "Firma de la persona empleadora"].map((f) => (
              <Box key={f} flex="1" borderTopWidth="1px" borderColor="content.default" pt="1">
                <Text textStyle="caption" color="content.muted">
                  {f}
                </Text>
              </Box>
            ))}
          </Flex>
          <Text textStyle="caption" color="content.subtle" mt="5">
            Con base en el artículo 331 Ter de la LFT y el modelo de contrato de CACEH.
          </Text>
        </Box>
        <Stack gap="2" data-no-imprimir>
          <Button size="lg" onClick={() => window.print()}>
            Descargar PDF
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href={enlaceWhatsApp(contratoComoTexto(datos ?? {}))} target="_blank" rel="noreferrer">
              Mandar por WhatsApp
            </a>
          </Button>
          <Button size="lg" variant="ghost" asChild>
            <NextLink href="/mis-derechos/contrato/armar">Cambiar datos</NextLink>
          </Button>
        </Stack>
      </Screen>
    </>
  );
}
