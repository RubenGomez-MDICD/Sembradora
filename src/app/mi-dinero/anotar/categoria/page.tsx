"use client";

import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { BottomSheet, CategoryTiles, DateField, IconOptions, SelectField, TextField, notify } from "@/components/ds";
import { Paso } from "@/components/paso";
import { ICONOS_META } from "@/app/mis-ahorros/flujo";
import { anotarMovimiento, anotarPrestamo, borrar, crearCategoria, descartarBorrador } from "@/lib/db";
import { useCategorias } from "@/lib/db/hooks";
import type { Frecuencia } from "@/lib/db/tipos";
import { useFlujo } from "@/lib/db/use-flujo";
import { formatMoney, parsePesos } from "@/lib/format";
import { icono } from "@/lib/iconos";
import { FRECUENCIAS } from "../../datos";
import { FLUJO_MOVIMIENTO, type DatosMovimiento } from "../flujo";

const ICONOS_CATEGORIA = [{ value: "utensils", label: "Comida" }, ...ICONOS_META.filter((i) => i.value !== "bus"), { value: "bus", label: "Transporte" }];

/** Figma: MD-3, MD-3i, MD-3n, MD-3c y MD-3p (paso 2 de 3) */
export default function Categoria() {
  const router = useRouter();
  const { datos, cambiar, estado, reintentar } = useFlujo<DatosMovimiento>(FLUJO_MOVIMIENTO);
  const d = datos ?? {};
  const tipo = d.tipo ?? "gasto";
  const categorias = useCategorias(tipo);
  const monto = parsePesos(d.monto);
  const [errores, setErrores] = useState<Record<string, string | undefined>>({});
  const [nueva, setNueva] = useState(false);
  const [nombreNueva, setNombreNueva] = useState("");
  const [iconoNueva, setIconoNueva] = useState("book-open");
  const [guardando, setGuardando] = useState(false);
  const prestamo = tipo === "ingreso" && d.categoriaId === "prestamo";

  if (datos && !monto) {
    return (
      <Paso seccion="Nuevo movimiento" paso={2} total={3} backHref="/mi-dinero/anotar">
        <Text>
          Falta el monto. <NextLink href="/mi-dinero/anotar">Regresa al paso 1</NextLink>.
        </Text>
      </Paso>
    );
  }

  const crear = async () => {
    if (!nombreNueva.trim()) return setErrores({ nueva: "Escribe el nombre de la categoría." });
    const c = await crearCategoria({ nombre: nombreNueva, icono: iconoNueva, tipo });
    cambiar({ categoriaId: c.id });
    setNueva(false);
    setNombreNueva("");
    notify({ title: `Se creó la categoría ${c.nombre}` });
  };

  const guardar = async () => {
    const e: Record<string, string> = {};
    if (!d.categoriaId) e.categoria = tipo === "gasto" ? "Elige en qué fue." : "Elige de dónde vino.";
    if (prestamo) {
      if (!d.quien?.trim()) e.quien = "Escribe quién te prestó.";
      if (!parsePesos(d.pago)) e.pago = "Escribe cuánto vas a pagar cada vez.";
    }
    setErrores(e);
    if (Object.keys(e).length || !monto) return;
    setGuardando(true);
    try {
      if (prestamo) {
        const quien = d.quien!.trim();
        const { deuda, ingreso } = await anotarPrestamo({ nombre: `Préstamo de ${quien.charAt(0).toLowerCase()}${quien.slice(1)}`, monto, frecuencia: d.frecuencia ?? "quincena", pagoPorPeriodo: parsePesos(d.pago)!, primerPago: d.primerPago || undefined, nota: d.nota });
        await descartarBorrador(FLUJO_MOVIMIENTO);
        notify({
          title: `Se guardó el ingreso y la deuda con ${quien}`,
          action: { label: "Deshacer", onClick: () => void Promise.all([borrar("movimientos", ingreso.id), borrar("deudas", deuda.id)]) },
        });
      } else {
        const m = await anotarMovimiento({ tipo, monto, categoriaId: d.categoriaId!, nota: d.nota });
        await descartarBorrador(FLUJO_MOVIMIENTO);
        const nombre = categorias?.find((c) => c.id === m.categoriaId)?.nombre ?? "";
        notify({ title: `Se guardó: ${d.nota?.trim() || nombre} · ${formatMoney(monto)}`, action: { label: "Deshacer", onClick: () => void borrar("movimientos", m.id) } });
      }
      router.push("/mi-dinero");
    } catch {
      setGuardando(false);
      notify({ title: "No se pudo guardar. Intenta otra vez.", status: "info" });
    }
  };

  return (
    <Paso
      seccion="Nuevo movimiento"
      paso={2}
      total={3}
      backHref="/mi-dinero/anotar"
      titulo={tipo === "gasto" ? "¿En qué fue?" : "¿De dónde vino?"}
      descripcion={monto ? `${tipo === "gasto" ? "Gasto" : "Ingreso"} de ${formatMoney(monto)}` : undefined}
      estado={estado}
      onReintentar={reintentar}
    >
      {categorias ? (
        <CategoryTiles
          label={tipo === "gasto" ? "¿En qué fue?" : "¿De dónde vino?"}
          value={d.categoriaId ?? null}
          onValueChange={(e) => {
            setErrores({});
            cambiar({ categoriaId: e.value ?? undefined });
          }}
          options={categorias.map((c) => ({ value: c.id, label: c.nombre, icon: icono(c.icono) }))}
          onAdd={() => setNueva(true)}
        />
      ) : null}
      {errores.categoria ? (
        <Box role="alert" color="feedback.error.fg" textStyle="caption">
          {errores.categoria}
        </Box>
      ) : null}

      {prestamo ? (
        <Stack gap="4" bg="surface.subtle" borderRadius="l3" p="4">
          <Text textStyle="bodySm">Lo anotamos también en Lo que debes, para que sepas cuánto falta y cuándo pagar.</Text>
          <TextField label="¿Quién te prestó?" placeholder="Ej. mi hermana" value={d.quien ?? ""} onChange={(e) => cambiar({ quien: e.target.value })} error={errores.quien} />
          <TextField label="¿Cuánto vas a pagar cada vez?" prefix="$" inputMode="decimal" value={d.pago ?? ""} onChange={(e) => cambiar({ pago: e.target.value })} error={errores.pago} />
          <SelectField label="¿Cada cuánto?" value={d.frecuencia ?? "quincena"} onChange={(e) => cambiar({ frecuencia: e.target.value as Frecuencia })} options={FRECUENCIAS.map((f) => ({ ...f }))} />
          <DateField label="Primer pago" value={d.primerPago ?? ""} onChange={(e) => cambiar({ primerPago: e.target.value })} />
        </Stack>
      ) : null}

      <TextField label="Nota (opcional)" placeholder={tipo === "gasto" ? "Ej. tortillas y verdura" : "Ej. pago de la semana"} value={d.nota ?? ""} onChange={(e) => cambiar({ nota: e.target.value })} />

      <Stack gap="2">
        <Button size="lg" onClick={guardar} loading={guardando} loadingText="Guardando…">
          Guardar
        </Button>
        <Button size="lg" variant="ghost" asChild>
          <NextLink href="/mi-dinero/anotar">Atrás</NextLink>
        </Button>
      </Stack>

      <BottomSheet
        open={nueva}
        onOpenChange={setNueva}
        title="Nueva categoría"
        footer={
          <>
            <Button size="lg" onClick={crear}>
              Guardar categoría
            </Button>
            <Button size="lg" variant="ghost" onClick={() => setNueva(false)}>
              Cancelar
            </Button>
          </>
        }
      >
        <Stack gap="4">
          <Text color="content.muted">Aparecerá junto a tus otras categorías y se guarda en tu teléfono con tus movimientos.</Text>
          <TextField label="¿Cómo se llama?" placeholder="Ej. escuela" value={nombreNueva} onChange={(e) => setNombreNueva(e.target.value)} error={errores.nueva} />
          <IconOptions label="Elige un ícono" value={iconoNueva} onChange={setIconoNueva} options={ICONOS_CATEGORIA.map((o) => ({ ...o, icon: icono(o.value) }))} />
        </Stack>
      </BottomSheet>
    </Paso>
  );
}
