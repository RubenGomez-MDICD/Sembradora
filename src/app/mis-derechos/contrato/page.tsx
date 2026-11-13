"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Button, Stack } from "@chakra-ui/react";
import { ExternalLink } from "lucide-react";
import { Alert, RadioCardGroup } from "@/components/ds";
import { useFlujo } from "@/lib/db/use-flujo";
import { FLUJO_DERECHOS, type DatosDerechos } from "../flujo";
import { Paso } from "../paso";

/** Figma: DR-1a · Tu contrato (paso 1 de 4) */
export default function Contrato() {
  const router = useRouter();
  const { datos, cambiar, estado, reintentar, terminar } = useFlujo<DatosDerechos>(FLUJO_DERECHOS);
  const contrato = datos?.contrato;
  const sinContrato = contrato === "no" || contrato === "nose";

  return (
    <Paso
      paso={1}
      backHref="/mis-derechos"
      titulo="¿Tienes un contrato por escrito?"
      descripcion="Empezamos por aquí porque el contrato dice cuánto te pagan, tus horarios y tus descansos."
      estado={estado}
      onReintentar={reintentar}
    >
      <RadioCardGroup
        label="Elige una opción"
        value={contrato ?? null}
        onValueChange={(e) => cambiar({ contrato: e.value as DatosDerechos["contrato"] })}
        options={[
          { value: "si", label: "Sí, tengo contrato firmado", description: "Tenlo a la mano: ahí viene tu sueldo y tus días." },
          { value: "no", label: "No tengo contrato", description: "Es lo más común. Tus derechos valen igual." },
          { value: "nose", label: "No estoy segura", description: "Si nunca firmaste algo, cuenta como sin contrato." },
        ]}
      />
      {sinContrato ? (
        <Alert status="info" title="Tus derechos valen aunque no tengas contrato">
          La ley pide que el contrato sea por escrito (art. 331 Ter, LFT). Si no lo hay, la falta es de tus patrones, no tuya (art. 26, LFT).
        </Alert>
      ) : null}
      <Stack gap="2">
        <Button
          size="lg"
          disabled={!contrato}
          onClick={async () => {
            await terminar();
            router.push("/mis-derechos/datos");
          }}
        >
          Siguiente
        </Button>
        {sinContrato ? (
          <Button size="lg" variant="outline" asChild>
            <NextLink href="/mis-derechos/contrato/armar">Arma tu contrato</NextLink>
          </Button>
        ) : null}
        <Button size="lg" variant="ghost" asChild>
          <a href="https://caceh.org.mx" target="_blank" rel="noreferrer">
            Ver el modelo de contrato de CACEH <ExternalLink aria-hidden />
          </a>
        </Button>
      </Stack>
    </Paso>
  );
}
