import { Heading, Stack, Text } from "@chakra-ui/react";
import { BookOpen, HandCoins, PiggyBank, Scale, Wallet } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Continuar } from "@/components/continuar";
import { Screen } from "@/components/screen";
import { SectionCard } from "@/components/section-card";
import { SECTIONS } from "@/lib/routes";

/** Figma: IN-1 · Inicio */
const ITEMS = [
  { id: "mi-sueldo", icon: HandCoins },
  { id: "mi-dinero", icon: Wallet },
  { id: "mis-ahorros", icon: PiggyBank },
  { id: "mis-derechos", icon: Scale },
  { id: "aprende", icon: BookOpen },
] as const;

export default function Inicio() {
  return (
    <>
      <AppHeader type="home" />
      <Screen>
        <Stack gap="2">
          <Heading as="h1" textStyle="h1">
            Hola, ¿qué quieres hacer hoy?
          </Heading>
          <Text color="content.muted">Herramientas para tu sueldo, tu dinero y tus derechos.</Text>
        </Stack>
        <Continuar />
        <Stack as="section" aria-labelledby="secciones" gap="3">
          <Heading as="h2" id="secciones" textStyle="h3">
            ¿Qué quieres hacer?
          </Heading>
          {ITEMS.map(({ id, icon }) => (
            <SectionCard key={id} href={SECTIONS[id].path} title={SECTIONS[id].label} description={SECTIONS[id].summary} icon={icon} />
          ))}
        </Stack>
      </Screen>
    </>
  );
}
