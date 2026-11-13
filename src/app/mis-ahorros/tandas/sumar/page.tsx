"use client";

import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Button, Stack, Text } from "@chakra-ui/react";
import { Alert, DateField, SaveStatus, Segmented, SelectField, Stat, TextField, notify } from "@/components/ds";
import { AppHeader } from "@/components/app-header";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import { cobroDeTanda } from "@/lib/calculos/ahorro";
import { crear, descartarBorrador } from "@/lib/db";
import type { Frecuencia } from "@/lib/db/tipos";
import { useTabla } from "@/lib/db/hooks";
import { useFlujo } from "@/lib/db/use-flujo";
import { formatFechaCorta, formatMoney, parsePesos } from "@/lib/format";
import { icono } from "@/lib/iconos";

const FLUJO_TANDA = "tanda";
type DatosTanda = { monto?: string; frecuencia?: Frecuencia; personas?: string; turno?: string; inicio?: string; metaId?: string };

const NUMEROS = ["", "Una", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve", "Diez", "Once", "Doce", "Trece", "Catorce", "Quince"];
const PERIODO = { semana: "semana", quincena: "quincena", mes: "mes" } as const;

/** Figma: AH-5 · Suma tu tanda. Al guardar regresa a Mis ahorros con el aviso de AH-6. */
export default function SumarTanda() {
  const router = useRouter();
  const { datos, cambiar, estado, reintentar } = useFlujo<DatosTanda>(FLUJO_TANDA);
  const metas = useTabla("metas");
  const [errores, setErrores] = useState<Partial<Record<keyof DatosTanda, string>>>({});
  const d = datos ?? {};
  const frecuencia = d.frecuencia ?? "semana";
  const monto = parsePesos(d.monto);
  const personas = Number(d.personas);
  const turno = Number(d.turno);
  const listo = monto && personas >= 2 && turno >= 1 && turno <= personas && d.inicio;
  const cobro = listo ? cobroDeTanda({ monto, personas, turno, frecuencia, inicio: d.inicio! }) : null;
  const metaId = d.metaId ?? metas?.[0]?.id ?? "";
  const meta = metas?.find((m) => m.id === metaId);

  const set = (k: keyof DatosTanda, v: string) => {
    setErrores((e) => ({ ...e, [k]: undefined }));
    cambiar({ [k]: v } as Partial<DatosTanda>);
  };

  const sumar = async () => {
    const e: typeof errores = {};
    if (!monto) e.monto = "Escribe cuánto das, por ejemplo 500.";
    if (!(personas >= 2)) e.personas = "Una tanda es de 2 personas o más.";
    if (!(turno >= 1) || turno > personas) e.turno = personas >= 2 ? `Elige un número del 1 al ${personas}.` : "Escribe tu número.";
    if (!d.inicio) e.inicio = "Elige el día en que empezó.";
    setErrores(e);
    if (Object.keys(e).length || !monto || !meta) return;
    await crear("tandas", { monto, frecuencia, personas, turno, inicio: d.inicio!, metaId: meta.id });
    await descartarBorrador(FLUJO_TANDA);
    notify({ title: `Se sumó tu tanda a ${meta.nombre}` });
    router.push("/mis-ahorros");
  };

  return (
    <>
      <AppHeader type="back" title="Mis ahorros" meta="Tu tanda" backHref="/mis-ahorros/tandas" />
      <Screen>
        <PageTitle title="Suma tu tanda a una meta">Con estos datos calculamos cuándo te toca y cuánto recibes.</PageTitle>
        <TextField label="¿Cuánto das cada vez?" prefix="$" inputMode="decimal" value={d.monto ?? ""} onChange={(e) => set("monto", e.target.value)} error={errores.monto} />
        <Stack gap="2">
          <Text textStyle="label">¿Cada cuánto das?</Text>
          <Segmented
            label="¿Cada cuánto das?"
            value={frecuencia}
            onValueChange={(e) => cambiar({ frecuencia: (e.value ?? "semana") as Frecuencia })}
            items={[
              // Etiquetas cortas: con «Cada…» no caben tres opciones en un teléfono de 360 px.
              { value: "semana", label: "Semana" },
              { value: "quincena", label: "Quincena" },
              { value: "mes", label: "Mes" },
            ]}
          />
        </Stack>
        <TextField label="¿Cuántas personas son?" suffix="personas" inputMode="numeric" value={d.personas ?? ""} onChange={(e) => set("personas", e.target.value.replace(/\D/g, ""))} error={errores.personas} />
        <TextField label="¿Qué número te tocó?" inputMode="numeric" value={d.turno ?? ""} onChange={(e) => set("turno", e.target.value.replace(/\D/g, ""))} error={errores.turno} helperText="Es tu turno para recibir." />
        <DateField label="¿Cuándo empezó?" value={d.inicio ?? ""} onChange={(e) => set("inicio", e.target.value)} error={errores.inicio} />

        {cobro ? (
          <Stat
            label="Te tocan"
            value={formatMoney(cobro.bolsa)}
            helpText={`En la ${PERIODO[frecuencia]} ${cobro.ronda}, alrededor del ${formatFechaCorta(cobro.fecha)}. ${NUMEROS[personas] ?? personas} ${personas === 1 ? "persona" : "personas"} por ${formatMoney(monto!)} cada una.`}
          />
        ) : null}

        {metas === undefined ? null : metas.length ? (
          <SelectField label="¿A qué meta la sumas?" icon={icono(meta?.icono)} value={metaId} onChange={(e) => cambiar({ metaId: e.target.value })} options={metas.map((m) => ({ value: m.id, label: m.nombre }))} />
        ) : (
          <Alert status="info" title="Todavía no tienes una meta">
            Crea primero tu meta; tus datos de la tanda se quedan guardados para cuando regreses.
          </Alert>
        )}

        <Stack gap="2">
          {metas && !metas.length ? (
            <Button size="lg" asChild>
              <NextLink href="/mis-ahorros/meta">Crear una meta</NextLink>
            </Button>
          ) : (
            <Button size="lg" onClick={sumar}>
              Sumar a mi meta
            </Button>
          )}
          <Button size="lg" variant="ghost" asChild>
            <NextLink href="/mis-ahorros/tandas">Atrás</NextLink>
          </Button>
        </Stack>
        {estado ? <SaveStatus status={estado} onRetry={reintentar} /> : null}
      </Screen>
    </>
  );
}
