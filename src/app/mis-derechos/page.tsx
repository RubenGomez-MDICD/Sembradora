import type { Metadata } from "next";
import { Flex, Stack } from "@chakra-ui/react";
import { Check, Coins, HeartPulse, Scale, Users } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { LinkCard } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";

export const metadata: Metadata = { title: "Mis derechos" };

/** Figma: DR-0 · Mis derechos */
export default function MisDerechos() {
  return (
    <>
      <AppHeader type="back" title="Inicio" backHref="/" />
      <Screen>
        <Flex w="16" h="16" borderRadius="full" bg="brand.primary.subtle" color="brand.primary.fg" align="center" justify="center">
          <Scale size={32} aria-hidden />
        </Flex>
        <PageTitle title="Mis derechos">Lo que te corresponde por ley como trabajadora del hogar.</PageTitle>
        <Stack as="nav" aria-label="Secciones de Mis derechos" gap="3">
          <LinkCard href="/aprende/glosario?tema=derechos" icon={Check} title="Lo que te toca" description="Aguinaldo, vacaciones, prima y días de descanso." />
          <LinkCard href="/mis-derechos/contrato" icon={Coins} eyebrow="Calculadora" title="Calcula tus prestaciones" description="Con tres datos sabes cuánto te corresponde." />
          <LinkCard href="/mis-derechos/imss" icon={HeartPulse} title="El IMSS" description="Qué es, qué te da y cómo te registran." />
          <LinkCard href="/mis-derechos/platicarlo" icon={Users} eyebrow="Conversarlo" title="Cómo platicarlo" description="Una guía para pedir tu registro." />
        </Stack>
      </Screen>
    </>
  );
}
