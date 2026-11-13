"use client";

import NextLink from "next/link";
import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { CreditCard, Plus } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { DebtCard, EmptyState, Stat } from "@/components/ds";
import { Screen } from "@/components/screen";
import { resumenDeudas } from "@/lib/calculos/dinero";
import { useTabla } from "@/lib/db/hooks";
import { formatMoney } from "@/lib/format";
import { icono } from "@/lib/iconos";
import { textoProximo, tipoDeuda } from "../datos";

/** Figma: MD-15 · Lo que debes */
export default function Deudas() {
  const deudas = useTabla("deudas");
  const movimientos = useTabla("movimientos");
  if (!deudas || !movimientos) return <AppHeader type="back" title="Mi dinero" meta="Lo que debes" backHref="/mi-dinero" />;
  const r = resumenDeudas(deudas, movimientos);

  return (
    <>
      <AppHeader type="back" title="Mi dinero" meta="Lo que debes" backHref="/mi-dinero" />
      <Screen>
        {r.activas.length ? (
          <>
            <Stat tone="neutral" label="Debes en total" value={formatMoney(r.total)} helpText={r.estaSemana ? `Esta semana te toca pagar ${formatMoney(r.estaSemana)}.` : "Esta semana no te toca pagar."} />
            {r.alMes ? (
              <Box bg="surface.subtle" borderRadius="l3" p="4">
                <Text textStyle="label">Pagas unos {formatMoney(Math.round(r.alMes / 10000) * 10000)} al mes en deudas</Text>
                <Text textStyle="bodySm" color="content.muted">
                  {r.proporcionDelIngreso !== null
                    ? `Es el ${Math.round(r.proporcionDelIngreso * 100)} % de lo que te entra al mes. Si pasa de un tercio, conviene no pedir más prestado.`
                    : "Cuando anotes lo que te entra, te decimos qué parte de tu dinero se va en deudas. Si pasa de un tercio, conviene no pedir más prestado."}
                </Text>
              </Box>
            ) : null}
            <Stack as="ul" gap="3" listStyleType="none" p="0" m="0">
              {r.activas.map((d) => (
                <li key={d.deuda.id}>
                  <DebtCard
                    href={`/mi-dinero/deudas/ver?id=${d.deuda.id}`}
                    title={d.deuda.nombre}
                    kind={d.deuda.tipo === "tienda" ? "Crédito en tienda, en abonos" : tipoDeuda(d.deuda.tipo).label}
                    owedCents={d.falta}
                    paidCents={d.pagado}
                    totalCents={d.total}
                    next={textoProximo(d.deuda)}
                    icon={icono(tipoDeuda(d.deuda.tipo).icono)}
                  />
                </li>
              ))}
            </Stack>
          </>
        ) : (
          <EmptyState icon={CreditCard} title="No tienes deudas anotadas" description="Anota lo que debes para saber cuánto te falta y cuándo te toca pagar.">
            {null}
          </EmptyState>
        )}
        <Button size="lg" asChild>
          <NextLink href="/mi-dinero/deudas/nueva">
            <Plus aria-hidden /> Anotar una deuda
          </NextLink>
        </Button>
      </Screen>
    </>
  );
}
