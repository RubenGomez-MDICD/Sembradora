"use client";

import NextLink from "next/link";
import { Button, Stack } from "@chakra-ui/react";
import { Clock, HandCoins, Save } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { FeatureItem, LinkCard } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import { formatFechaCorta, formatMoney } from "@/lib/format";
import { useUltimoCalculo } from "./ultimo";

/** Figma: MS-0 · Mi sueldo */
export default function MiSueldo() {
  const ultimo = useUltimoCalculo();
  const porDia = typeof ultimo?.resultado?.sueldoDiario === "number" ? ultimo.resultado.sueldoDiario : null;

  return (
    <>
      <AppHeader type="back" title="Inicio" backHref="/" />
      <Screen>
        <PageTitle title="¿Cuánto te toca por tu trabajo?">Calcula un sueldo justo según lo que haces en la casa.</PageTitle>
        <Stack as="ul" gap="5" listStyleType="none" p="0" m="0">
          <li>
            <FeatureItem icon={Clock} title="Tarda unos 3 minutos" description="Son 5 pasos cortos." />
          </li>
          <li>
            <FeatureItem icon={HandCoins} title="Con base en el tabulador de CACEH" description="El manual de salario digno para personas trabajadoras del hogar." />
          </li>
          <li>
            <FeatureItem icon={Save} title="Puedes dejarlo a medias" description="Se guarda solo y sigues después." />
          </li>
        </Stack>
        {ultimo && porDia ? (
          <LinkCard href="/mi-sueldo/tarifa" eyebrow="Tu último cálculo" title={`${formatMoney(porDia)} al día`} description={`Lo calculaste el ${formatFechaCorta(ultimo.creado.slice(0, 10))}. Puedes revisarlo o hacerlo de nuevo.`} />
        ) : null}
        <Button size="lg" asChild>
          <NextLink href="/mi-sueldo/tareas">{ultimo ? "Hacerlo de nuevo" : "Empezar"}</NextLink>
        </Button>
      </Screen>
    </>
  );
}
