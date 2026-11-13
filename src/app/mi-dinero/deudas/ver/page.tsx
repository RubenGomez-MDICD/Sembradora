"use client";

import { Suspense, useState } from "react";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Heading, Stack, Text } from "@chakra-ui/react";
import { SearchX } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Alert, BottomSheet, DataList, EmptyState, ProgressBar, Stat, TextField, notify } from "@/components/ds";
import { useGlosario } from "@/components/glosario";
import { Screen } from "@/components/screen";
import { detalleDeuda } from "@/lib/calculos/dinero";
import { actualizar, anotarPagoDeuda, borrar } from "@/lib/db";
import { useRegistro, useTabla } from "@/lib/db/hooks";
import { formatFechaCorta, formatFechaLarga, formatMoney, parsePesos } from "@/lib/format";
import { subtituloDeuda, textoFrecuencia } from "../../datos";

/** «Ya pagaste la mitad», «Llevas dos terceras partes». */
function avanceEnPalabras(p: number) {
  if (p >= 0.66) return "Llevas dos terceras partes.";
  if (p >= 0.5) return "Ya pagaste la mitad.";
  if (p >= 0.33) return "Llevas una tercera parte.";
  if (p > 0) return "Ya empezaste a pagar.";
  return "Todavía no anotas pagos.";
}

/** Figma: MD-17 (préstamo de una persona), MD-17t (tarjeta), MD-17r (abonos) y MD-18 (pago anotado). */
function Detalle() {
  const id = useSearchParams().get("id") ?? undefined;
  const deuda = useRegistro("deudas", id);
  const movimientos = useTabla("movimientos");
  const { abrir } = useGlosario();
  const [pagando, setPagando] = useState(false);
  const [monto, setMonto] = useState("");
  const [error, setError] = useState<string>();

  if (deuda === undefined || !movimientos) return <AppHeader type="back" title="Mi dinero" meta="Lo que debes" backHref="/mi-dinero/deudas" />;
  if (deuda === null) {
    return (
      <>
        <AppHeader type="back" title="Mi dinero" meta="Lo que debes" backHref="/mi-dinero/deudas" />
        <Screen>
          <EmptyState icon={SearchX} title="No encontramos esa deuda" description="Quizá la borraste o ya la terminaste de pagar.">
            <Button size="lg" asChild>
              <NextLink href="/mi-dinero/deudas">Ver lo que debes</NextLink>
            </Button>
          </EmptyState>
        </Screen>
      </>
    );
  }

  const d = detalleDeuda(deuda, movimientos);
  const tarjeta = deuda.tipo === "tarjeta";
  const tienda = deuda.tipo === "tienda";

  const pagar = async () => {
    const centavos = parsePesos(monto);
    if (!centavos) return setError("Escribe cuánto pagaste.");
    const previo = deuda.proximoPago;
    const pago = await anotarPagoDeuda(deuda.id, centavos);
    setPagando(false);
    notify({
      title: `Se anotó tu pago de ${formatMoney(centavos)}. También cuenta como gasto en Deudas.`,
      action: {
        label: "Deshacer",
        onClick: () => void Promise.all([borrar("movimientos", pago.id), previo ? actualizar("deudas", deuda.id, { proximoPago: previo }) : null]),
      },
    });
  };

  const ayuda = tarjeta
    ? `Hoy debes ${formatMoney(d.falta)}. El banco cobra intereses sobre lo que no pagues.`
    : tienda
      ? `De ${formatMoney(d.total)} en total a abonos. Llevas ${formatMoney(d.pagado)}.`
      : `De ${formatMoney(d.total)}. ${avanceEnPalabras(d.proporcion)}`;

  const filas = tarjeta
    ? [
        { label: "Pago mínimo", value: formatMoney(deuda.pagoPorPeriodo), note: deuda.proximoPago ? `Fecha límite: ${formatFechaCorta(deuda.proximoPago)}` : undefined, onTermClick: () => abrir("pago-minimo") },
        { label: "Pago para no generar intereses", value: formatMoney(d.falta), note: "Lo que gastaste en el mes" },
      ]
    : [
        { label: "Pagas", value: `${formatMoney(deuda.pagoPorPeriodo)} ${textoFrecuencia(deuda.frecuencia)}` },
        ...(deuda.proximoPago ? [{ label: "Próximo pago", value: formatFechaLarga(deuda.proximoPago).replace(/ de \d{4}$/, "") }] : []),
        ...(d.pagos ? [{ label: "Te faltan", value: `${d.pagos} ${tienda ? (d.pagos === 1 ? "abono" : "abonos") : d.pagos === 1 ? "pago" : "pagos"}`, note: d.termina ? `Terminas el ${formatFechaLarga(d.termina).replace(/ de \d{4}$/, "")} si pagas a tiempo.` : undefined }] : []),
      ];

  return (
    <>
      <AppHeader type="back" title="Mi dinero" meta="Lo que debes" backHref="/mi-dinero/deudas" />
      <Screen>
        <Stack gap="1">
          <Heading as="h1" textStyle="h1">
            {deuda.nombre}
          </Heading>
          <Text color="content.muted">{subtituloDeuda(deuda)}</Text>
        </Stack>
        {d.liquidada ? (
          <Alert status="success" title="¡Terminaste de pagar esta deuda!">
            Pagaste {formatMoney(d.total)}. Ya no aparece en Lo que debes.
          </Alert>
        ) : (
          <Stat tone="neutral" label="Te falta pagar" value={formatMoney(d.falta)} helpText={ayuda} />
        )}
        <ProgressBar label="Pagado" amount={`${formatMoney(d.pagado)} de ${formatMoney(d.total)}`} value={d.proporcion * 100} />
        <DataList rows={filas} />
        {tarjeta ? (
          <Alert status="warning" title="Si pagas solo el mínimo, la deuda dura más">
            Y pagas más intereses. Si puedes, paga un poco más que el mínimo cada mes.
          </Alert>
        ) : tienda ? (
          <Alert status="info" title="A abonos suele salir más caro">
            Compara el total que pagarás con el precio de contado antes de tu próxima compra.
          </Alert>
        ) : null}
        <Stack gap="2">
          {!d.liquidada ? (
            <Button
              size="lg"
              onClick={() => {
                setMonto(String(Math.min(deuda.pagoPorPeriodo, d.falta) / 100));
                setError(undefined);
                setPagando(true);
              }}
            >
              Anotar un pago
            </Button>
          ) : null}
          <Button size="lg" variant="ghost" asChild>
            <NextLink href={`/mi-dinero/deudas/nueva?id=${deuda.id}`}>Editar deuda</NextLink>
          </Button>
        </Stack>

        <BottomSheet
          open={pagando}
          onOpenChange={setPagando}
          eyebrow={deuda.nombre}
          title="¿Cuánto pagaste?"
          footer={
            <>
              <Button size="lg" onClick={pagar}>
                Anotar pago
              </Button>
              <Button size="lg" variant="ghost" onClick={() => setPagando(false)}>
                Cancelar
              </Button>
            </>
          }
        >
          <TextField label="Lo que pagaste" prefix="$" size="lg" inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} error={error} helperText="También se anota como gasto en Deudas, con la fecha de hoy." />
        </BottomSheet>
      </Screen>
    </>
  );
}

export default function VerDeuda() {
  return (
    <Suspense>
      <Detalle />
    </Suspense>
  );
}
