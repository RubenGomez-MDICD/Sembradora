import NextLink from "next/link";
import { Box, Flex, LinkBox, LinkOverlay, Stack, Text } from "@chakra-ui/react";
import { ChevronRight, type LucideIcon } from "lucide-react";

/** Figma: componente «Card» (LinkBox con ícono, eyebrow opcional, título, descripción y chevron). */
export function SectionCard({
  href,
  title,
  description,
  eyebrow,
  icon: Icon,
}: {
  href: string;
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: LucideIcon;
}) {
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
        <Stack gap="0.5" flex="1">
          {eyebrow ? (
            <Text textStyle="overline" color="content.muted">
              {eyebrow}
            </Text>
          ) : null}
          <LinkOverlay asChild>
            <NextLink href={href}>
              <Text as="span" textStyle="h4">
                {title}
              </Text>
            </NextLink>
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
