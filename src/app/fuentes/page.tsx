import type { Metadata } from "next";
import { Stack, Text } from "@chakra-ui/react";
import { FileText, HandCoins, HeartPulse, Info, Scale } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { FeatureItem } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";

export const metadata: Metadata = { title: "Fuentes y créditos" };

/** Figma: IN-3 · Fuentes y créditos */
const FUENTES = [
  { icon: HandCoins, title: "Tabulador de Salario Digno", description: "CACEH (2024). Base del cálculo de Mi sueldo." },
  { icon: FileText, title: "Salarios mínimos 2026", description: "CONASAMI. Tabla de salarios mínimos generales y profesionales." },
  { icon: Scale, title: "Ley Federal del Trabajo", description: "Cámara de Diputados. Capítulo XIII, trabajo del hogar." },
  { icon: HeartPulse, title: "Personas trabajadoras del hogar", description: "IMSS. Registro, cuotas y preguntas frecuentes." },
  { icon: Info, title: "Íconos", description: "Lucide, licencia ISC." },
];

export default function Fuentes() {
  return (
    <>
      <AppHeader type="back" title="Inicio" backHref="/" />
      <Screen>
        <PageTitle title="Fuentes y créditos">De dónde salen los datos y los cálculos.</PageTitle>
        <Stack as="ul" gap="5" listStyleType="none" p="0" m="0">
          {FUENTES.map((f) => (
            <li key={f.title}>
              <FeatureItem {...f} />
            </li>
          ))}
        </Stack>
        <Text textStyle="bodySm" color="content.muted">
          Este sitio es parte de la tesis «Cartografías de la vulnerabilidad», Maestría en Diseño de Información y Comunicación Digital, Universidad de Guadalajara. Los montos son orientativos; para tu caso, busca asesoría.
        </Text>
      </Screen>
    </>
  );
}
