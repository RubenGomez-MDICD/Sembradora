"use client";

import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Box, Button, Flex, LinkBox, LinkOverlay, Stack, Text } from "@chakra-ui/react";
import { Calendar, ChevronRight, CloudUpload, Info, Lock, MessageCircle, Scale, Smartphone } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Alert, FeatureItem, LinkCard } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import { compartirODescargar } from "@/lib/compartir";
import { guardarAjuste } from "@/lib/db";
import { useRegistro } from "@/lib/db/hooks";
import { archivoDeRespaldo, nuevoCodigo, subirRespaldo } from "@/lib/respaldo";

const fecha = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });

/** Tarjeta que es un botón (las de Card son enlaces). */
function Opcion({ icon: Icon, eyebrow, title, description, onClick, cargando }: { icon: typeof Smartphone; eyebrow?: string; title: string; description: string; onClick: () => void; cargando?: boolean }) {
  return (
    <LinkBox as="article" bg="surface.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="l3" p="4" _hover={{ bg: "surface.subtle" }} aria-busy={cargando}>
      <Flex gap="3" align="center">
        <Flex flexShrink="0" w="10" h="10" borderRadius="full" bg="brand.primary.subtle" color="brand.primary.fg" align="center" justify="center">
          <Icon size={20} aria-hidden />
        </Flex>
        <Stack gap="0.5" flex="1">
          {eyebrow ? (
            <Text textStyle="overline" color="content.subtle">
              {eyebrow}
            </Text>
          ) : null}
          <LinkOverlay asChild>
            <button type="button" onClick={onClick} disabled={cargando} style={{ textAlign: "left" }}>
              <Text as="span" textStyle="h4">
                {cargando ? "Un momento…" : title}
              </Text>
            </button>
          </LinkOverlay>
          <Text textStyle="bodySm" color="content.muted">
            {description}
          </Text>
        </Stack>
        <Box color="content.muted">
          <ChevronRight size={20} aria-hidden />
        </Box>
      </Flex>
    </LinkBox>
  );
}

/** Figma: MD-8 · Tu respaldo y MD-8f · Archivo guardado */
export default function Respaldo() {
  const router = useRouter();
  const codigo = useRegistro("ajustes", "respaldoCodigo");
  const ultimo = useRegistro("ajustes", "ultimoRespaldo");
  const [archivo, setArchivo] = useState<{ nombre: string; movimientos: number; blob: Blob } | null>(null);
  const [creando, setCreando] = useState(false);

  const crearCodigo = async () => {
    setCreando(true);
    const c = nuevoCodigo();
    await guardarAjuste("respaldoCodigo", c);
    try {
      await subirRespaldo(c);
    } catch {
      /* la pantalla del código explica qué pasó y deja reintentar */
    }
    router.push("/mi-dinero/respaldo/codigo");
  };

  const guardarArchivo = async () => {
    const a = await archivoDeRespaldo();
    const r = await compartirODescargar(a.blob, a.nombre, "Respaldo de La sembradora");
    if (r === "cancelado") return;
    setArchivo(a);
  };

  if (archivo) {
    return (
      <>
        <AppHeader type="back" title="Tu respaldo" meta="Archivo" backHref="/mi-dinero" />
        <Screen>
          <Alert status="success" title="Se guardó tu archivo" live>
            {archivo.nombre} · {archivo.movimientos} {archivo.movimientos === 1 ? "movimiento" : "movimientos"}
          </Alert>
          <Stack as="ul" gap="5" listStyleType="none" p="0" m="0">
            <li>
              <FeatureItem icon={MessageCircle} title="Mándatelo por WhatsApp" description="Así lo tienes aunque pierdas o cambies el teléfono." />
            </li>
            <li>
              <FeatureItem icon={Smartphone} title="Para recuperarlo" description="En el otro teléfono entra a Tu respaldo y elige «Usar un archivo de respaldo». Funciona sin internet." />
            </li>
            <li>
              <FeatureItem icon={Calendar} title="Guárdalo de nuevo de vez en cuando" description="El archivo tiene lo que anotaste hasta hoy." />
            </li>
          </Stack>
          <Stack gap="2">
            <Button size="lg" onClick={() => void compartirODescargar(archivo.blob, archivo.nombre, "Respaldo de La sembradora")}>
              Mandar por WhatsApp
            </Button>
            <Button size="lg" variant="ghost" onClick={() => setArchivo(null)}>
              Listo
            </Button>
          </Stack>
        </Screen>
      </>
    );
  }

  const valor = typeof codigo?.valor === "string" ? codigo.valor : null;
  const cuando = typeof ultimo?.valor === "string" ? fecha.format(new Date(ultimo.valor)) : null;

  return (
    <>
      <AppHeader type="back" title="Mi dinero" meta="Tu respaldo" backHref="/mi-dinero" />
      <Screen>
        <PageTitle title="Tu respaldo">Para no perder lo que anotas si cambias de teléfono.</PageTitle>
        {valor ? (
          <Alert status="success" title="Tienes un código de respaldo">
            {cuando ? `Último respaldo: ${cuando}. Se actualiza solo cuando tengas internet.` : "Todavía no se sube. Se intenta de nuevo cuando tengas internet."}
          </Alert>
        ) : (
          <Alert status="warning" title="Tus datos solo están en este teléfono">
            Si borras los datos del navegador o cambias de teléfono, se pierden.
          </Alert>
        )}
        <Stack gap="3">
          {valor ? (
            <LinkCard href="/mi-dinero/respaldo/codigo" icon={CloudUpload} title="Ver mi código" description="Para anotarlo de nuevo o actualizar el respaldo." />
          ) : (
            <Opcion icon={CloudUpload} eyebrow="Recomendado" title="Crear un código de respaldo" description="Con el código recuperas todo en otro teléfono." onClick={crearCodigo} cargando={creando} />
          )}
          <Opcion icon={Smartphone} title="Guardar un archivo" description="Descárgalo y mándatelo por WhatsApp. No usa internet después." onClick={guardarArchivo} />
        </Stack>
        <Stack as="ul" gap="5" listStyleType="none" p="0" m="0">
          <li>
            <FeatureItem icon={Scale} title="Nadie más puede leerlo" description="Con el código, tus datos se cifran en tu teléfono antes de guardarse." />
          </li>
          <li>
            <FeatureItem icon={Info} title="Sin nombre ni número" description="El respaldo no está ligado a ningún dato personal. El archivo no va cifrado: guárdalo donde solo tú lo veas." />
          </li>
        </Stack>
        <LinkCard href="/mi-dinero/pin" icon={Lock} title="¿Compartes este teléfono?" description="Pon un PIN para que solo tú veas Mi dinero." />
        <Button size="lg" variant="ghost" asChild>
          <NextLink href="/mi-dinero/respaldo/recuperar">Ya tengo un código: recuperar</NextLink>
        </Button>
      </Screen>
    </>
  );
}
