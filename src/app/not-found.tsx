import NextLink from "next/link";
import { Button, Heading, Text } from "@chakra-ui/react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/screen";

export default function NotFound() {
  return (
    <>
      <AppHeader type="home" />
      <Screen>
        <Heading as="h1" textStyle="h2">
          No encontramos esta página
        </Heading>
        <Text color="content.muted">Puede que el enlace esté incompleto. Desde el inicio llegas a todas las secciones.</Text>
        <Button asChild size="lg">
          <NextLink href="/">Ir al inicio</NextLink>
        </Button>
      </Screen>
    </>
  );
}
