"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Stack, Text, VisuallyHidden } from "@chakra-ui/react";
import { SearchX } from "lucide-react";
import { AccordionList, EmptyState, FilterChips, TextField } from "@/components/ds";
import { ExplicacionTermino } from "@/components/glosario";
import { TEMAS, buscarTerminos, terminoPorId, type Tema } from "@/content/glosario";

/**
 * Glosario con búsqueda y filtros (AP-3).
 * - `?q=` llega desde la búsqueda de Aprende (AP-0).
 * - `?t=` llega desde «Ver más en el glosario» (AP-2): abre esa palabra y la muestra.
 */
export function Glosario() {
  const params = useSearchParams();
  const t = params.get("t") ?? "";
  const abierta = terminoPorId(t) ? t : undefined;
  const [q, setQ] = useState(params.get("q") ?? "");
  const [tema, setTema] = useState<Tema | "todas">("todas");
  const resultados = useMemo(() => buscarTerminos(q, tema), [q, tema]);

  useEffect(() => {
    if (abierta) document.querySelector(`[data-ancla="termino-${abierta}"]`)?.scrollIntoView({ block: "start" });
  }, [abierta]);

  return (
    <Stack gap="4">
      <form role="search" onSubmit={(e) => e.preventDefault()}>
        <TextField label="Busca una palabra" type="search" enterKeyHint="search" placeholder="Ej. aguinaldo, Afore, tanda" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} />
      </form>
      <FilterChips label="Tema" options={TEMAS} value={tema} onChange={(v) => setTema(v as Tema | "todas")} />

      {/* Solo se anuncia porque lo causa la persona al escribir o filtrar. */}
      <VisuallyHidden aria-live="polite">{resultados.length === 1 ? "1 palabra" : `${resultados.length} palabras`}</VisuallyHidden>

      {resultados.length ? (
        <AccordionList
          // La key reinicia lo abierto cuando cambia la lista.
          key={`${tema}|${q}`}
          defaultOpen={abierta ? [abierta] : []}
          items={resultados.map((r) => ({ value: r.id, id: `termino-${r.id}`, title: r.palabra, content: <ExplicacionTermino termino={r} /> }))}
        />
      ) : (
        <EmptyState icon={SearchX} title={q ? `No encontramos «${q.trim()}»` : "No hay palabras en este tema"} description="Prueba con otra palabra o quita el filtro.">
          <Button
            variant="outline"
            onClick={() => {
              setQ("");
              setTema("todas");
            }}
          >
            Ver todas las palabras
          </Button>
        </EmptyState>
      )}
      {resultados.length ? (
        <Text textStyle="caption" color="content.subtle">
          Las explicaciones son orientativas. Para tu caso, busca asesoría gratis en ¿Quién te apoya?
        </Text>
      ) : null}
    </Stack>
  );
}
