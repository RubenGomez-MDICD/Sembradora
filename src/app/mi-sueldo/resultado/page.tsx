"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Button, Stack, Text } from "@chakra-ui/react";
import { ClipboardList, Coins, Scale, Users } from "lucide-react";
import { Alert, DataList, EmptyState, LinkCard, notify } from "@/components/ds";
import { Paso } from "@/components/paso";
import { comparar } from "@/lib/calculos/sueldo";
import { useFlujo } from "@/lib/db/use-flujo";
import { formatMoney } from "@/lib/format";
import { FLUJO_SUELDO, pagoPorDia, resultadoDe, type DatosSueldo } from "../flujo";
import { guardarCalculo } from "../ultimo";

/** Figma: MS-4a · Qué hacer (sueldo menor) y MS-4b · Qué hacer (sueldo justo). Paso 5 de 5. */
export default function Resultado() {
  const router = useRouter();
  const { datos } = useFlujo<DatosSueldo>(FLUJO_SUELDO);
  if (datos === null) return <Paso seccion="Mi sueldo" paso={5} total={5} backHref="/mi-sueldo/pago">{null}</Paso>;

  const r = resultadoDe(datos);
  const pago = pagoPorDia(datos);
  if (!r || !pago) {
    return (
      <Paso seccion="Mi sueldo" paso={5} total={5} backHref="/mi-sueldo/pago">
        <EmptyState icon={ClipboardList} title="Faltan algunos datos" description="Para comparar necesitamos tus tareas, tus días y cuánto te pagan.">
          <Button size="lg" asChild>
            <NextLink href={r ? "/mi-sueldo/pago" : "/mi-sueldo/tareas"}>Completar mis datos</NextLink>
          </Button>
        </EmptyState>
      </Paso>
    );
  }

  const c = comparar(r.porDia, pago);
  const guardar = async (irATarifa = false) => {
    try {
      await guardarCalculo(datos, r, pago);
      if (irATarifa) router.push("/mi-sueldo/tarifa");
      else notify({ title: "Se guardó tu cálculo en tu teléfono" });
    } catch {
      notify({ title: "No se pudo guardar tu cálculo", status: "info" });
    }
  };

  if (c.justo) {
    return (
      <Paso seccion="Mi sueldo" paso={5} total={5} backHref="/mi-sueldo/pago">
        <Alert status="success" title="Tu sueldo está dentro de lo justo">
          Te pagan {formatMoney(c.tePagan)} al día y lo que te toca es {formatMoney(c.teToca)}.
        </Alert>
        <DataList
          rows={[
            { label: "Te toca al día", value: formatMoney(c.teToca) },
            { label: "Te pagan al día", value: formatMoney(c.tePagan) },
          ]}
        />
        <Text color="content.muted">Guárdala como tu tarifa. Te sirve para platicar de tu sueldo con tus patrones o cuando te ofrezcan otra casa.</Text>
        <Button size="lg" onClick={() => guardar(true)}>
          Ver mi tarifa para compartir
        </Button>
        <LinkCard href="/mis-derechos" icon={Scale} eyebrow="Mis derechos" title="Revisa tus prestaciones" description="Aunque tu sueldo sea justo, también te tocan aguinaldo y vacaciones." />
        <Button size="lg" variant="ghost" asChild>
          <NextLink href="/">Volver al inicio</NextLink>
        </Button>
      </Paso>
    );
  }

  return (
    <Paso seccion="Mi sueldo" paso={5} total={5} backHref="/mi-sueldo/pago" titulo="Lo que puedes hacer" descripcion="Tú decides cómo seguir. Aquí tienes información y apoyos.">
      <DataList
        rows={[
          { label: "Te toca al día", value: formatMoney(c.teToca) },
          { label: "Te pagan al día", value: formatMoney(c.tePagan) },
          { label: "Diferencia", value: formatMoney(c.diferencia, { sign: "always" }), note: `${c.porcentajeMenos} % menos · ${formatMoney(-c.diferencia * r.dias)} a la semana (${r.dias} ${r.dias === 1 ? "día" : "días"})` },
        ]}
      />
      <Stack gap="3">
        <LinkCard href="/mis-derechos" icon={Scale} eyebrow="Mis derechos" title="Conoce tus derechos" description="Aguinaldo, vacaciones y el IMSS." />
        <LinkCard href="/mi-sueldo/platicarlo" icon={Users} eyebrow="Conversarlo" title="Cómo platicar de tu sueldo" description="Una guía y lo que puedes decir." />
        <LinkCard href="/mis-derechos/contrato" icon={Coins} eyebrow="Calculadora" title="Calcula tus prestaciones" description="Lo que te corresponde por ley." />
      </Stack>
      <Stack gap="2">
        <Button size="lg" variant="outline" onClick={() => guardar()}>
          Guardar mi cálculo
        </Button>
        <Button size="lg" variant="ghost" asChild>
          <NextLink href="/">Volver al inicio</NextLink>
        </Button>
      </Stack>
    </Paso>
  );
}
