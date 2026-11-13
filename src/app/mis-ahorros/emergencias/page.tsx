"use client";

import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Button, Stack } from "@chakra-ui/react";
import { HeartPulse, PiggyBank, Undo2 } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { AppHeader } from "@/components/app-header";
import { FeatureItem, ProgressBar, Stat, TextField } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import { SEMANAS_EN_UN_MES, gastoSemanalPromedio, metaDeEmergencias } from "@/lib/calculos/ahorro";
import { getDb, guardarBorrador, vivos } from "@/lib/db";
import { useTabla } from "@/lib/db/hooks";
import { formatMoney, parsePesos } from "@/lib/format";
import { FLUJO_AHORROS } from "../flujo";

/**
 * Figma: AH-8 · Para emergencias.
 * La meta sale de lo anotado en Mi dinero. Si todavía no hay gastos, se puede escribir
 * cuánto se gasta a la semana.
 */
export default function Emergencias() {
  const router = useRouter();
  const gastoSemanal = useLiveQuery(async () => gastoSemanalPromedio(vivos(await getDb().movimientos.toArray()), new Date()));
  const metas = useTabla("metas");
  const existente = metas?.find((m) => m.clase === "emergencias");
  const [escrito, setEscrito] = useState("");

  const semanal = gastoSemanal ?? parsePesos(escrito);
  const objetivo = existente?.montoObjetivo ?? (semanal ? metaDeEmergencias(semanal) : null);
  const llevas = existente?.aportado ?? 0;

  const crearMeta = async () => {
    if (!objetivo) return;
    await guardarBorrador(FLUJO_AHORROS, { clase: "emergencias", monto: String(objetivo / 100), plazo: "6", unidad: "meses", frecuencia: "semana" });
    router.push("/mis-ahorros/plazo");
  };

  return (
    <>
      <AppHeader type="back" title="Mis ahorros" backHref="/mis-ahorros" />
      <Screen>
        <PageTitle title="Para emergencias">Un dinero aparte para lo que no se puede planear.</PageTitle>

        {gastoSemanal === undefined ? null : objetivo ? (
          <Stat
            label="Tu meta para emergencias"
            value={formatMoney(objetivo)}
            helpText={
              existente
                ? "La meta que guardaste en Mis ahorros."
                : `Lo que gastas en un mes: ${formatMoney(semanal!)} por semana × ${SEMANAS_EN_UN_MES} semanas.${gastoSemanal ? " Sale de lo que anotaste en Mi dinero." : ""}`
            }
          />
        ) : null}
        {gastoSemanal === null && !existente ? (
          <TextField
            label="¿Cuánto gastas a la semana, más o menos?"
            prefix="$"
            inputMode="decimal"
            value={escrito}
            onChange={(e) => setEscrito(e.target.value)}
            helperText="Si anotas tus gastos en Mi dinero, lo calculamos por ti."
          />
        ) : null}
        {objetivo ? <ProgressBar label="Llevas" amount={`${formatMoney(llevas)} de ${formatMoney(objetivo)}`} value={(llevas / objetivo) * 100} /> : null}

        <Stack as="ul" gap="5" listStyleType="none" p="0" m="0">
          <li>
            <FeatureItem icon={PiggyBank} title="Guárdalo aparte" description="En otro sobre, alcancía o cuenta, para no gastarlo sin darte cuenta." />
          </li>
          <li>
            <FeatureItem icon={HeartPulse} title="Úsalo solo para lo urgente" description="Salud, una reparación o si te quedas sin trabajo." />
          </li>
          <li>
            <FeatureItem icon={Undo2} title="Si lo usas, vuelve a llenarlo" description="Poco a poco, como empezaste." />
          </li>
        </Stack>
        <Stack gap="2">
          {existente ? (
            <Button size="lg" asChild>
              <NextLink href="/mis-ahorros">Ver mi meta</NextLink>
            </Button>
          ) : (
            <Button size="lg" onClick={crearMeta} disabled={!objetivo}>
              Crear mi meta de emergencias
            </Button>
          )}
          <Button size="lg" variant="ghost" asChild>
            <NextLink href="/mis-ahorros">Volver a Mis ahorros</NextLink>
          </Button>
        </Stack>
      </Screen>
    </>
  );
}
