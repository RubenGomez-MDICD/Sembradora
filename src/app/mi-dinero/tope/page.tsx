"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Button, Stack, Text } from "@chakra-ui/react";
import { AppHeader } from "@/components/app-header";
import { ProgressBar, SelectField, TextField, notify } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import { avanceTope, resumen } from "@/lib/calculos/dinero";
import { actualizar, borrar, crear } from "@/lib/db";
import { useCategorias, useTabla } from "@/lib/db/hooks";
import { formatMoney, parsePesos } from "@/lib/format";
import { iconoCategoria, nombreCategoria, useCategoriasMapa } from "../datos";

/** Figma: MD-14 · Ponle un tope */
export default function Tope() {
  const router = useRouter();
  const movimientos = useTabla("movimientos");
  const topes = useTabla("topes");
  const categorias = useCategorias("gasto");
  const mapa = useCategoriasMapa();
  const semana = movimientos ? resumen(movimientos, "semana") : null;
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [monto, setMonto] = useState("");
  const [error, setError] = useState<string>();

  // Empieza con la categoría que más gasto lleva, o la primera.
  useEffect(() => {
    if (categoriaId || !semana || !categorias) return;
    const c = semana.porCategoria.find((x) => x.categoriaId !== "deudas")?.categoriaId ?? categorias[0]?.id ?? "";
    setCategoriaId(c);
  }, [semana, categorias, categoriaId]);

  const existente = topes?.find((t) => t.categoriaId === categoriaId);
  useEffect(() => {
    if (existente) setMonto(String(existente.montoSemanal / 100));
  }, [existente]);

  const centavos = parsePesos(monto);
  const a = semana && centavos ? avanceTope({ categoriaId, montoSemanal: centavos }, semana) : null;
  const gastado = semana?.porCategoria.find((c) => c.categoriaId === categoriaId)?.monto ?? 0;
  const nombre = nombreCategoria(mapa, categoriaId);

  const guardar = async () => {
    if (!centavos) return setError("Escribe cuánto quieres gastar a la semana.");
    if (existente) await actualizar("topes", existente.id, { montoSemanal: centavos });
    else await crear("topes", { categoriaId, montoSemanal: centavos });
    notify({ title: `Se guardó tu tope de ${formatMoney(centavos)} a la semana en ${nombre.toLowerCase()}` });
    router.push("/mi-dinero");
  };

  const quitar = async () => {
    if (!existente) return;
    await borrar("topes", existente.id);
    notify({ title: `Se quitó el tope de ${nombre.toLowerCase()}`, status: "info" });
    router.push("/mi-dinero");
  };

  return (
    <>
      <AppHeader type="back" title="Mi dinero" meta="Tope semanal" backHref="/mi-dinero/ideas" />
      <Screen>
        <PageTitle title="Ponle un tope a una categoría">Es un límite que tú eliges. Te avisamos al llegar al 80 % y nunca te bloqueamos un gasto.</PageTitle>
        <SelectField label="Categoría" icon={iconoCategoria(mapa, categoriaId)} value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} options={(categorias ?? []).map((c) => ({ value: c.id, label: c.nombre }))} />
        <TextField
          label="¿Cuánto quieres gastar a la semana?"
          prefix="$"
          size="lg"
          inputMode="decimal"
          value={monto}
          onChange={(e) => {
            setError(undefined);
            setMonto(e.target.value);
          }}
          error={error}
          helperText={`Esta semana llevas ${formatMoney(gastado)} en ${nombre.toLowerCase()}.`}
        />
        {a && centavos ? (
          <Stack gap="2">
            <Text textStyle="label">Así se verá en tu balance</Text>
            <ProgressBar label={nombre} amount={`${formatMoney(gastado)} de ${formatMoney(centavos)}`} value={a.proporcion * 100} />
            <Text textStyle="caption" color={a.estado === "bien" ? "content.muted" : "feedback.warning.fg"}>
              {a.estado === "pasado" ? `Esta semana te pasaste por ${formatMoney(a.diferencia)}. El tope empieza a contar desde hoy.` : a.estado === "cerca" ? `Vas en el ${Math.round(a.proporcion * 100)} % de tu tope.` : `Te quedan ${formatMoney(-a.diferencia)} esta semana.`}
            </Text>
          </Stack>
        ) : null}
        <Stack gap="2">
          <Button size="lg" onClick={guardar}>
            Guardar tope
          </Button>
          {existente ? (
            <Button size="lg" variant="outline" onClick={quitar}>
              Quitar tope
            </Button>
          ) : null}
          <Button size="lg" variant="ghost" asChild>
            <NextLink href="/mi-dinero">Ahora no</NextLink>
          </Button>
        </Stack>
      </Screen>
    </>
  );
}
