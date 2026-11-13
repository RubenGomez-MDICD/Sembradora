"use client";

import { useEffect, useState } from "react";
import { Button, Stack, Text } from "@chakra-ui/react";
import { Lock } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Alert, PinField, TextField } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import { leerAjuste } from "@/lib/db";
import { MENSAJES_CODIGO, revisarCodigo } from "@/lib/respaldo/codigo";
import { estaDesbloqueado, hayPin, quitarPin, revisarPin } from "@/lib/respaldo/pin";

/**
 * Si la persona puso PIN (MD-12), Mi dinero pide los 4 números una vez por sesión.
 * «Olvidé mi PIN» lo quita con el código de respaldo.
 */
export function Candado({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<"revisando" | "abierto" | "cerrado">("revisando");
  const [pin, setPin] = useState<string[]>([]);
  const [error, setError] = useState<string>();
  const [olvido, setOlvido] = useState(false);
  const [codigo, setCodigo] = useState("");

  useEffect(() => {
    (async () => setEstado(estaDesbloqueado() || !(await hayPin()) ? "abierto" : "cerrado"))();
  }, []);

  if (estado === "abierto") return children;
  if (estado === "revisando") return null;

  const probar = async (valor: string[]) => {
    if (valor.join("").length < 4) return;
    if (await revisarPin(valor.join(""))) setEstado("abierto");
    else {
      setError("Ese PIN no es. Inténtalo de nuevo.");
      setPin([]);
    }
  };

  const quitarConCodigo = async () => {
    const r = revisarCodigo(codigo);
    if (!r.ok) return setError(MENSAJES_CODIGO[r.error]);
    const guardado = await leerAjuste<string>("respaldoCodigo");
    if (!guardado) return setError("En este teléfono no hay un código de respaldo guardado, así que no podemos quitar el PIN con un código.");
    if (guardado !== r.codigo) return setError("Ese no es el código de respaldo de este teléfono.");
    await quitarPin();
    setEstado("abierto");
  };

  return (
    <>
      <AppHeader type="back" title="Inicio" backHref="/" />
      <Screen>
        <Stack align="center" color="brand.primary.fg">
          <Lock size={40} aria-hidden />
        </Stack>
        <PageTitle title="Mi dinero tiene PIN">Escribe tus 4 números para verlo.</PageTitle>
        {olvido ? (
          <Stack gap="4">
            <TextField label="Tu código de respaldo" placeholder="MILPA-7K3Q-92XD" autoCapitalize="characters" autoComplete="off" value={codigo} onChange={(e) => setCodigo(e.target.value)} error={error} helperText="Con tu código quitamos el PIN. Tus datos no se tocan." />
            <Button size="lg" onClick={quitarConCodigo}>
              Quitar el PIN
            </Button>
            <Button size="lg" variant="ghost" onClick={() => (setOlvido(false), setError(undefined))}>
              Escribir el PIN
            </Button>
          </Stack>
        ) : (
          <Stack gap="4">
            <PinField
              label="Tu PIN"
              value={pin}
              onValueChange={(e) => {
                setError(undefined);
                setPin(e.value);
              }}
              onValueComplete={(e) => void probar(e.value)}
            />
            {error ? (
              <Alert status="error" title={error} live />
            ) : null}
            <Button size="lg" variant="ghost" onClick={() => (setOlvido(true), setError(undefined))}>
              Olvidé mi PIN
            </Button>
            <Text textStyle="caption" color="content.muted" textAlign="center">
              Las otras secciones no piden PIN.
            </Text>
          </Stack>
        )}
      </Screen>
    </>
  );
}
