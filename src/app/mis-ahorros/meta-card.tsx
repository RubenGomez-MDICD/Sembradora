"use client";

import { useState } from "react";
import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { BottomSheet, ProgressBar, TextField, notify } from "@/components/ds";
import { actualizar, borrar, restaurar } from "@/lib/db";
import type { Meta, Tanda } from "@/lib/db/tipos";
import { avanceDeMeta, textoPeriodos } from "@/lib/calculos/ahorro";
import { diaISO } from "@/lib/fechas";
import { formatFechaCorta, formatMoney, parsePesos } from "@/lib/format";
import { icono } from "@/lib/iconos";

/**
 * Tarjeta «Tu meta» de Mis ahorros (AH-0 y AH-6).
 * Agrega «Anotar lo que apartaste»: sin eso, el avance sería una suposición.
 */
export function MetaCard({ meta, tandas }: { meta: Meta; tandas: Tanda[] }) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string>();
  const Icono = icono(meta.icono);
  const a = avanceDeMeta(meta, tandas.filter((t) => t.metaId === meta.id), diaISO(new Date()));
  const aporte = formatMoney(a.plan.aporte);
  const cada = a.plan.frecuencia === "semana" ? "a la semana" : "al mes";

  let nota: string;
  if (a.completa) nota = "¡Lo lograste! Juntaste lo de tu meta.";
  else if (a.periodosPasados === 0) nota = `Tu plan: apartar ${aporte} ${cada}.`;
  else if (a.alDia) nota = `Vas bien: ${textoPeriodos(a.periodosPasados, a.plan.frecuencia)} apartando ${aporte}.`;
  else nota = `Para ir al día te faltan ${formatMoney(a.faltaParaAlDia)}. Tu plan: ${aporte} ${cada}.`;
  if (a.proximaTanda) nota += ` Tu tanda suma ${formatMoney(a.proximaTanda.bolsa)} alrededor del ${formatFechaCorta(a.proximaTanda.fecha)}.`;

  const anotar = async () => {
    const monto = parsePesos(texto);
    if (!monto) return setError("Escribe cuánto apartaste, por ejemplo 200.");
    await actualizar("metas", meta.id, { aportado: meta.aportado + monto });
    setAbierto(false);
    setTexto("");
    notify({ title: `Se anotó: ${formatMoney(monto)} para ${meta.nombre}`, action: { label: "Deshacer", onClick: () => void actualizar("metas", meta.id, { aportado: meta.aportado }) } });
  };

  const quitar = async () => {
    setAbierto(false);
    await borrar("metas", meta.id);
    notify({ title: `Se borró la meta ${meta.nombre}`, status: "danger", action: { label: "Deshacer", onClick: () => void restaurar("metas", meta.id) } });
  };

  return (
    <Box as="article" bg="surface.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="l3" p="4">
      <Flex gap="4" align="center" mb="4">
        <Flex flexShrink="0" w="16" h="16" borderRadius="l2" borderWidth="1px" borderStyle="dashed" borderColor="brand.secondary.solid" bg="brand.secondary.subtle" color="brand.secondary.fg" align="center" justify="center">
          <Icono size={24} aria-hidden />
        </Flex>
        <Stack gap="0.5">
          <Text textStyle="overline" color="content.subtle">
            Tu meta
          </Text>
          <Text as="h2" textStyle="h4">
            {meta.nombre}
          </Text>
        </Stack>
      </Flex>
      <ProgressBar label={`Llevas ${formatMoney(a.llevas)} de ${formatMoney(meta.montoObjetivo)}`} amount={`${Math.round(a.proporcion * 100)} %`} value={a.proporcion * 100} />
      <Text textStyle="caption" color="content.muted" mt="2">
        {nota}
      </Text>
      <Button variant="outline" size="md" w="full" mt="3" onClick={() => setAbierto(true)}>
        Anotar lo que aparté
      </Button>

      <BottomSheet
        open={abierto}
        onOpenChange={setAbierto}
        eyebrow={meta.nombre}
        title="¿Cuánto apartaste?"
        footer={
          <>
            <Button size="lg" onClick={anotar}>
              Anotar
            </Button>
            <Button size="lg" variant="ghost" colorPalette="danger" onClick={quitar}>
              Borrar esta meta
            </Button>
          </>
        }
      >
        <TextField
          label="Lo que apartaste"
          prefix="$"
          size="lg"
          inputMode="decimal"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setError(undefined);
          }}
          error={error}
          helperText={`Tu plan: ${aporte} ${cada}.`}
        />
      </BottomSheet>
    </Box>
  );
}
