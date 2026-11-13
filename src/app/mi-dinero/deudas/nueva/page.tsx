"use client";

import { Suspense, useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Stack } from "@chakra-ui/react";
import { AppHeader } from "@/components/app-header";
import { DangerButton, DateField, RadioCardGroup, SelectField, TextField, notify } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import { actualizar, anotarDeuda, borrar, restaurar } from "@/lib/db";
import { useRegistro } from "@/lib/db/hooks";
import type { Frecuencia, TipoDeuda } from "@/lib/db/tipos";
import { parsePesos } from "@/lib/format";
import { FRECUENCIAS, TIPOS_DEUDA } from "../../datos";

type Form = { tipo: TipoDeuda; nombre: string; monto: string; frecuencia: Frecuencia; pago: string; proximoPago: string; interes: string };
const VACIO: Form = { tipo: "persona", nombre: "", monto: "", frecuencia: "quincena", pago: "", proximoPago: "", interes: "" };

/** Figma: MD-16 · Anotar una deuda. Con ?id= edita una deuda existente («Editar deuda» de MD-17). */
function Formulario() {
  const router = useRouter();
  const id = useSearchParams().get("id") ?? undefined;
  const existente = useRegistro("deudas", id);
  const [f, setF] = useState<Form>(VACIO);
  const [errores, setErrores] = useState<Partial<Record<keyof Form, string>>>({});

  useEffect(() => {
    if (existente)
      setF({
        tipo: existente.tipo,
        nombre: existente.nombre,
        monto: String(existente.montoInicial / 100),
        frecuencia: existente.frecuencia,
        pago: String(existente.pagoPorPeriodo / 100),
        proximoPago: existente.proximoPago ?? "",
        interes: existente.interes ? String(existente.interes) : "",
      });
  }, [existente]);

  const set = (k: keyof Form, v: string) => {
    setErrores((e) => ({ ...e, [k]: undefined }));
    setF((x) => ({ ...x, [k]: v }));
  };
  const editar = Boolean(id && existente);
  const conCat = f.tipo === "tarjeta" || f.tipo === "banco" || f.tipo === "tienda" || f.tipo === "empeno";

  const guardar = async () => {
    const e: typeof errores = {};
    if (!f.nombre.trim()) e.nombre = "Escribe cómo le llamas, por ejemplo «Refrigerador».";
    const monto = parsePesos(f.monto);
    const pago = parsePesos(f.pago);
    if (!monto) e.monto = "Escribe cuánto debes hoy.";
    if (!pago) e.pago = "Escribe cuánto pagas cada vez.";
    const interes = f.interes.trim() ? Number(f.interes.replace(",", ".").replace("%", "")) : undefined;
    if (interes !== undefined && !(interes >= 0)) e.interes = "Escribe solo el número, por ejemplo 85.";
    setErrores(e);
    if (Object.keys(e).length || !monto || !pago) return;
    const datos = { nombre: f.nombre.trim(), tipo: f.tipo, montoInicial: monto, frecuencia: f.frecuencia, pagoPorPeriodo: pago, proximoPago: f.proximoPago || undefined, interes };
    if (editar && id) {
      await actualizar("deudas", id, datos);
      notify({ title: `Se guardaron los cambios de ${datos.nombre}` });
      router.push(`/mi-dinero/deudas/ver?id=${id}`);
    } else {
      const d = await anotarDeuda(datos);
      notify({ title: `Se anotó tu deuda: ${d.nombre}`, action: { label: "Deshacer", onClick: () => void borrar("deudas", d.id) } });
      router.push("/mi-dinero/deudas");
    }
  };

  const quitar = async () => {
    if (!id || !existente) return;
    await borrar("deudas", id);
    notify({ title: `Se borró la deuda ${existente.nombre}`, status: "danger", action: { label: "Deshacer", onClick: () => void restaurar("deudas", id) } });
    router.push("/mi-dinero/deudas");
  };

  return (
    <>
      <AppHeader type="back" title="Mi dinero" meta={editar ? "Editar deuda" : "Nueva deuda"} backHref={editar ? `/mi-dinero/deudas/ver?id=${id}` : "/mi-dinero/deudas"} />
      <Screen>
        <PageTitle title="¿Qué tipo de deuda es?">Así sabemos qué preguntarte y cómo explicarte los intereses.</PageTitle>
        <RadioCardGroup aria-label="Tipo de deuda" value={f.tipo} onValueChange={(e) => set("tipo", e.value ?? "persona")} options={TIPOS_DEUDA.map((t) => ({ value: t.value, label: t.label, description: t.description }))} />
        <TextField label="¿Cómo le llamas?" placeholder="Ej. préstamo de mi hermana" value={f.nombre} onChange={(e) => set("nombre", e.target.value)} error={errores.nombre} />
        <TextField label={editar ? "¿Cuánto debías al anotarla?" : "¿Cuánto debes hoy?"} prefix="$" size="lg" inputMode="decimal" value={f.monto} onChange={(e) => set("monto", e.target.value)} error={errores.monto} />
        <SelectField label="¿Cada cuánto pagas?" value={f.frecuencia} onChange={(e) => set("frecuencia", e.target.value)} options={FRECUENCIAS.map((x) => ({ ...x }))} />
        <TextField label={f.tipo === "tarjeta" ? "Pago mínimo" : "¿Cuánto pagas cada vez?"} prefix="$" inputMode="decimal" value={f.pago} onChange={(e) => set("pago", e.target.value)} error={errores.pago} />
        <DateField label={f.tipo === "tarjeta" ? "Fecha límite de pago" : "Próximo pago"} value={f.proximoPago} onChange={(e) => set("proximoPago", e.target.value)} />
        <TextField
          label="¿Te cobra algo extra? (opcional)"
          suffix="% al año"
          inputMode="decimal"
          value={f.interes}
          onChange={(e) => set("interes", e.target.value)}
          error={errores.interes}
          helperText={conCat ? "En tarjetas y créditos viene en tu estado de cuenta como CAT. Si no sabes, déjalo vacío." : "Si no te cobra intereses, déjalo vacío."}
        />
        <Stack gap="2">
          <Button size="lg" onClick={guardar}>
            {editar ? "Guardar cambios" : "Guardar deuda"}
          </Button>
          {editar ? (
            <DangerButton size="lg" variant="ghost" onClick={quitar}>
              Borrar esta deuda
            </DangerButton>
          ) : (
            <Button size="lg" variant="ghost" asChild>
              <NextLink href="/mi-dinero/deudas">Cancelar</NextLink>
            </Button>
          )}
        </Stack>
      </Screen>
    </>
  );
}

export default function NuevaDeuda() {
  return (
    <Suspense>
      <Formulario />
    </Suspense>
  );
}
