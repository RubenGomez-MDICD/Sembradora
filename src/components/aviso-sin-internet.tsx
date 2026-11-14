"use client";

import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { Check, Clock, WifiOff } from "lucide-react";
import { FUNCIONA_SIN_INTERNET, NECESITA_INTERNET } from "@/content/sin-internet";
import { useEnLinea } from "@/lib/en-linea";

function Lista({ titulo, items, icono: Icono, color }: { titulo: string; items: string[]; icono: typeof Check; color: string }) {
  return (
    <Stack gap="2">
      <Text textStyle="label">{titulo}</Text>
      <Stack as="ul" gap="2" listStyleType="none" m="0" p="0">
        {items.map((t) => (
          <Flex as="li" key={t} gap="2" align="flex-start">
            <Box color={color} flexShrink="0" pt="0.5">
              <Icono size={16} aria-hidden />
            </Box>
            <Text textStyle="bodySm">{t}</Text>
          </Flex>
        ))}
      </Stack>
    </Stack>
  );
}

/**
 * Figma: IN-1s · Inicio sin internet. Aparece en Inicio solo mientras no hay conexión y
 * aclara qué se puede hacer y qué espera a que vuelva. Acompaña a la etiqueta del encabezado.
 */
export function AvisoSinInternet() {
  const enLinea = useEnLinea();
  if (enLinea) return null;
  return (
    <Box as="section" aria-labelledby="aviso-sin-internet" bg="feedback.warning.bg" borderWidth="1px" borderColor="feedback.warning.border" borderRadius="l3" p="4">
      <Flex gap="3" align="center" mb="4">
        <Flex flexShrink="0" w="10" h="10" borderRadius="full" bg="surface.panel" color="feedback.warning.fg" align="center" justify="center">
          <WifiOff size={20} aria-hidden />
        </Flex>
        <Stack gap="0">
          <Text as="h2" id="aviso-sin-internet" textStyle="h4" color="feedback.warning.fg">
            Estás sin internet
          </Text>
          <Text textStyle="bodySm" color="content.muted">
            Tus datos están a salvo en tu teléfono.
          </Text>
        </Stack>
      </Flex>
      <Stack gap="4">
        <Lista titulo="Puedes seguir con esto" items={FUNCIONA_SIN_INTERNET} icono={Check} color="brand.primary.fg" />
        <Lista titulo="Esto espera a que vuelva la conexión" items={NECESITA_INTERNET} icono={Clock} color="content.muted" />
      </Stack>
    </Box>
  );
}
