import type { Metadata } from "next";
import NextLink from "next/link";
import { Button, Stack } from "@chakra-ui/react";
import { Baby, Calendar, HeartPulse, PiggyBank } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { AccordionList, FeatureItem } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";

export const metadata: Metadata = { title: "El IMSS" };

/** Figma: DR-4 · El IMSS, con DR-4b (cómo se hace) y DR-4c (varias casas) como preguntas abiertas. */
export default function Imss() {
  return (
    <>
      <AppHeader type="back" title="Mis derechos" meta="El IMSS" backHref="/mis-derechos" />
      <Screen>
        <PageTitle title="¿Qué te da el IMSS?">Con tu registro, tú y tu familia tienen estos servicios.</PageTitle>
        <Stack as="ul" gap="5" listStyleType="none" p="0" m="0">
          <li>
            <FeatureItem icon={HeartPulse} title="Atención médica" description="Consulta, medicinas y hospital para ti y tu familia." />
          </li>
          <li>
            <FeatureItem icon={Calendar} title="Incapacidad pagada" description="Si te enfermas o te lastimas, recibes parte de tu sueldo." />
          </li>
          <li>
            <FeatureItem icon={PiggyBank} title="Ahorro para el retiro" description="Una cuenta a tu nombre para cuando ya no trabajes." />
          </li>
          <li>
            <FeatureItem icon={Baby} title="Guardería" description="Para tus hijas e hijos mientras trabajas." />
          </li>
        </Stack>
        <AccordionList
          defaultOpen={["quien"]}
          items={[
            { value: "quien", title: "¿Quién paga el registro?", content: "Tus patrones hacen el registro y pagan las cuotas. El registro es gratis: nadie te puede cobrar por hacerlo." },
            {
              value: "como",
              title: "¿Cómo se hace?",
              content:
                "Tus patrones entran a imss.gob.mx/personas-trabajadoras-hogar con su CURP y su correo. Registran tu CURP, tu número de seguridad social y tu domicilio, si trabajas el mes completo o por días, y tu sueldo real, que no puede ser menor al mínimo. Al final reciben una línea de captura para pagar cada mes, cada dos meses, cada seis meses o cada año.",
            },
            { value: "varias", title: "¿Y si trabajo en varias casas?", content: "Cada casa te registra por su lado y paga sus propias cuotas por los días que trabajas ahí. No tienen que ponerse de acuerdo entre ellos." },
          ]}
        />
        <Button size="lg" asChild>
          <NextLink href="/mis-derechos/platicarlo">Cómo platicarlo con mis patrones</NextLink>
        </Button>
      </Screen>
    </>
  );
}
