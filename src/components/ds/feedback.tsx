"use client";

import { Box, Flex, Portal, Stack, Text, Toast, Toaster as ChakraToaster, Tooltip as CTooltip, createToaster } from "@chakra-ui/react";
import { Check, CircleAlert, CircleCheck, Info, LoaderCircle, Trash2, TriangleAlert, type LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Alert (Figma: «Alert», status info | success | warning | error)      */
/* ------------------------------------------------------------------ */

type AlertStatus = "info" | "success" | "warning" | "error";
const ALERT_ICON: Record<AlertStatus, LucideIcon> = { info: Info, success: CircleCheck, warning: TriangleAlert, error: CircleAlert };

/**
 * Aviso dentro de la pantalla. Por defecto no interrumpe al lector de pantalla
 * (es información que ya estaba ahí). Usa `live` solo cuando el aviso aparece
 * por algo que hizo la usuaria, por ejemplo un error al enviar.
 */
export function Alert({ status = "info", title, children, live = false }: { status?: AlertStatus; title: string; children?: React.ReactNode; live?: boolean }) {
  const Icon = ALERT_ICON[status];
  return (
    <Flex
      role={live ? (status === "error" ? "alert" : "status") : undefined}
      gap="3"
      p="4"
      bg={`feedback.${status}.bg`}
      borderWidth="1px"
      borderColor={`feedback.${status}.border`}
      borderRadius="l2"
    >
      <Box color={`feedback.${status}.fg`} flexShrink="0" pt="0.5">
        <Icon size={20} aria-hidden />
      </Box>
      <Stack gap="0.5">
        <Text textStyle="label" color={`feedback.${status}.fg`}>
          {title}
        </Text>
        {children ? (
          <Text as="div" textStyle="bodySm" color="content.default">
            {children}
          </Text>
        ) : null}
      </Stack>
    </Flex>
  );
}

/* ------------------------------------------------------------------ */
/* Toast (Figma: «Toast», status success | info | danger)               */
/* ------------------------------------------------------------------ */

export const toaster = createToaster({ placement: "bottom", pauseOnPageIdle: true, max: 1 });

type ToastStatus = "success" | "info" | "danger";
const TOAST_TYPE: Record<ToastStatus, string> = { success: "success", info: "info", danger: "error" };

/**
 * Muestra una confirmación específica («Se guardó: Comida · $120»).
 * Con acción (por ejemplo «Deshacer») dura 8 s para dar tiempo de leer y tocar.
 */
export function notify({ title, status = "success", action }: { title: string; status?: ToastStatus; action?: { label: string; onClick: () => void } }) {
  // Solo se ve el aviso más reciente: si la persona hace dos cosas seguidas, el anterior se va.
  toaster.dismiss();
  return toaster.create({ title, type: TOAST_TYPE[status], duration: action ? 8000 : 4000, action });
}

export function Toaster() {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline="4" insetBlockEnd="6">
        {(toast) => {
          const danger = toast.type === "error";
          const Icon = danger ? Trash2 : toast.type === "info" ? Info : CircleCheck;
          return (
            <Toast.Root bg="surface.inverted" color="content.inverted" borderRadius="l2" boxShadow="lg" px="4" py="3" gap="3" alignItems="center" width={{ base: "full", md: "sm" }}>
              <Box color={danger ? "feedback.error.fgInverted" : "brand.primary.emphasized"} flexShrink="0">
                <Icon size={20} aria-hidden />
              </Box>
              <Toast.Title flex="1" textStyle="bodySm" fontWeight="regular">
                {toast.title}
              </Toast.Title>
              {toast.action ? (
                <Toast.ActionTrigger
                  textStyle="label"
                  color={danger ? "feedback.error.fgInverted" : "brand.primary.emphasized"}
                  bg="transparent"
                  minH="11"
                  px="2"
                  _hover={{ textDecoration: "underline" }}
                >
                  {toast.action.label}
                </Toast.ActionTrigger>
              ) : null}
            </Toast.Root>
          );
        }}
      </ChakraToaster>
    </Portal>
  );
}

/* ------------------------------------------------------------------ */
/* SaveStatus (Figma: «SaveStatus», saved | saving | error)             */
/* ------------------------------------------------------------------ */

export function SaveStatus({ status, onRetry }: { status: "saved" | "saving" | "error"; onRetry?: () => void }) {
  const error = status === "error";
  const Icon = status === "saved" ? Check : status === "saving" ? LoaderCircle : CircleAlert;
  const text = status === "saved" ? "Se guardó en tu teléfono" : status === "saving" ? "Guardando…" : "No se pudo guardar. Toca para intentar de nuevo.";
  return (
    <Flex
      as={error && onRetry ? "button" : "p"}
      onClick={error ? onRetry : undefined}
      aria-live="polite"
      align="center"
      gap="1"
      textStyle="caption"
      color={error ? "feedback.error.fg" : "content.muted"}
      bg="transparent"
      textAlign="left"
      cursor={error && onRetry ? "pointer" : undefined}
    >
      <Box as="span" animation={status === "saving" ? "spin 1s linear infinite" : undefined} display="inline-flex">
        <Icon size={16} aria-hidden />
      </Box>
      {text}
    </Flex>
  );
}

/* ------------------------------------------------------------------ */
/* Tooltip (Figma: «Tooltip»)                                           */
/* ------------------------------------------------------------------ */

export function Tooltip({ content, children }: { content: string; children: React.ReactElement }) {
  return (
    <CTooltip.Root openDelay={200}>
      <CTooltip.Trigger asChild>{children}</CTooltip.Trigger>
      <Portal>
        <CTooltip.Positioner>
          <CTooltip.Content bg="surface.inverted" color="content.inverted" textStyle="caption" px="3" py="2" borderRadius="l2">
            {content}
          </CTooltip.Content>
        </CTooltip.Positioner>
      </Portal>
    </CTooltip.Root>
  );
}
