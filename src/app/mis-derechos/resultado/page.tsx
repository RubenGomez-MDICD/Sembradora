"use client";

import NextLink from "next/link";
import { Button, Stack, Text } from "@chakra-ui/react";
import { ChevronRight, ClipboardList, ExternalLink } from "lucide-react";
import { Alert, DataList, EmptyState, Stat, notify } from "@/components/ds";
import { useGlosario } from "@/components/glosario";
import { crear } from "@/lib/db";
import { useFlujo } from "@/lib/db/use-flujo";
import { textoAntiguedad } from "@/lib/calculos/derechos";
import { formatFechaCorta, formatFechaLarga, formatMoney } from "@/lib/format";
import { FLUJO_DERECHOS, enlaceWhatsApp, resultadoDe, textoParaCompartir, type DatosDerechos } from "../flujo";
import { Paso } from "@/components/paso";

const PROFEDET = "https://www.gob.mx/profedet";

/** Figma: DR-2 · Lo que te toca, DR-2b (con el mínimo), DR-2L (liquidación) y DR-2F (finiquito). Paso 3 de 4. */
export default function Resultado() {
  const { datos } = useFlujo<DatosDerechos>(FLUJO_DERECHOS);
  const { abrir } = useGlosario();

  if (datos === null) return <Paso paso={3} backHref="/mis-derechos/datos">{null}</Paso>;

  const r = resultadoDe(datos);
  if (!r) {
    return (
      <Paso paso={3} backHref="/mis-derechos/datos">
        <EmptyState icon={ClipboardList} title="Faltan algunos datos" description="Para calcular lo que te toca necesitamos tu sueldo por día, desde cuándo trabajas y si sigues ahí.">
          <Button size="lg" asChild>
            <NextLink href="/mis-derechos/datos">Completar mis datos</NextLink>
          </Button>
        </EmptyState>
      </Paso>
    );
  }

  const sueldo = formatMoney(r.sueldoDiario);
  const anios = r.antiguedad.anios ? `${r.antiguedad.anios} ${r.antiguedad.anios === 1 ? "año" : "años"}` : "menos de un año";
  const ultimo = datos.ultimoDia ? formatFechaCorta(datos.ultimoDia) : "";

  const titulo =
    r.situacion === "despido" ? "Si te despidieron sin causa, te deben" : r.situacion === "renuncia" ? "Aunque te fuiste, te toca tu finiquito" : r.bajoMinimo ? "Cada año te tocan, con el mínimo de ley" : "Cada año te tocan";

  const ayuda =
    r.situacion === "despido"
      ? `Con ${sueldo} al día, ${textoAntiguedad(r.antiguedad)} trabajando y último día el ${ultimo}.`
      : r.situacion === "renuncia"
        ? `Con ${sueldo} al día y último día el ${ultimo}. Más los días que no te hayan pagado.`
        : r.bajoMinimo
          ? `Con lo que te pagan hoy (${sueldo} al día) serían ${formatMoney(r.totalConSueldoActual ?? 0)}. La diferencia también se puede reclamar.`
          : `Con ${sueldo} al día y ${anios} trabajando. Las vacaciones se pagan con tu sueldo de siempre; aguinaldo y prima son extra.`;

  const guardar = async () => {
    try {
      await crear("calculos", { tipo: "derechos", entrada: { ...datos }, resultado: { ...r } });
      notify({ title: "Se guardaron tus cuentas en tu teléfono" });
    } catch {
      notify({ title: "No se pudieron guardar tus cuentas", status: "info" });
    }
  };

  const salio = r.situacion !== "sigue";
  const glosarioDe = (id?: string) => (id && !salio ? () => abrir(id) : undefined);

  return (
    <Paso paso={3} backHref="/mis-derechos/datos">
      <Stat label={titulo} value={formatMoney(r.total)} helpText={ayuda} />
      <DataList rows={r.renglones.map((x) => ({ label: x.etiqueta, value: formatMoney(x.monto), note: x.nota, onTermClick: glosarioDe(x.glosario) }))} />

      {r.situacion === "despido" ? (
        <Alert status="warning" title="Tienes 2 meses para reclamar">
          Desde tu último día (art. 518 LFT){r.limiteParaReclamar ? `: hasta el ${formatFechaLarga(r.limiteParaReclamar)}` : ""}. La PROFEDET te asesora gratis.
        </Alert>
      ) : r.situacion === "renuncia" ? (
        <Alert status="info" title="¿Y la prima de antigüedad?">
          Si renuncias, se paga solo cuando llevas 15 años o más en la casa (art. 162 LFT).
        </Alert>
      ) : (
        <Alert status="info" title="También tienes derecho al IMSS">
          Tus patrones deben registrarte. Te explicamos cómo platicarlo.
        </Alert>
      )}

      {salio ? (
        <Text textStyle="caption" color="content.muted">
          {r.situacion === "despido" ? "Montos aproximados. Si te deben días sin pagar o si hubo una causa justificada de despido, el cálculo cambia." : "Montos aproximados con la Ley Federal del Trabajo."}
          {r.bajoMinimo ? ` Calculado con el mínimo de ley (${formatMoney(r.base)} al día), porque te pagan menos.` : ""}
        </Text>
      ) : null}

      <Stack gap="2">
        {salio ? (
          <>
            <Button size="lg" asChild>
              <a href={PROFEDET} target="_blank" rel="noreferrer">
                Buscar asesoría gratis (PROFEDET) <ExternalLink aria-hidden />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href={enlaceWhatsApp(textoParaCompartir(r, titulo))} target="_blank" rel="noreferrer">
                Mandar mis cuentas por WhatsApp
              </a>
            </Button>
          </>
        ) : (
          <>
            <Button size="lg" asChild>
              <NextLink href="/mis-derechos/platicarlo">
                Cómo platicarlo con mis patrones <ChevronRight aria-hidden />
              </NextLink>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <NextLink href="/mis-derechos/imss">Qué es el IMSS</NextLink>
            </Button>
          </>
        )}
        <Button size="lg" variant="ghost" onClick={guardar}>
          Guardar mis cuentas
        </Button>
      </Stack>
    </Paso>
  );
}
