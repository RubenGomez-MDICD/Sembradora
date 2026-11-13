import type { Metadata } from "next";
import NextLink from "next/link";
import { Button, Stack } from "@chakra-ui/react";
import { Coins, HandCoins, Scale, Sprout } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { FeatureItem } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";

export const metadata: Metadata = { title: "Por qué ahorrar" };

/** Figma: AH-7 · Por qué ahorrar */
export default function PorQueAhorrar() {
  return (
    <>
      <AppHeader type="back" title="Mis ahorros" backHref="/mis-ahorros" />
      <Screen>
        <PageTitle title="Por qué ahorrar">Lo que cambia cuando tienes un guardadito.</PageTitle>
        <Stack as="ul" gap="5" listStyleType="none" p="0" m="0">
          <li>
            <FeatureItem icon={Sprout} title="Te da calma" description="Cuando hay un guardadito, un gasto que no esperabas no se vuelve una crisis." />
          </li>
          <li>
            <FeatureItem icon={HandCoins} title="Evitas pedir prestado" description="Un préstamo cuesta más de lo que te prestan. Ahorrar te deja elegir." />
          </li>
          <li>
            <FeatureItem icon={Scale} title="Te deja decidir" description="Puedes decir que no a un trabajo o a un trato que no te conviene." />
          </li>
          <li>
            <FeatureItem icon={Coins} title="Poco a poco cuenta" description="$50 a la semana son $2,600 al año." />
          </li>
        </Stack>
        <Stack gap="2">
          <Button size="lg" asChild>
            <NextLink href="/mis-ahorros/meta">Crear una meta</NextLink>
          </Button>
          <Button size="lg" variant="ghost" asChild>
            <NextLink href="/mis-ahorros">Volver a Mis ahorros</NextLink>
          </Button>
        </Stack>
      </Screen>
    </>
  );
}
