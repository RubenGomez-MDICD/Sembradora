import { Heading, Stack, Text } from "@chakra-ui/react";

/** Bloque «Title» de las pantallas de Figma: título de la página y una línea que la explica. */
export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <Stack gap="2">
      <Heading as="h1" textStyle="h1">
        {title}
      </Heading>
      {children ? <Text color="content.muted">{children}</Text> : null}
    </Stack>
  );
}
