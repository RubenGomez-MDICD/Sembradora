import type { Metadata } from "next";
import { Flex, Stack } from "@chakra-ui/react";
import { BookOpen, Info } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { LinkCard, TextField } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import { GLOSARIO } from "@/content/glosario";

export const metadata: Metadata = { title: "Aprende" };

/** Figma: AP-0 · Aprende */
export default function Aprende() {
  return (
    <>
      <AppHeader type="back" title="Inicio" backHref="/" />
      <Screen>
        <Flex w="16" h="16" borderRadius="full" bg="brand.primary.subtle" color="brand.primary.fg" align="center" justify="center">
          <BookOpen size={32} aria-hidden />
        </Flex>
        <PageTitle title="Aprende">Las palabras del banco y de la ley, dichas como las decimos.</PageTitle>

        {/* La búsqueda funciona sin JavaScript: manda la palabra al glosario. */}
        <form role="search" action="/aprende/glosario" method="get">
          <TextField label="Busca una palabra" name="q" type="search" enterKeyHint="search" placeholder="Ej. aguinaldo, Afore, tanda" autoComplete="off" />
        </form>

        <Stack as="nav" aria-label="Secciones de Aprende" gap="3">
          <LinkCard href="/aprende/glosario" icon={BookOpen} title="Glosario" description={`${GLOSARIO.length} palabras del banco, de la ley y del dinero de todos los días, con su explicación sencilla.`} />
          <LinkCard href="/aprende/apoyos" icon={Info} title="¿Quién te apoya?" description="CACEH, IMSS y otros lugares donde te orientan." />
        </Stack>
      </Screen>
    </>
  );
}
