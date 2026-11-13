import type { Metadata } from "next";
import { Stack, Text } from "@chakra-ui/react";
import { Handshake, HeartPulse, Landmark, Scale, Users } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { LinkCard } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";

export const metadata: Metadata = { title: "¿Quién te apoya?" };

/**
 * Figma: AP-4 · Quién te apoya.
 * Pendiente: SINACTRAHO no tiene una página oficial verificada; por ahora su tarjeta no es enlace.
 */
const APOYOS = [
  { icon: Users, eyebrow: "Asesoría y cursos", title: "CACEH", description: "Centro de Apoyo y Capacitación para Empleadas del Hogar. Orientación, cursos y modelos de contrato.", href: "https://caceh.org.mx" },
  { icon: Handshake, eyebrow: "Organización", title: "SINACTRAHO", description: "Sindicato Nacional de Trabajadores y Trabajadoras del Hogar. Te puedes afiliar." },
  { icon: Scale, eyebrow: "Asesoría legal gratis", title: "PROFEDET", description: "Procuraduría Federal de la Defensa del Trabajo. Si te despiden o no te pagan lo que te toca.", href: "https://www.gob.mx/profedet" },
  { icon: HeartPulse, eyebrow: "Seguridad social", title: "IMSS", description: "Registro y servicios para personas trabajadoras del hogar.", href: "https://www.imss.gob.mx/personas-trabajadoras-hogar" },
  { icon: Landmark, eyebrow: "Bancos y préstamos", title: "CONDUSEF", description: "Si tienes un problema con un banco, una tarjeta o un préstamo.", href: "https://www.condusef.gob.mx" },
];

export default function Apoyos() {
  return (
    <>
      <AppHeader type="back" title="Aprende" backHref="/aprende" />
      <Screen>
        <PageTitle title="¿Quién te apoya?">Organizaciones e instituciones que te orientan gratis.</PageTitle>
        <Stack as="ul" gap="3" listStyleType="none" p="0" m="0">
          {APOYOS.map((a) => (
            <li key={a.title}>
              <LinkCard {...a} external={Boolean(a.href)} />
            </li>
          ))}
        </Stack>
        <Text textStyle="caption" color="content.subtle">
          Los enlaces abren la página oficial de cada organización en otra pestaña.
        </Text>
      </Screen>
    </>
  );
}
