"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Button, Stack } from "@chakra-ui/react";
import { Info } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { FeatureItem, PinField, notify } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import { hayPin, ponerPin, quitarPin } from "@/lib/respaldo/pin";

/** Figma: MD-12 · PIN opcional */
export default function Pin() {
  const router = useRouter();
  const [pin, setPin] = useState<string[]>([]);
  const [existe, setExiste] = useState<boolean | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    void hayPin().then(setExiste);
  }, []);

  const guardar = async () => {
    if (pin.join("").length !== 4) return setError("Escribe los 4 números.");
    await ponerPin(pin.join(""));
    notify({ title: "Se guardó tu PIN. Mi dinero lo pedirá al abrirlo." });
    router.push("/mi-dinero");
  };

  const quitar = async () => {
    await quitarPin();
    notify({ title: "Se quitó el PIN", status: "info" });
    router.push("/mi-dinero");
  };

  return (
    <>
      <AppHeader type="back" title="Mi dinero" meta="Proteger" backHref="/mi-dinero/respaldo" />
      <Screen>
        <PageTitle title="¿Compartes este teléfono?">Si quieres, pon un PIN para que solo tú veas Mi dinero. Es opcional.</PageTitle>
        <PinField
          label={existe ? "Elige tus 4 números nuevos" : "Elige 4 números que recuerdes"}
          helperText={error ?? "Para que nadie más vea tu dinero en este teléfono."}
          value={pin}
          onValueChange={(e) => {
            setError(undefined);
            setPin(e.value);
          }}
        />
        <FeatureItem icon={Info} title="Si lo olvidas" description="Puedes quitar el PIN usando tu código de respaldo." />
        <Stack gap="2">
          <Button size="lg" onClick={guardar}>
            {existe ? "Cambiar PIN" : "Guardar PIN"}
          </Button>
          {existe ? (
            <Button size="lg" variant="outline" onClick={quitar}>
              Quitar PIN
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
