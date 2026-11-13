/**
 * Componentes de presentación sin estado. Este archivo no lleva "use client"
 * para que las páginas del servidor puedan pasarles íconos de Lucide como props.
 */
import { Box, EmptyState as CEmptyState, Flex, LinkBox, LinkOverlay, Stack, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Card (Figma: «Card»). Tarjeta-enlace con ícono, eyebrow, título,      */
/* descripción y chevron. Toda la tarjeta es tocable.                    */
/* ------------------------------------------------------------------ */

export function LinkCard({ href, title, description, eyebrow, icon: Icon, external }: { href: string; title: string; description?: string; eyebrow?: string; icon?: LucideIcon; external?: boolean }) {
  return (
    <LinkBox
      as="article"
      bg="surface.panel"
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="l3"
      p="4"
      transition="background 120ms"
      _hover={{ bg: "surface.subtle" }}
      _focusWithin={{ outline: "2px solid", outlineColor: "interactive.focusRing", outlineOffset: "2px" }}
    >
      <Flex align="center" gap="3">
        {Icon ? (
          <Flex flexShrink="0" w="10" h="10" borderRadius="full" bg="brand.primary.subtle" color="brand.primary.fg" align="center" justify="center">
            <Icon size={20} aria-hidden />
          </Flex>
        ) : null}
        <Stack gap="0.5" flex="1" minW="0">
          {eyebrow ? (
            <Text textStyle="overline" color="content.subtle">
              {eyebrow}
            </Text>
          ) : null}
          <LinkOverlay asChild>
            {external ? (
              <a href={href} target="_blank" rel="noreferrer">
                <Text as="span" textStyle="h4">
                  {title}
                </Text>
              </a>
            ) : (
              <NextLink href={href}>
                <Text as="span" textStyle="h4">
                  {title}
                </Text>
              </NextLink>
            )}
          </LinkOverlay>
          {description ? (
            <Text textStyle="bodySm" color="content.muted">
              {description}
            </Text>
          ) : null}
        </Stack>
        <Box color="content.muted" flexShrink="0">
          <ChevronRight size={20} aria-hidden />
        </Box>
      </Flex>
    </LinkBox>
  );
}

/* FeatureItem (Figma: «FeatureItem») */
export function FeatureItem({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <Flex gap="3" align="flex-start">
      <Flex flexShrink="0" w="9" h="9" borderRadius="full" bg="brand.primary.subtle" color="brand.primary.fg" align="center" justify="center">
        <Icon size={18} aria-hidden />
      </Flex>
      <Stack gap="0.5">
        <Text textStyle="h4">{title}</Text>
        <Text textStyle="bodySm" color="content.muted">
          {description}
        </Text>
      </Stack>
    </Flex>
  );
}

/* Timeline.Item (Figma: «Timeline.Item»). Lista numerada de pasos. */
export function NumberedSteps({ items }: { items: { title: string; description: string }[] }) {
  return (
    <Stack as="ol" gap="4" listStyleType="none" p="0" m="0">
      {items.map((it, i) => (
        <Flex as="li" key={it.title} gap="3" align="flex-start">
          <Flex flexShrink="0" w="7" h="7" borderRadius="full" bg="brand.primary.muted" color="brand.primary.fg" align="center" justify="center" textStyle="label" aria-hidden>
            {i + 1}
          </Flex>
          <Stack gap="0.5">
            <Text textStyle="h4">{it.title}</Text>
            <Text textStyle="bodySm" color="content.muted">
              {it.description}
            </Text>
          </Stack>
        </Flex>
      ))}
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/* EmptyState (Figma: «EmptyState»)                                     */
/* ------------------------------------------------------------------ */

export function EmptyState({ icon: Icon, title, description, children }: { icon: LucideIcon; title: string; description?: string; children?: React.ReactNode }) {
  return (
    <CEmptyState.Root bg="surface.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="l3" px="6" py="8">
      <CEmptyState.Content gap="3">
        <CEmptyState.Indicator bg="brand.primary.subtle" color="brand.primary.fg" borderRadius="full" w="16" h="16" display="flex" alignItems="center" justifyContent="center">
          <Icon size={32} aria-hidden />
        </CEmptyState.Indicator>
        <VStack gap="1" textAlign="center">
          <CEmptyState.Title textStyle="h3">{title}</CEmptyState.Title>
          {description ? <CEmptyState.Description textStyle="bodySm" color="content.muted">{description}</CEmptyState.Description> : null}
        </VStack>
        {children ? <VStack gap="2" pt="1">{children}</VStack> : null}
      </CEmptyState.Content>
    </CEmptyState.Root>
  );
}
