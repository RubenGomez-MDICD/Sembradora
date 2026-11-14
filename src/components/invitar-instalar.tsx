"use client";

import { useEffect, useState } from "react";
import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { Share, Smartphone } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { getDb, guardarAjuste } from "@/lib/db";
import { useRegistro } from "@/lib/db/hooks";
import { alCambiarInstalable, instalar, puedeInstalar } from "./sitio-instalable";

const DESCARTADA = "instalacion-descartada";

function esIOS() {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes("Mac") && navigator.maxTouchPoints > 1);
}
const yaInstalada = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

/**
 * Invitación a agregar el sitio a la pantalla de inicio. Aparece cuando ya hay algo anotado,
 * porque es cuando más importa: instalado, el navegador no borra los datos por falta de uso.
 * En Android abre el aviso del sistema; en iPhone explica los dos toques.
 */
export function InvitarInstalar() {
  const descartada = useRegistro("ajustes", DESCARTADA);
  const hayDatos = useLiveQuery(async () => {
    const db = getDb();
    return (await db.movimientos.count()) + (await db.metas.count()) + (await db.calculos.count()) > 0;
  });
  const [modo, setModo] = useState<"android" | "ios" | null>(null);

  useEffect(() => {
    if (yaInstalada()) return;
    const revisar = () => setModo(puedeInstalar() ? "android" : esIOS() ? "ios" : null);
    revisar();
    return alCambiarInstalable(revisar);
  }, []);

  if (!modo || !hayDatos || descartada === undefined || descartada) return null;

  return (
    <Box as="aside" aria-label="Agregar a la pantalla de inicio" bg="brand.primary.subtle" borderRadius="l3" p="4">
      <Flex gap="3" align="flex-start">
        <Flex flexShrink="0" w="10" h="10" borderRadius="full" bg="surface.panel" color="brand.primary.fg" align="center" justify="center">
          <Smartphone size={20} aria-hidden />
        </Flex>
        <Stack gap="1" flex="1">
          <Text textStyle="label">Agrégala a tu pantalla de inicio</Text>
          <Text textStyle="bodySm" color="content.muted">
            Se abre como app, funciona sin internet y tus datos quedan más seguros en el teléfono.
          </Text>
          {modo === "ios" ? (
            <Text textStyle="bodySm">
              Toca <Share size={14} aria-label="Compartir" style={{ display: "inline", verticalAlign: "-2px" }} /> abajo y luego «Agregar a inicio».
            </Text>
          ) : null}
        </Stack>
      </Flex>
      <Flex gap="2" mt="3" justify="flex-end">
        <Button variant="ghost" size="md" onClick={() => void guardarAjuste(DESCARTADA, true)}>
          {modo === "ios" ? "Entendido" : "Ahora no"}
        </Button>
        {modo === "android" ? (
          <Button size="md" onClick={() => void instalar()}>
            Agregar
          </Button>
        ) : null}
      </Flex>
    </Box>
  );
}
