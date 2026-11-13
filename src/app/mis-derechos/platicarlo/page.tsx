"use client";

import NextLink from "next/link";
import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react";
import { NumberedSteps, notify } from "@/components/ds";
import { compartirEnlace } from "@/lib/compartir";
import { Paso } from "../paso";

/** Figma: DR-3 · Conversarlo (paso 4 de 4) */
export default function Platicarlo() {
  const guardarGuia = async () => {
    const r = await compartirEnlace({ title: "Cómo platicarlo con tus patrones", text: "Guía de La sembradora para pedir tu registro al IMSS.", url: window.location.href });
    if (r === "copiado") notify({ title: "Copiamos el enlace de esta guía", status: "info" });
  };

  return (
    <Paso paso={4} backHref="/mis-derechos" titulo="Cómo platicarlo con tus patrones" descripcion="Una guía para pedir tu registro al IMSS. Tú decides cuándo y cómo.">
      <NumberedSteps
        items={[
          { title: "Busca un buen momento", description: "Sin prisas, al inicio o al final del día." },
          { title: "Lleva tus cuentas", description: "Muestra lo que calculaste en el paso anterior." },
          { title: "Explica qué es el registro", description: "Se hace en línea, es gratis y ellos pagan las cuotas." },
          { title: "Acuerden una fecha", description: "Pide que quede por escrito." },
        ]}
      />
      <Box as="figure" m="0" bg="brand.secondary.subtle" borderRadius="l3" p="4">
        <Heading as="h2" textStyle="overline" color="brand.secondary.fg" mb="2">
          Lo que puedes decir
        </Heading>
        <Text as="blockquote" textStyle="bodyLg">
          “Me gustaría platicar sobre mi registro en el IMSS. Ya revisé cómo se hace y le traigo la información.”
        </Text>
      </Box>
      <Stack gap="2">
        <Button size="lg" asChild>
          <NextLink href="/mis-derechos/platicarlo/patrones">Mándales la información</NextLink>
        </Button>
        <Button size="lg" variant="outline" onClick={guardarGuia}>
          Guardar esta guía
        </Button>
        <Button size="lg" variant="ghost" asChild>
          <NextLink href="/mis-derechos">Volver a Mis derechos</NextLink>
        </Button>
      </Stack>
    </Paso>
  );
}
