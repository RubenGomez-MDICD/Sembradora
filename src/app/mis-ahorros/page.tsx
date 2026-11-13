"use client";

import NextLink from "next/link";
import { Button, Flex, Stack } from "@chakra-ui/react";
import { Coins, HeartPulse, PiggyBank, Sprout, Users } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { EmptyState, LinkCard } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import { useTabla } from "@/lib/db/hooks";
import { MetaCard } from "./meta-card";

/** Figma: AH-0 · Mis ahorros y AH-6 · Tanda sumada (el aviso llega como Toast). */
export default function MisAhorros() {
  const metas = useTabla("metas");
  const tandas = useTabla("tandas") ?? [];
  const ordenadas = metas?.slice().sort((a, b) => b.creado.localeCompare(a.creado));

  return (
    <>
      <AppHeader type="back" title="Inicio" backHref="/" />
      <Screen>
        <Flex h="32" borderRadius="l3" bg="brand.secondary.subtle" align="center" justify="center">
          <Flex w="20" h="20" borderRadius="full" bg="brand.secondary.muted" color="brand.secondary.fg" align="center" justify="center">
            <PiggyBank size={36} aria-hidden />
          </Flex>
        </Flex>
        <PageTitle title="Mis ahorros">Guardar un poco hoy para los apuros y para lo que sueñas.</PageTitle>

        {ordenadas === undefined ? null : ordenadas.length ? (
          <Stack gap="3">
            {ordenadas.map((m) => (
              <MetaCard key={m.id} meta={m} tandas={tandas} />
            ))}
          </Stack>
        ) : (
          <EmptyState icon={Sprout} title="Aún no tienes una meta" description="Elige para qué quieres ahorrar y te decimos cuánto apartar cada semana.">
            <Button size="lg" asChild>
              <NextLink href="/mis-ahorros/meta">Crear una meta</NextLink>
            </Button>
          </EmptyState>
        )}

        <Stack as="nav" aria-label="Secciones de Mis ahorros" gap="3">
          <LinkCard href="/mis-ahorros/por-que-ahorrar" icon={Sprout} title="Por qué ahorrar" description="Lo que cambia cuando tienes un guardadito." />
          <LinkCard href="/mis-ahorros/tandas" icon={Users} title="Las tandas" description="Cómo usarlas a tu favor." />
          <LinkCard href="/mis-ahorros/emergencias" icon={HeartPulse} title="Para emergencias" description="Cuánto apartar para los apuros." />
          <LinkCard href="/mis-ahorros/meta" icon={Coins} eyebrow="Calculadora" title="Mis metas" description="Calcula cuánto apartar cada semana." />
        </Stack>
      </Screen>
    </>
  );
}
