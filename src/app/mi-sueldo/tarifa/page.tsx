"use client";

import { useState } from "react";
import NextLink from "next/link";
import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { ClipboardList } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { EmptyState, notify } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import { SALARIO_MINIMO } from "@/content/datos-de-ley";
import type { ResultadoSueldo, Tramo } from "@/lib/calculos/sueldo";
import { compartirODescargar, tarjetaComoImagen } from "@/lib/compartir";
import { useBorrador } from "@/lib/db/hooks";
import { formatMoney } from "@/lib/format";
import { enlaceWhatsApp } from "@/app/mis-derechos/flujo";
import { FLUJO_SUELDO, resultadoDe, textoDias, textoTarifa, type DatosSueldo } from "../flujo";
import { useUltimoCalculo } from "../ultimo";

const renglon = (t: Tramo) => `${t.dias} ${t.dias === 1 ? "día" : "días"} · ${t.nombre}${t.especializada ? " (especializada)" : ""}`;

/** Figma: MS-5 · Tu tarifa para compartir. Usa el cálculo en curso o, si no hay, el último guardado. */
export default function Tarifa() {
  const borrador = useBorrador(FLUJO_SUELDO) as DatosSueldo | undefined;
  const ultimo = useUltimoCalculo();
  const [creando, setCreando] = useState(false);
  const enCurso = borrador ? resultadoDe(borrador) : null;
  const guardado = ultimo?.resultado ? ({ porDia: ultimo.resultado.sueldoDiario, ...ultimo.resultado } as unknown as ResultadoSueldo) : null;
  const r = enCurso ?? guardado;

  if (borrador === undefined || ultimo === undefined) return <AppHeader type="back" title="Mi sueldo" meta="Tu tarifa" backHref="/mi-sueldo" />;

  if (!r) {
    return (
      <>
        <AppHeader type="back" title="Mi sueldo" meta="Tu tarifa" backHref="/mi-sueldo" />
        <Screen>
          <EmptyState icon={ClipboardList} title="Todavía no calculas tu tarifa" description="Son 5 pasos cortos y se guarda en tu teléfono.">
            <Button size="lg" asChild>
              <NextLink href="/mi-sueldo/tareas">Calcular mi tarifa</NextLink>
            </Button>
          </EmptyState>
        </Screen>
      </>
    );
  }

  const imagen = async () => {
    setCreando(true);
    try {
      const png = await tarjetaComoImagen({
        eyebrow: "Tarifa por día",
        titulo: `${formatMoney(r.porDia)} al día`,
        lineas: [`${r.horas} horas al día, ${textoDias(r.dias)} · ${formatMoney(r.porSemana)} a la semana`, ...r.tramos.map((t) => `${renglon(t)}: ${formatMoney(t.diario)} al día`)],
        pie: `Tabulador de Salario Digno de CACEH (2024). Lo menos por ley: ${formatMoney(SALARIO_MINIMO.trabajoDelHogar)} al día (CONASAMI ${SALARIO_MINIMO.anio}).`,
      });
      const res = await compartirODescargar(png, "mi-tarifa.png", "Mi tarifa");
      if (res === "descargado") notify({ title: "Se descargó la imagen" });
    } catch {
      notify({ title: "No se pudo crear la imagen", status: "info" });
    } finally {
      setCreando(false);
    }
  };

  return (
    <>
      <AppHeader type="back" title="Mi sueldo" meta="Tu tarifa" backHref="/mi-sueldo" />
      <Screen>
        <PageTitle title="Tu tarifa para compartir">Muéstrala o mándala por WhatsApp. Explica de dónde sale cada parte.</PageTitle>
        <Box as="article" bg="surface.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="l3" p="5">
          <Text textStyle="overline" color="brand.primary.fg">
            Tarifa por día
          </Text>
          <Text textStyle="display">{formatMoney(r.porDia)}</Text>
          <Text textStyle="bodySm" color="content.muted" mb="4">
            {r.horas} horas al día, {textoDias(r.dias)} · {formatMoney(r.porSemana)} a la semana
          </Text>
          <Stack as="dl" gap="2" borderTopWidth="1px" borderColor="border.subtle" pt="3">
            {r.tramos.map((t) => (
              <Flex key={t.tarea} justify="space-between" gap="3">
                <Text as="dt" textStyle="bodySm">
                  {renglon(t)}
                  {t.categoria ? (
                    <Text as="span" display="block" textStyle="caption" color="content.subtle">
                      Categoría {t.categoria} de CACEH
                    </Text>
                  ) : null}
                </Text>
                <Text as="dd" textStyle="label" flexShrink="0">
                  {formatMoney(t.diario)} al día
                </Text>
              </Flex>
            ))}
            {r.ajusteHoras ? (
              <Flex justify="space-between" gap="3">
                <Text as="dt" textStyle="bodySm">
                  {r.ajusteHoras > 0 ? `Horas extra (${r.horasExtraSemana} a la semana)` : `Jornada de ${r.horas} horas`}
                </Text>
                <Text as="dd" textStyle="label" flexShrink="0">
                  {formatMoney(r.ajusteHoras, { sign: "always" })} a la semana
                </Text>
              </Flex>
            ) : null}
          </Stack>
          <Box bg="surface.subtle" borderRadius="l2" p="3" mt="4">
            <Text textStyle="bodySm">Lo menos que te pueden pagar por ley: {formatMoney(SALARIO_MINIMO.trabajoDelHogar)} al día</Text>
            <Text textStyle="caption" color="content.muted">
              Salario mínimo para personas trabajadoras del hogar {SALARIO_MINIMO.anio} (CONASAMI).
            </Text>
          </Box>
        </Box>
        <Text textStyle="caption" color="content.muted">
          Cálculo con el Tabulador de Salario Digno de CACEH (2024): cada día cuenta con la tarea más especializada. La ley pide que el sueldo quede por escrito en un contrato (art. 331 Ter, LFT).
        </Text>
        <Stack gap="2">
          <Button size="lg" asChild>
            <a href={enlaceWhatsApp(textoTarifa(r))} target="_blank" rel="noreferrer">
              Mandar por WhatsApp
            </a>
          </Button>
          <Button size="lg" variant="outline" onClick={imagen} loading={creando} loadingText="Creando la imagen…">
            Descargar como imagen
          </Button>
          <Button size="lg" variant="ghost" asChild>
            <NextLink href="/">Volver al inicio</NextLink>
          </Button>
        </Stack>
      </Screen>
    </>
  );
}
