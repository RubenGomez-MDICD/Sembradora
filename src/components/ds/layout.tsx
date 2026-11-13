"use client";

import {
  Accordion,
  Box,
  Button,
  Clipboard,
  CloseButton,
  Drawer,
  Flex,
  IconButton,
  Portal,
  Stack,
  Text,
  type ButtonProps,
} from "@chakra-ui/react";
import { Check, ChevronDown, Copy } from "lucide-react";

/* Steps (Figma: «Steps»). Barra de avance de un flujo, con su texto para lectores de pantalla. */
export function StepsBar({ total, current }: { total: number; current: number }) {
  return (
    <Flex role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current} aria-valuetext={`Paso ${current} de ${total}`} gap="1">
      {Array.from({ length: total }, (_, i) => (
        <Box key={i} flex="1" h="1" borderRadius="full" bg={i < current ? "brand.primary.solid" : "surface.muted"} />
      ))}
    </Flex>
  );
}

/* Accordion.Item (Figma: «Accordion.Item»). Varias preguntas abiertas a la vez. */
export function AccordionList({ items, defaultOpen = [] }: { items: { value: string; title: string; content: React.ReactNode }[]; defaultOpen?: string[] }) {
  return (
    <Accordion.Root multiple collapsible defaultValue={defaultOpen} borderWidth="1px" borderColor="border.subtle" borderRadius="l3" overflow="hidden">
      {items.map((it) => (
        <Accordion.Item key={it.value} value={it.value} bg="surface.panel" borderBottomWidth="1px" borderColor="border.subtle" _last={{ borderBottomWidth: "0" }} _open={{ bg: "brand.primary.subtle" }}>
          <Accordion.ItemTrigger px="4" py="4" gap="3" textStyle="h4" cursor="pointer" minH="11">
            <Text as="span" flex="1" textAlign="left">
              {it.title}
            </Text>
            <Accordion.ItemIndicator color="content.default">
              <ChevronDown size={20} aria-hidden />
            </Accordion.ItemIndicator>
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody px="4" pt="0" pb="4" textStyle="bodySm" color="content.muted">
              {it.content}
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

/* BackupCode (Figma: «BackupCode»). Código de respaldo con botón para copiar. */
export function BackupCode({ code }: { code: string }) {
  return (
    <Stack bg="brand.secondary.subtle" borderWidth="1px" borderStyle="dashed" borderColor="brand.secondary.border" borderRadius="l3" p="4" gap="3">
      <Text textStyle="overline" color="brand.secondary.fg">
        Tu código de respaldo
      </Text>
      <Clipboard.Root value={code}>
        <Flex align="center" gap="3">
          <Text flex="1" fontFamily="heading" fontWeight="extrabold" fontSize="h2" letterSpacing="0.08em" color="content.default">
            {code}
          </Text>
          <Clipboard.Trigger asChild>
            <IconButton aria-label="Copiar código" variant="outline">
              <Clipboard.Indicator copied={<Check />}>
                <Copy />
              </Clipboard.Indicator>
            </IconButton>
          </Clipboard.Trigger>
        </Flex>
      </Clipboard.Root>
      <Text textStyle="caption" color="content.default">
        Anótalo en un lugar seguro. Sin este código nadie puede recuperar tus datos, ni siquiera nosotros.
      </Text>
    </Stack>
  );
}

/* Drawer (Figma: «Drawer»). Panel inferior con asa, encabezado, contenido libre y acciones. */
export function BottomSheet({ open, onOpenChange, eyebrow, title, children, footer }: { open: boolean; onOpenChange: (open: boolean) => void; eyebrow?: string; title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <Drawer.Root placement="bottom" open={open} onOpenChange={(e) => onOpenChange(e.open)}>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg="surface.panel" borderTopRadius="l4" maxW="lg" mx="auto" boxShadow="xl">
            <Box w="10" h="1" bg="border.default" borderRadius="full" mx="auto" mt="3" aria-hidden />
            <Drawer.Header px="4" pt="4" pb="2" flexDirection="column" alignItems="flex-start" gap="0.5">
              {eyebrow ? (
                <Text textStyle="overline" color="content.subtle">
                  {eyebrow}
                </Text>
              ) : null}
              <Drawer.Title textStyle="h2">{title}</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body px="4" py="2" textStyle="body">
              {children}
            </Drawer.Body>
            {footer ? (
              <Drawer.Footer px="4" pt="4" pb="6" flexDirection="column" gap="2" alignItems="stretch">
                {footer}
              </Drawer.Footer>
            ) : null}
            <Drawer.CloseTrigger asChild>
              <CloseButton aria-label="Cerrar" size="md" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

/* Button.Danger (Figma: «Button.Danger»). Acciones que borran o reemplazan datos. */
export function DangerButton({ variant = "solid", ...props }: ButtonProps) {
  return <Button colorPalette="danger" variant={variant} {...(variant === "outline" ? { css: { "--outline-color": "var(--chakra-colors-feedback-error-border)" } } : {})} {...props} />;
}
