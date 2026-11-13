"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";
import { Segmented, TextField } from "@/components/ds";
import { Paso } from "@/components/paso";
import type { TipoMovimiento } from "@/lib/db/tipos";
import { useFlujo } from "@/lib/db/use-flujo";
import { parsePesos } from "@/lib/format";
import { FLUJO_MOVIMIENTO, type DatosMovimiento } from "./flujo";

/** Figma: MD-2 · Registra el monto y MD-2i · Registra un ingreso (paso 1 de 3) */
function Monto() {
  const router = useRouter();
  const params = useSearchParams();
  const { datos, cambiar, estado, reintentar, terminar } = useFlujo<DatosMovimiento>(FLUJO_MOVIMIENTO);
  const [error, setError] = useState<string>();
  const inicial = useRef(false);

  // «Anotar un ingreso» llega con ?tipo=ingreso.
  useEffect(() => {
    if (inicial.current || !datos) return;
    inicial.current = true;
    const t = params.get("tipo");
    if ((t === "ingreso" || t === "gasto") && t !== datos.tipo) cambiar({ tipo: t, categoriaId: undefined });
  }, [datos, params, cambiar]);

  const d = datos ?? {};
  const tipo = d.tipo ?? "gasto";

  const siguiente = async () => {
    if (!parsePesos(d.monto)) return setError("Escribe cuánto fue, por ejemplo 120.");
    if (!d.tipo) cambiar({ tipo });
    await terminar();
    router.push("/mi-dinero/anotar/categoria");
  };

  return (
    <Paso seccion="Nuevo movimiento" paso={1} total={3} backHref="/mi-dinero" estado={estado} onReintentar={reintentar}>
      <Segmented
        label="Tipo de movimiento"
        value={tipo}
        onValueChange={(e) => cambiar({ tipo: (e.value ?? "gasto") as TipoMovimiento, categoriaId: undefined })}
        items={[
          { value: "gasto", label: "Gasto" },
          { value: "ingreso", label: "Ingreso" },
        ]}
      />
      <TextField
        label={tipo === "gasto" ? "¿Cuánto fue?" : "¿Cuánto te entró?"}
        prefix="$"
        size="lg"
        inputMode="decimal"
        autoFocus
        value={d.monto ?? ""}
        onChange={(e) => {
          setError(undefined);
          cambiar({ monto: e.target.value });
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") void siguiente();
        }}
        error={error}
        helperText="Escribe solo el número, sin centavos si no los sabes."
      />
      <Button size="lg" onClick={siguiente}>
        Siguiente <ChevronRight aria-hidden />
      </Button>
    </Paso>
  );
}

export default function Anotar() {
  return (
    <Suspense>
      <Monto />
    </Suspense>
  );
}
