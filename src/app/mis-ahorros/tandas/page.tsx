import type { Metadata } from "next";
import NextLink from "next/link";
import { Button, Stack } from "@chakra-ui/react";
import { Calendar, TriangleAlert, Users } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Alert, FeatureItem } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";

export const metadata: Metadata = { title: "Las tandas" };

/** Figma: AH-4 · Las tandas */
export default function Tandas() {
  return (
    <>
      <AppHeader type="back" title="Mis ahorros" meta="Las tandas" backHref="/mis-ahorros" />
      <Screen>
        <PageTitle title="Las tandas">Una forma de ahorro que ya conoces. Aquí te ayudamos a sacarle provecho.</PageTitle>
        <Stack as="ul" gap="5" listStyleType="none" p="0" m="0">
          <li>
            <FeatureItem icon={Users} title="Te obliga a apartar" description="Como es un compromiso con otras, es más fácil cumplir cada semana." />
          </li>
          <li>
            <FeatureItem icon={Calendar} title="Elige bien tu turno" description="Si es para una meta, un turno al final junta más tiempo; si es para un gasto, uno al inicio." />
          </li>
          <li>
            <FeatureItem icon={TriangleAlert} title="Cuídate del riesgo" description="Entra solo con personas de confianza y anota cuánto has dado." />
          </li>
        </Stack>
        <Alert status="info" title="Anota tu tanda en Mi dinero">
          Usa la categoría Tandas para ver cuánto llevas dado.
        </Alert>
        <Stack gap="2">
          <Button size="lg" asChild>
            <NextLink href="/mis-ahorros/tandas/sumar">Sumar mi tanda a una meta</NextLink>
          </Button>
          <Button size="lg" variant="ghost" asChild>
            <NextLink href="/mis-ahorros">Volver a Mis ahorros</NextLink>
          </Button>
        </Stack>
      </Screen>
    </>
  );
}
