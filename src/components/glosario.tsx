"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import NextLink from "next/link";
import { Box, Button, Stack, Text, chakra } from "@chakra-ui/react";
import { BottomSheet } from "@/components/ds";
import { terminoPorId, type Termino } from "@/content/glosario";

/**
 * Glosario en contexto (Figma AP-1 y AP-2).
 * Cualquier pantalla puede abrir la explicación de una palabra en un Drawer
 * sin salir de donde está: `useGlosario().abrir("prima-vacacional")`.
 */
const Ctx = createContext<{ abrir: (id: string) => void } | null>(null);

export function GlosarioProvider({ children }: { children: React.ReactNode }) {
  const [actual, setActual] = useState<Termino | null>(null);
  const [abierto, setAbierto] = useState(false);
  const abrir = useCallback((id: string) => {
    const t = terminoPorId(id);
    if (!t) return;
    setActual(t);
    setAbierto(true);
  }, []);
  const valor = useMemo(() => ({ abrir }), [abrir]);

  return (
    <Ctx.Provider value={valor}>
      {children}
      {actual ? (
        <BottomSheet
          open={abierto}
          onOpenChange={setAbierto}
          eyebrow="Glosario"
          title={actual.palabra}
          footer={
            <>
              <Button size="lg" onClick={() => setAbierto(false)}>
                Entendido, regresar
              </Button>
              <Button size="lg" variant="ghost" asChild onClick={() => setAbierto(false)}>
                <NextLink href={`/aprende/glosario?t=${actual.id}`}>Ver más en el glosario</NextLink>
              </Button>
            </>
          }
        >
          <ExplicacionTermino termino={actual} />
        </BottomSheet>
      ) : null}
    </Ctx.Provider>
  );
}

export function useGlosario() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useGlosario necesita GlosarioProvider.");
  return c;
}

/** Texto completo de una palabra: se usa en el Drawer y en el glosario. */
export function ExplicacionTermino({ termino: t }: { termino: Termino }) {
  return (
    <Stack gap="3">
      <Text>
        <Text as="span" fontWeight="semibold">
          Cómo lo decimos:
        </Text>{" "}
        {t.dicho}.
      </Text>
      <Text>{t.texto}</Text>
      {t.ejemplo ? (
        <Box bg="surface.subtle" borderRadius="l2" px="3" py="2">
          <Text textStyle="bodySm">{t.ejemplo}</Text>
        </Box>
      ) : null}
      {t.fuente ? (
        <Text textStyle="caption" color="content.subtle">
          Fuente: {t.fuente}
        </Text>
      ) : null}
    </Stack>
  );
}

/**
 * Palabra con explicación dentro de un texto (AP-1). Se ve subrayada con puntos
 * y abre el Drawer. Es un botón para que funcione con teclado y lector de pantalla.
 */
export function PalabraGlosario({ id, children }: { id: string; children: React.ReactNode }) {
  const { abrir } = useGlosario();
  return (
    <chakra.button
      type="button"
      onClick={() => abrir(id)}
      aria-haspopup="dialog"
      display="inline"
      color="interactive.link"
      textDecoration="underline"
      textDecorationStyle="dotted"
      textUnderlineOffset="3px"
      font="inherit"
    >
      {children}
    </chakra.button>
  );
}
