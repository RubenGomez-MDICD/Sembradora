import { Stack, type StackProps } from "@chakra-ui/react";

/**
 * Contenedor de pantalla: una columna de hasta 512 px, con márgenes de 16 px
 * en el teléfono y centrada en pantallas grandes (diseño móvil primero).
 */
export function Screen({ children, ...rest }: StackProps) {
  return (
    <Stack as="main" id="contenido" maxW="lg" mx="auto" px="4" pt="6" pb="12" gap="6" {...rest}>
      {children}
    </Stack>
  );
}
