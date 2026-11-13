"use client";

import { useState } from "react";
import NextLink from "next/link";
import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react";
import { AppHeader } from "@/components/app-header";
import { notify } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import { SALARIO_MINIMO } from "@/content/datos-de-ley";
import { compartirODescargar, tarjetaComoImagen } from "@/lib/compartir";
import { formatMoney } from "@/lib/format";
import { enlaceWhatsApp } from "../../flujo";

const TARJETA = {
  eyebrow: "Para la persona empleadora",
  titulo: "Cómo registrar a tu trabajadora del hogar en el IMSS",
  lineas: [
    "1. Entra a imss.gob.mx/personas-trabajadoras-hogar.",
    "2. Ten a la mano tu CURP y tu correo, y la CURP y el número de seguridad social de ella.",
    `3. Registra su sueldo real: al menos ${formatMoney(SALARIO_MINIMO.trabajoDelHogar)} al día en ${SALARIO_MINIMO.anio}.`,
    "4. Paga con la línea de captura: cada mes, cada dos meses, cada seis meses o cada año.",
  ],
  pie: "Es obligatorio desde el primer día de trabajo y el trámite es gratis (IMSS).",
};

/** Figma: DR-3b · Para tus patrones */
export default function ParaTusPatrones() {
  const [creando, setCreando] = useState(false);
  const texto = [TARJETA.titulo, "", ...TARJETA.lineas, "", TARJETA.pie, "https://www.imss.gob.mx/personas-trabajadoras-hogar"].join("\n");

  const descargar = async () => {
    setCreando(true);
    try {
      const png = await tarjetaComoImagen(TARJETA);
      const r = await compartirODescargar(png, "registro-imss.png", TARJETA.titulo);
      if (r === "descargado") notify({ title: "Se descargó la imagen" });
    } catch {
      notify({ title: "No se pudo crear la imagen", status: "info" });
    } finally {
      setCreando(false);
    }
  };

  return (
    <>
      <AppHeader type="back" title="Mis derechos" meta="Para tus patrones" backHref="/mis-derechos/platicarlo" />
      <Screen>
        <PageTitle title="Mándales la información">Una tarjeta con lo que necesitan para registrarte en el IMSS. Así no tienes que explicarlo todo tú.</PageTitle>
        <Box as="article" bg="surface.panel" borderWidth="1px" borderColor="border.subtle" borderTopWidth="4px" borderTopColor="brand.primary.solid" borderRadius="l3" p="5">
          <Text textStyle="overline" color="brand.primary.fg">
            {TARJETA.eyebrow}
          </Text>
          <Heading as="h2" textStyle="h3" mt="1" mb="3">
            {TARJETA.titulo}
          </Heading>
          <Stack as="ol" gap="2" listStyleType="none" p="0" m="0">
            {TARJETA.lineas.map((l) => (
              <Text as="li" key={l} textStyle="body">
                {l}
              </Text>
            ))}
          </Stack>
          <Text textStyle="bodySm" color="content.muted" mt="4">
            {TARJETA.pie}
          </Text>
        </Box>
        <Stack gap="2">
          <Button size="lg" asChild>
            <a href={enlaceWhatsApp(texto)} target="_blank" rel="noreferrer">
              Mandar por WhatsApp
            </a>
          </Button>
          <Button size="lg" variant="outline" onClick={descargar} loading={creando} loadingText="Creando la imagen…">
            Descargar como imagen
          </Button>
          <Button size="lg" variant="ghost" asChild>
            <NextLink href="/mis-derechos">Volver a Mis derechos</NextLink>
          </Button>
        </Stack>
      </Screen>
    </>
  );
}
