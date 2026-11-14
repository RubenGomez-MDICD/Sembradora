"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Flex, Stack, Text } from "@chakra-ui/react";
import { FileText, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Alert, DangerButton, DataList, RadioCardGroup, TextField, notify } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import type { Respaldo } from "@/lib/db";
import { compartirODescargar } from "@/lib/compartir";
import { useEnLinea } from "@/lib/en-linea";
import { formatFechaCorta } from "@/lib/format";
import { ArchivoInvalido, CodigoIncorrecto, MENSAJES_CODIGO, NoEncontrado, SinAlmacen, SinInternet, archivoDeRespaldo, bajarRespaldo, cuantosMovimientos, leerArchivo, recuperar, resumenLocal, revisarCodigo } from "@/lib/respaldo";

const fechaHora = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });
const dia = (iso?: string) => (iso ? formatFechaCorta(iso.slice(0, 10)) : "");

type Encontrado = { respaldo: Respaldo; guardado: string; origen: "codigo" | "archivo"; nombre?: string; codigo?: string };

/** Figma: MD-10, MD-10b, MD-10f, MD-11, MD-11b y MD-11c */
export default function Recuperar() {
  const router = useRouter();
  const archivoRef = useRef<HTMLInputElement>(null);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string>();
  const [aviso, setAviso] = useState<string>();
  const [buscando, setBuscando] = useState(false);
  const [encontrado, setEncontrado] = useState<Encontrado | null>(null);
  const [modo, setModo] = useState<"juntar" | "reemplazar">("juntar");
  const [local, setLocal] = useState<Awaited<ReturnType<typeof resumenLocal>> | null>(null);
  const enLinea = useEnLinea();

  useEffect(() => {
    void resumenLocal().then(setLocal);
  }, []);

  const revision = texto ? revisarCodigo(texto) : null;
  // Las letras que los códigos no usan se avisan al momento; lo incompleto, al intentar (MD-11 y MD-11b).
  const errorEnVivo = revision && !revision.ok && ["letra-o", "letra-i", "cero", "uno"].includes(revision.error) ? MENSAJES_CODIGO[revision.error] : undefined;
  const movs = (n: number) => `${n} ${n === 1 ? "movimiento" : "movimientos"}`;

  const buscar = async () => {
    const r = revisarCodigo(texto);
    if (!r.ok) return setError(MENSAJES_CODIGO[r.error]);
    setBuscando(true);
    setAviso(undefined);
    try {
      const { respaldo, guardado } = await bajarRespaldo(r.codigo);
      setEncontrado({ respaldo, guardado, origen: "codigo", codigo: r.codigo });
    } catch (e) {
      if (e instanceof SinInternet) setAviso("sin-internet");
      else if (e instanceof NoEncontrado || e instanceof CodigoIncorrecto) setError("No encontramos un respaldo con ese código. Revisa cada letra y número.");
      else if (e instanceof SinAlmacen) setError("El respaldo con código todavía no está activo en el sitio. Usa un archivo de respaldo.");
      else setError("No se pudo buscar tu respaldo. Intenta otra vez.");
    } finally {
      setBuscando(false);
    }
  };

  const elegirArchivo = async (file?: File) => {
    if (!file) return;
    setError(undefined);
    try {
      const respaldo = await leerArchivo(file);
      setEncontrado({ respaldo, guardado: respaldo.exportado, origen: "archivo", nombre: file.name });
    } catch (e) {
      setError(e instanceof ArchivoInvalido ? e.message : "No se pudo leer el archivo.");
    }
  };

  const aplicar = async () => {
    if (!encontrado) return;
    const r = await recuperar(encontrado.respaldo, modo, encontrado.codigo);
    notify({ title: modo === "reemplazar" ? "Se recuperaron tus datos del respaldo" : r.agregados || r.actualizados ? `Se juntaron tus datos: ${r.agregados} nuevos y ${r.actualizados} actualizados` : "Ya tenías todo: no hubo cambios" });
    router.push("/mi-dinero");
  };

  const guardarAntes = async () => {
    const a = await archivoDeRespaldo();
    await compartirODescargar(a.blob, a.nombre, "Respaldo de La sembradora");
  };

  const hayLocal = (local?.movimientos ?? 0) > 0;

  return (
    <>
      <AppHeader type="back" title="Tu respaldo" meta="Recuperar" backHref="/mi-dinero/respaldo" />
      <Screen>
        {encontrado?.origen === "archivo" ? (
          <PageTitle title="Recupera con un archivo">Elige el archivo que guardaste o que te mandaste por WhatsApp.</PageTitle>
        ) : (
          <PageTitle title="Recupera tus datos">Escribe el código que anotaste cuando hiciste tu respaldo.</PageTitle>
        )}

        {encontrado?.origen === "archivo" ? (
          <Flex gap="3" align="center" bg="surface.subtle" borderRadius="l3" p="4">
            <FileText size={24} aria-hidden />
            <Stack gap="0">
              <Text textStyle="label">{encontrado.nombre}</Text>
              <Text textStyle="caption" color="content.muted">
                {movs(cuantosMovimientos(encontrado.respaldo))} · guardado el {dia(encontrado.guardado)}
              </Text>
            </Stack>
          </Flex>
        ) : (
          <TextField
            label="Código de respaldo"
            placeholder="MILPA-7K3Q-92XD"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setError(undefined);
              setEncontrado(null);
            }}
            error={error ?? errorEnVivo}
            helperText="Son tres grupos de letras y números."
          />
        )}

        {!enLinea || aviso === "sin-internet" ? (
          <Alert status="warning" title="No hay internet" live>
            Para recuperar con código necesitas conexión. Si tienes un archivo de respaldo, ése funciona sin internet.
          </Alert>
        ) : null}

        {encontrado ? (
          <>
            <DataList
              rows={[
                { label: "En este teléfono", value: movs(local?.movimientos ?? 0), note: hayLocal ? `Del ${dia(local?.desde)} al ${dia(local?.hasta)}` : "Nada anotado todavía" },
                { label: "En tu respaldo", value: movs(cuantosMovimientos(encontrado.respaldo)), note: `Último respaldo: ${fechaHora.format(new Date(encontrado.guardado))}` },
              ]}
            />
            {hayLocal ? (
              <RadioCardGroup
                label="¿Qué hacemos con lo que ya tienes aquí?"
                value={modo}
                onValueChange={(e) => setModo((e.value ?? "juntar") as "juntar" | "reemplazar")}
                options={[
                  { value: "juntar", label: "Juntar todo", description: "No se borra nada. Si un movimiento está en los dos lugares, se queda la versión más nueva." },
                  { value: "reemplazar", label: "Reemplazar", description: "Se borra lo de este teléfono y queda solo lo del respaldo." },
                ]}
              />
            ) : null}
            <Stack gap="2">
              {modo === "reemplazar" && hayLocal ? (
                <>
                  <DangerButton size="lg" onClick={aplicar}>
                    <Trash2 aria-hidden /> Borrar y reemplazar
                  </DangerButton>
                  <Button size="lg" variant="ghost" onClick={guardarAntes}>
                    Antes, guardar un archivo de este teléfono
                  </Button>
                </>
              ) : (
                <Button size="lg" onClick={aplicar}>
                  {hayLocal ? "Recuperar y juntar" : "Recuperar mis datos"}
                </Button>
              )}
              <Button size="lg" variant="ghost" onClick={() => (encontrado.origen === "archivo" ? archivoRef.current?.click() : setEncontrado(null))}>
                {encontrado.origen === "archivo" ? "Elegir otro archivo" : "Usar otro código"}
              </Button>
            </Stack>
          </>
        ) : (
          <Stack gap="2">
            <Button size="lg" onClick={buscar} loading={buscando} loadingText="Buscando tu respaldo…" disabled={!enLinea || Boolean(errorEnVivo)}>
              Recuperar mis datos
            </Button>
            <Button size="lg" variant="ghost" onClick={() => archivoRef.current?.click()}>
              Usar un archivo de respaldo
            </Button>
          </Stack>
        )}
        {error && encontrado?.origen === "archivo" ? <Alert status="error" title={error} live /> : null}
        <input ref={archivoRef} type="file" accept=".txt,.json,text/plain,application/json" hidden onChange={(e) => void elegirArchivo(e.target.files?.[0])} />
      </Screen>
    </>
  );
}
