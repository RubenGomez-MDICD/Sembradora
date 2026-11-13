"use client";

import { useState } from "react";
import NextLink from "next/link";
import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react";
import { Plus, ReceiptText, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { BottomSheet, DangerButton, DateField, EmptyState, MovementRow, RadioInline, Segmented, SelectField, TextField, WeekBars, notify } from "@/components/ds";
import { Screen } from "@/components/screen";
import { resumen, type Periodo } from "@/lib/calculos/dinero";
import { actualizar, agruparPorDia, borrar, restaurar } from "@/lib/db";
import { useTabla } from "@/lib/db/hooks";
import type { Movimiento, TipoMovimiento } from "@/lib/db/tipos";
import { DIAS_CORTOS, diaISO, indiceDia, inicioSemana } from "@/lib/fechas";
import { formatMoney, parsePesos } from "@/lib/format";
import { iconoCategoria, formatHora, nombreCategoria, nombreDia, useCategoriasMapa } from "../datos";

type Edicion = { tipo: TipoMovimiento; monto: string; categoriaId: string; nota: string; dia: string };

/** Figma: MD-5 · Mis movimientos, MD-6 · Editar movimiento, MD-7 · Borrado con Deshacer y MD-5b · Cambios guardados. */
export default function Movimientos() {
  const movimientos = useTabla("movimientos");
  const todas = useTabla("categorias");
  const mapa = useCategoriasMapa();
  const [periodo, setPeriodo] = useState<Periodo>("semana");
  const [editando, setEditando] = useState<Movimiento | null>(null);
  const [form, setForm] = useState<Edicion | null>(null);
  const [error, setError] = useState<string>();

  const hoy = new Date();
  const r = movimientos ? resumen(movimientos, periodo, hoy) : null;
  const grupos = r ? agruparPorDia(r.movimientos) : [];

  const abrir = (m: Movimiento) => {
    setEditando(m);
    setError(undefined);
    setForm({ tipo: m.tipo, monto: String(m.monto / 100), categoriaId: m.categoriaId, nota: m.nota ?? "", dia: diaISO(new Date(m.fecha)) });
  };

  const guardar = async () => {
    if (!editando || !form) return;
    const monto = parsePesos(form.monto);
    if (!monto) return setError("Escribe el monto, por ejemplo 120.");
    // Se conserva la hora original; solo cambia el día si se eligió otro.
    const original = new Date(editando.fecha);
    const [y, mo, dd] = form.dia.split("-").map(Number);
    const fecha = new Date(y, mo - 1, dd, original.getHours(), original.getMinutes()).toISOString();
    const antes = { tipo: editando.tipo, monto: editando.monto, categoriaId: editando.categoriaId, nota: editando.nota, fecha: editando.fecha };
    await actualizar("movimientos", editando.id, { tipo: form.tipo, monto, categoriaId: form.categoriaId, nota: form.nota.trim() || undefined, fecha });
    const id = editando.id;
    setEditando(null);
    notify({ title: `Se guardaron los cambios: ${nombreCategoria(mapa, form.categoriaId)} · ${formatMoney(monto)}`, action: { label: "Deshacer", onClick: () => void actualizar("movimientos", id, antes) } });
  };

  const quitar = async () => {
    if (!editando) return;
    const m = editando;
    setEditando(null);
    await borrar("movimientos", m.id);
    notify({ title: `Se borró: ${nombreCategoria(mapa, m.categoriaId)} · ${formatMoney(m.monto)}`, status: "danger", action: { label: "Deshacer", onClick: () => void restaurar("movimientos", m.id) } });
  };

  const semana = periodo === "semana" && r;
  const hoyIdx = indiceDia(hoy);
  const ingresosHoy = r ? r.movimientos.filter((m) => m.tipo === "ingreso" && diaISO(new Date(m.fecha)) === diaISO(hoy)).reduce((s, m) => s + m.monto, 0) : 0;
  const categoriasDelTipo = (todas ?? []).filter((c) => c.tipo === form?.tipo && (!c.oculta || c.id === form?.categoriaId)).sort((a, b) => a.orden - b.orden);

  return (
    <>
      <AppHeader type="back" title="Mi dinero" meta="Mis movimientos" backHref="/mi-dinero" />
      <Screen>
        <Heading as="h1" srOnly>
          Mis movimientos
        </Heading>
        <Segmented
          label="Periodo"
          value={periodo}
          onValueChange={(e) => setPeriodo((e.value ?? "semana") as Periodo)}
          items={[
            { value: "semana", label: "Esta semana" },
            { value: "mes", label: "Este mes" },
          ]}
        />

        {r === null ? null : r.movimientos.length === 0 ? (
          <EmptyState icon={ReceiptText} title={`No hay movimientos ${periodo === "semana" ? "esta semana" : "este mes"}`} description="Lo que anotes aparecerá aquí, del más nuevo al más viejo.">
            <Button size="lg" asChild>
              <NextLink href="/mi-dinero/anotar">Anotar movimiento</NextLink>
            </Button>
          </EmptyState>
        ) : (
          <>
            {semana ? (
              <WeekBars
                totalLabel={`${formatMoney(r.gastos)} esta semana`}
                note={r.ingresos ? `Entró: ${formatMoney(r.ingresos)}${ingresosHoy === r.ingresos ? " (hoy)" : ""}` : undefined}
                days={DIAS_CORTOS.map((dia, i) => {
                  const fecha = new Date(inicioSemana(hoy).getTime() + i * 86_400_000);
                  const total = i > hoyIdx ? null : r.movimientos.filter((m) => m.tipo === "gasto" && diaISO(new Date(m.fecha)) === diaISO(fecha)).reduce((s, m) => s + m.monto, 0);
                  return { day: i === hoyIdx ? "Hoy" : dia, cents: total, today: i === hoyIdx };
                })}
              />
            ) : (
              <Text>
                Este mes: {formatMoney(r.gastos)} en gastos y {formatMoney(r.ingresos)} de ingresos.
              </Text>
            )}
            <Text textStyle="bodySm" color="content.muted">
              Toca un movimiento para cambiarlo o borrarlo.
            </Text>
            <Stack gap="5">
              {grupos.map((g) => (
                <Box as="section" key={g.fecha.toISOString()} aria-label={nombreDia(g.fecha, hoy)}>
                  <Text as="h2" textStyle="overline" color="content.subtle" mb="1">
                    {nombreDia(g.fecha, hoy)}
                  </Text>
                  {g.items.map((m) => (
                    <MovementRow
                      key={m.id}
                      kind={m.tipo}
                      category={nombreCategoria(mapa, m.categoriaId)}
                      note={[m.nota, formatHora(m.fecha)].filter(Boolean).join(" · ")}
                      amountCents={m.monto}
                      icon={iconoCategoria(mapa, m.categoriaId)}
                      onSelect={() => abrir(m)}
                    />
                  ))}
                </Box>
              ))}
            </Stack>
            <Button size="lg" asChild>
              <NextLink href="/mi-dinero/anotar">
                <Plus aria-hidden /> Anotar movimiento
              </NextLink>
            </Button>
          </>
        )}

        <BottomSheet
          open={Boolean(editando)}
          onOpenChange={(o) => !o && setEditando(null)}
          title="Editar movimiento"
          eyebrow={editando ? `${nombreDia(new Date(editando.fecha), hoy)}, ${formatHora(editando.fecha)}` : undefined}
          footer={
            <>
              <Button size="lg" onClick={guardar}>
                Guardar cambios
              </Button>
              <DangerButton size="lg" variant="ghost" onClick={quitar}>
                <Trash2 aria-hidden /> Borrar movimiento
              </DangerButton>
            </>
          }
        >
          {form ? (
            <Stack gap="4">
              <RadioInline
                label="Es un:"
                value={form.tipo}
                onValueChange={(e) => {
                  const tipo = (e.value ?? "gasto") as TipoMovimiento;
                  setForm({ ...form, tipo, categoriaId: tipo === form.tipo ? form.categoriaId : tipo === "gasto" ? "otro-gasto" : "otro-ingreso" });
                }}
                options={[
                  { value: "gasto", label: "Gasto" },
                  { value: "ingreso", label: "Ingreso" },
                ]}
              />
              <TextField label="Monto" prefix="$" size="lg" inputMode="decimal" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} error={error} />
              <SelectField label="Categoría" icon={iconoCategoria(mapa, form.categoriaId)} value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })} options={categoriasDelTipo.map((c) => ({ value: c.id, label: c.nombre }))} />
              <TextField label="Nota" value={form.nota} onChange={(e) => setForm({ ...form, nota: e.target.value })} />
              <DateField label="Fecha" value={form.dia} max={diaISO(hoy)} onChange={(e) => setForm({ ...form, dia: e.target.value })} />
            </Stack>
          ) : null}
        </BottomSheet>
      </Screen>
    </>
  );
}
