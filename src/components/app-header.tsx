"use client";

import NextLink from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Box, CloseButton, Drawer, Flex, IconButton, Link, Portal, Separator, Stack, Text } from "@chakra-ui/react";
import { ArrowLeft, BookOpen, CloudUpload, HandCoins, House, Info, Lock, Menu, PiggyBank, Scale, Wallet } from "lucide-react";

/** Figma: componente «AppHeader» (type=home | back). */
type Props =
  | { type: "home" }
  | { type: "back"; title: string; meta?: string; backHref?: string };

const NAV = [
  { href: "/", label: "Inicio", icon: House },
  { href: "/mi-sueldo", label: "Mi sueldo", icon: HandCoins },
  { href: "/mi-dinero", label: "Mi dinero", icon: Wallet },
  { href: "/mis-ahorros", label: "Mis ahorros", icon: PiggyBank },
  { href: "/mis-derechos", label: "Mis derechos", icon: Scale },
  { href: "/aprende", label: "Aprende", icon: BookOpen },
];
const NAV_EXTRA = [
  { href: "/mi-dinero/respaldo", label: "Tu respaldo", icon: CloudUpload },
  { href: "/mi-dinero/pin", label: "Proteger con PIN", icon: Lock },
  { href: "/fuentes", label: "Fuentes y créditos", icon: Info },
];

export function AppHeader(props: Props) {
  const router = useRouter();

  return (
    <Box as="header" position="sticky" top="0" zIndex="sticky" bg="surface.panel" borderBottomWidth="1px" borderColor="border.subtle">
      <Flex maxW="lg" mx="auto" h="14" px="2" align="center" gap="1">
        {props.type === "home" ? (
          <>
            <Text flex="1" px="2" textStyle="h4" color="brand.primary.fg">
              La sembradora
            </Text>
            <MenuDrawer />
          </>
        ) : (
          <>
            <IconButton
              aria-label="Regresar"
              variant="ghost"
              colorPalette="gray"
              size="md"
              onClick={() => (props.backHref ? router.push(props.backHref) : router.back())}
            >
              <ArrowLeft />
            </IconButton>
            <Text as="span" flex="1" textStyle="label" truncate>
              {props.title}
            </Text>
            {props.meta ? (
              <Text as="span" pr="3" textStyle="caption" color="content.muted">
                {props.meta}
              </Text>
            ) : null}
          </>
        )}
      </Flex>
    </Box>
  );
}

/** Figma: IN-2 · Menú (Drawer lateral con NavItem). */
function MenuDrawer() {
  const pathname = usePathname();
  const item = ({ href, label, icon: Icon }: (typeof NAV)[number]) => {
    const current = pathname === href;
    return (
      <Drawer.ActionTrigger asChild key={href}>
        <Link
          asChild
          display="flex"
          alignItems="center"
          gap="4"
          minH="12"
          px="4"
          borderRadius="l2"
          textStyle="body"
          textDecoration="none"
          color={current ? "brand.primary.fg" : "content.default"}
          bg={current ? "brand.primary.subtle" : "transparent"}
          _hover={{ bg: "surface.subtle", textDecoration: "none" }}
          aria-current={current ? "page" : undefined}
        >
          <NextLink href={href}>
            <Icon size={20} aria-hidden />
            {label}
          </NextLink>
        </Link>
      </Drawer.ActionTrigger>
    );
  };

  return (
    <Drawer.Root placement="end" size="xs">
      <Drawer.Trigger asChild>
        <IconButton aria-label="Abrir menú" variant="ghost" colorPalette="gray" size="md">
          <Menu />
        </IconButton>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg="surface.panel">
            <Drawer.Header>
              <Drawer.Title textStyle="h3">Menú</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body px="2">
              <Stack as="nav" aria-label="Secciones" gap="1">
                {NAV.map(item)}
                <Separator my="2" borderColor="border.subtle" />
                {NAV_EXTRA.map(item)}
              </Stack>
            </Drawer.Body>
            <Drawer.Footer justifyContent="flex-start">
              <Text textStyle="caption" color="content.muted">
                Tus datos se guardan solo en este teléfono.
              </Text>
            </Drawer.Footer>
            <Drawer.CloseTrigger asChild>
              <CloseButton aria-label="Cerrar menú" size="md" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
