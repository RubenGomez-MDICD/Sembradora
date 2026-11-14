"use client";

import { Box, Popover, Portal, Stack, Text, chakra } from "@chakra-ui/react";
import { WifiOff } from "lucide-react";
import { FUNCIONA_SIN_INTERNET, NECESITA_INTERNET } from "@/content/sin-internet";
import { useEnLinea } from "@/lib/en-linea";

/**
 * Figma: AppHeader, propiedad «sinInternet». Etiqueta que aparece en el encabezado de todas
 * las pantallas mientras no hay conexión. Al tocarla explica qué funciona y qué espera.
 * La región `status` hace que los lectores de pantalla anuncien el cambio.
 */
export function EtiquetaSinInternet() {
  const enLinea = useEnLinea();
  return (
    <Box role="status" display="contents">
      {enLinea ? null : (
        <Popover.Root positioning={{ placement: "bottom-end" }}>
          <Popover.Trigger asChild>
            {/* Área de toque de 44 px; la etiqueta visible mide 28 px. */}
            <chakra.button type="button" flexShrink="0" display="flex" alignItems="center" h="11" px="1" cursor="pointer" aria-label="Sin internet. Toca para saber qué funciona.">
              <Box as="span" display="inline-flex" alignItems="center" gap="1.5" h="7" px="2.5" borderRadius="full" borderWidth="1px" borderColor="feedback.warning.border" bg="feedback.warning.bg" color="feedback.warning.fg" textStyle="caption" fontWeight="semibold" whiteSpace="nowrap">
                <WifiOff size={14} aria-hidden />
                Sin internet
              </Box>
            </chakra.button>
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content bg="surface.panel" borderRadius="l3" maxW="xs">
                <Popover.Arrow>
                  <Popover.ArrowTip />
                </Popover.Arrow>
                <Popover.Body p="4">
                  <Stack gap="2">
                    <Popover.Title textStyle="label">Estás sin internet</Popover.Title>
                    <Text textStyle="caption" fontWeight="semibold">Puedes seguir con esto</Text>
                    <Box as="ul" listStyleType="disc" pl="5" m="0" textStyle="bodySm" css={{ "& li + li": { mt: "1" } }}>
                      {FUNCIONA_SIN_INTERNET.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </Box>
                    <Text textStyle="caption" fontWeight="semibold" color="content.muted">
                      Espera a que vuelva la conexión
                    </Text>
                    <Box as="ul" listStyleType="disc" pl="5" m="0" textStyle="bodySm" css={{ "& li + li": { mt: "1" } }} color="content.muted">
                      {NECESITA_INTERNET.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </Box>
                  </Stack>
                </Popover.Body>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>
      )}
    </Box>
  );
}
