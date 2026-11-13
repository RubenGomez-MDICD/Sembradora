import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box, Heading, Stack, Text } from "@chakra-ui/react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/screen";
import { SectionCard } from "@/components/section-card";
import { ROUTES, SECTIONS, findRoute, sectionChildren } from "@/lib/routes";

/**
 * Esqueleto navegable: todas las rutas del mapa del sitio existen desde el inicio
 * y muestran qué pantallas de Figma les corresponden. Cuando una ruta tenga su
 * propia carpeta en src/app, Next.js usará esa página en lugar de esta.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return ROUTES.map((r) => ({ slug: r.path.split("/").filter(Boolean) }));
}

type Params = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const route = findRoute("/" + slug.join("/"));
  return { title: route?.title };
}

export default async function Esqueleto({ params }: Params) {
  const { slug } = await params;
  const path = "/" + slug.join("/");
  const route = findRoute(path);
  if (!route) notFound();

  const section = SECTIONS[route.section];
  const isSectionIndex = section.path === path;
  const children = isSectionIndex ? sectionChildren(route.section) : [];
  const parent = path.split("/").slice(0, -1).join("/") || "/";

  return (
    <>
      <AppHeader type="back" title={isSectionIndex ? "Inicio" : section.label} backHref={isSectionIndex ? "/" : parent} />
      <Screen>
        <Stack gap="2">
          <Heading as="h1" textStyle="h2">
            {route.title}
          </Heading>
          <Text textStyle="bodySm" color="content.muted">
            {route.description}
          </Text>
        </Stack>

        <Box bg="surface.subtle" borderRadius="l3" p="4">
          <Text textStyle="overline" color="content.muted">
            En construcción
          </Text>
          <Text textStyle="bodySm" mt="1">
            Diseño en Figma: {route.figma.join(", ")}
          </Text>
        </Box>

        {children.length ? (
          <Stack as="nav" aria-label={`Páginas de ${section.label}`} gap="3">
            {children.map((c) => (
              <SectionCard key={c.path} href={c.path} title={c.title} description={c.description} />
            ))}
          </Stack>
        ) : null}
      </Screen>
    </>
  );
}
