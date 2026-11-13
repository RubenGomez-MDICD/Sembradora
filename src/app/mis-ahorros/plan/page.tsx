"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Box, Button, Flex, Stack, Text, VisuallyHidden } from "@chakra-ui/react";
import { ClipboardList, HeartPulse, Users } from "lucide-react";
import { EmptyState, LinkCard, Stat, notify } from "@/components/ds";
import { Paso } from "@/components/paso";
import { crecimiento, mitadDelPlazo, planDeAhorro, textoPeriodos, textoPlazo, type Plan } from "@/lib/calculos/ahorro";
import { crear, descartarBorrador } from "@/lib/db";
import { useFlujo } from "@/lib/db/use-flujo";
import { diaISO } from "@/lib/fechas";
import { formatMoney, parsePesos } from "@/lib/format";
import { FLUJO_AHORROS, nombreDeMeta, type DatosMeta } from "../flujo";

/** Gráfica «Así crece tu ahorro» (AH-3): barras desde cero, la primera es hoy. */
function Crecimiento({ plan, monto, plazoTexto, mitad }: { plan: Plan; monto: number; plazoTexto: string; mitad: string }) {
  const puntos = crecimiento(plan, monto);
  const unidad = plan.frecuencia === "semana" ? "Semana" : "Mes";
  return (
    <Box as="figure" m="0" bg="surface.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="l3" p="4">
      <Text as="figcaption" textStyle="label" mb="3">
        Así crece tu ahorro
      </Text>
      <Flex align="flex-end" gap="1.5" h="28" aria-hidden>
        {puntos.map((p, i) => (
          <Box key={p.periodo} flex="1" h={`${Math.max(4, (p.acumulado / monto) * 100)}%`} bg={i === 0 ? "brand.primary.solid" : "brand.primary.muted"} borderTopRadius="sm" />
        ))}
      </Flex>
      <Flex justify="space-between" mt="2" textStyle="caption" color="content.muted" aria-hidden>
        <span>Hoy</span>
        {puntos.length > 2 ? <span>{mitad}</span> : null}
        <span>
          {plazoTexto} · {formatMoney(monto)}
        </span>
      </Flex>
      <VisuallyHidden>
        <table>
          <caption>Lo que llevarías ahorrado</caption>
          <tbody>
            {puntos.map((p) => (
              <tr key={p.periodo}>
                <th scope="row">
                  {unidad} {p.periodo}
                </th>
                <td>{formatMoney(p.acumulado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </VisuallyHidden>
    </Box>
  );
}

/** Figma: AH-3 · Tu plan (paso 3 de 3) */
export default function TuPlan() {
  const router = useRouter();
  const { datos } = useFlujo<DatosMeta>(FLUJO_AHORROS);
  if (datos === null) return <Paso seccion="Mis ahorros" paso={3} total={3} backHref="/mis-ahorros/plazo">{null}</Paso>;

  const monto = parsePesos(datos.monto);
  const plazo = Number(datos.plazo);
  const unidad = datos.unidad ?? "anios";
  const frecuencia = datos.frecuencia ?? "semana";
  const { nombre, icono } = nombreDeMeta(datos);

  if (!monto || !(plazo > 0) || !nombre) {
    return (
      <Paso seccion="Mis ahorros" paso={3} total={3} backHref="/mis-ahorros/plazo">
        <EmptyState icon={ClipboardList} title="Faltan algunos datos" description="Para armar tu plan necesitamos tu meta, cuánto necesitas y para cuándo.">
          <Button size="lg" asChild>
            <NextLink href={nombre ? "/mis-ahorros/plazo" : "/mis-ahorros/meta"}>Completar mi meta</NextLink>
          </Button>
        </EmptyState>
      </Paso>
    );
  }

  const plan = planDeAhorro(monto, plazo, unidad, frecuencia);
  const plazoTexto = textoPlazo(plazo, unidad);

  const guardar = async () => {
    await crear("metas", { nombre, icono, clase: datos.clase, montoObjetivo: monto, plazo, unidad, frecuenciaAporte: frecuencia, inicio: diaISO(new Date()), aportado: 0 });
    await descartarBorrador(FLUJO_AHORROS);
    notify({ title: `Se guardó tu meta: ${nombre}` });
    router.push("/mis-ahorros");
  };

  return (
    <Paso seccion="Mis ahorros" paso={3} total={3} backHref="/mis-ahorros/plazo">
      <Stat label={frecuencia === "semana" ? "Aparta cada semana" : "Aparta cada mes"} value={formatMoney(plan.aporte)} helpText={`Para juntar ${formatMoney(monto)} en ${plazoTexto} (${textoPeriodos(plan.periodos, frecuencia)})`} />
      <Crecimiento plan={plan} monto={monto} plazoTexto={plazoTexto} mitad={mitadDelPlazo(plazo, unidad)} />
      <Stack gap="3">
        <LinkCard href="/mis-ahorros/tandas" icon={Users} eyebrow="Mis ahorros" title="Las tandas" description="Cómo usarlas para tu meta." />
        {datos.clase !== "emergencias" ? <LinkCard href="/mis-ahorros/emergencias" icon={HeartPulse} eyebrow="Mis ahorros" title="Para emergencias" description="Aparta también un poco para apuros." /> : null}
      </Stack>
      <Stack gap="2">
        <Button size="lg" onClick={guardar}>
          Guardar mi meta
        </Button>
        <Button size="lg" variant="ghost" asChild>
          <NextLink href="/mis-ahorros/plazo">Cambiar monto o plazo</NextLink>
        </Button>
      </Stack>
    </Paso>
  );
}
