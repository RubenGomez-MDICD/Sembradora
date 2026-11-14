"use client";

import { useState } from "react";
import NextLink from "next/link";
import { Button, Stack } from "@chakra-ui/react";
import { AppHeader } from "@/components/app-header";
import { Alert, BackupCode, CheckboxCardItem } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import { useRegistro, useTabla } from "@/lib/db/hooks";
import { useEnLinea } from "@/lib/en-linea";
import { SinAlmacen, SinInternet, subirRespaldo } from "@/lib/respaldo";

const fecha = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });

/** Figma: MD-9 · Código creado */
export default function Codigo() {
  const codigo = useRegistro("ajustes", "respaldoCodigo");
  const ultimo = useRegistro("ajustes", "ultimoRespaldo");
  const movimientos = useTabla("movimientos");
  const [anotado, setAnotado] = useState(false);
  const [error, setError] = useState<string>();
  const [subiendo, setSubiendo] = useState(false);
  const enLinea = useEnLinea();
  const valor = typeof codigo?.valor === "string" ? codigo.valor : null;
  const cuando = typeof ultimo?.valor === "string" ? ultimo.valor : null;

  if (codigo === undefined) return <AppHeader type="back" title="Tu respaldo" meta="Código" backHref="/mi-dinero/respaldo" />;
  if (!valor) {
    return (
      <>
        <AppHeader type="back" title="Tu respaldo" meta="Código" backHref="/mi-dinero/respaldo" />
        <Screen>
          <Alert status="info" title="Todavía no tienes un código">
            Créalo en Tu respaldo.
          </Alert>
          <Button size="lg" asChild>
            <NextLink href="/mi-dinero/respaldo">Ir a Tu respaldo</NextLink>
          </Button>
        </Screen>
      </>
    );
  }

  const subir = async () => {
    setSubiendo(true);
    setError(undefined);
    try {
      await subirRespaldo(valor);
    } catch (e) {
      setError(e instanceof SinInternet ? "No hay internet. Se intentará de nuevo cuando tengas conexión." : e instanceof SinAlmacen ? "El respaldo con código todavía no está activo en el sitio. Mientras, guarda un archivo." : "No se pudo subir. Intenta otra vez.");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <>
      <AppHeader type="back" title="Tu respaldo" meta="Código" backHref="/mi-dinero/respaldo" />
      <Screen>
        <PageTitle title="Este es tu código">Anótalo en papel o tómale foto. Lo vas a necesitar para recuperar tus datos.</PageTitle>
        <BackupCode code={valor} />
        <CheckboxCardItem label="Ya lo anoté en un lugar seguro" checked={anotado} onCheckedChange={(e) => setAnotado(Boolean(e.checked))} />
        {cuando && !error ? (
          <Alert status="success" title="Respaldo guardado">
            {fecha.format(new Date(cuando))} · {movimientos?.length ?? 0} {movimientos?.length === 1 ? "movimiento" : "movimientos"}. Se actualiza solo cuando tengas internet.
          </Alert>
        ) : (
          <Alert status="warning" title="Tu respaldo todavía no se sube" live>
            {!enLinea ? "No hay internet. Tu código ya sirve: el respaldo se sube solo cuando vuelva la conexión." : (error ?? "Puede ser que no haya internet. Se intentará de nuevo solo; también puedes intentarlo ahora.")}
          </Alert>
        )}
        <Stack gap="2">
          <Button size="lg" asChild disabled={!anotado}>
            <NextLink href="/mi-dinero" aria-disabled={!anotado} onClick={(e) => !anotado && e.preventDefault()}>
              Listo
            </NextLink>
          </Button>
          <Button size="lg" variant="ghost" onClick={subir} loading={subiendo} loadingText="Subiendo…" disabled={!enLinea}>
            {cuando ? "Actualizar ahora" : "Intentar subirlo ahora"}
          </Button>
        </Stack>
      </Screen>
    </>
  );
}
