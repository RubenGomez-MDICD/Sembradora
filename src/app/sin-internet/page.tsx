import type { Metadata } from "next";
import { Stack, Heading } from "@chakra-ui/react";
import { BookOpen, List, PencilLine, WifiOff } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { EmptyState, LinkCard } from "@/components/ds";
import { Screen } from "@/components/screen";
import { Reintentar } from "./reintentar";

export const metadata: Metadata = { title: "Sin internet", robots: { index: false } };

/**
 * Se muestra cuando no hay internet y la página pedida todavía no está guardada en el teléfono.
 * Lleva a lo que sí funciona sin conexión.
 */
export default function SinInternet() {
  return (
    <>
      <AppHeader type="home" />
      <Screen>
        <EmptyState icon={WifiOff} title="No hay internet" description="Esta página todavía no está guardada en tu teléfono. Cuando vuelva la conexión, ábrela una vez y quedará lista para la próxima.">
          <Reintentar />
        </EmptyState>
        <Stack as="section" aria-labelledby="sin-conexion" gap="3">
          <Heading as="h2" id="sin-conexion" textStyle="h3">
            Esto funciona sin internet
          </Heading>
          <LinkCard href="/mi-dinero/anotar" icon={PencilLine} title="Anotar un gasto o un ingreso" description="Se guarda en tu teléfono." />
          <LinkCard href="/mi-dinero/movimientos" icon={List} title="Ver mis movimientos" />
          <LinkCard href="/aprende/glosario" icon={BookOpen} title="Glosario" description="Qué quiere decir cada palabra." />
        </Stack>
      </Screen>
    </>
  );
}
