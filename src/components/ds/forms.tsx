"use client";

import {
  Box,
  CheckboxCard,
  Field,
  Flex,
  Input,
  InputGroup,
  NativeSelect,
  PinInput,
  RadioCard,
  RadioGroup,
  SegmentGroup,
  SimpleGrid,
  Stack,
  Text,
  type InputProps,
} from "@chakra-ui/react";
import { Calendar, Plus, type LucideIcon } from "lucide-react";

const controlStyles = {
  bg: "surface.panel",
  borderWidth: "1px",
  borderColor: "border.default",
  borderRadius: "l2",
  color: "content.default",
  _focusVisible: { borderColor: "interactive.focusRing", boxShadow: "0 0 0 1px var(--chakra-colors-interactive-focus-ring)", outline: "none" },
  _invalid: { borderColor: "feedback.error.fg", boxShadow: "0 0 0 1px var(--chakra-colors-feedback-error-fg)" },
  _disabled: { bg: "interactive.disabledBg", color: "interactive.disabledFg", opacity: 1 },
} as const;

function FieldShell({ label, helperText, error, children, required }: { label: string; helperText?: string; error?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <Field.Root invalid={!!error} required={required} gap="1">
      <Field.Label textStyle="label" color="content.default">
        {label}
      </Field.Label>
      {children}
      {error ? (
        <Field.ErrorText textStyle="caption" color="feedback.error.fg">
          {error}
        </Field.ErrorText>
      ) : helperText ? (
        <Field.HelperText textStyle="caption" color="content.muted">
          {helperText}
        </Field.HelperText>
      ) : null}
    </Field.Root>
  );
}

/* ------------------------------------------------------------------ */
/* Input (Figma: «Input», size md | lg; prefijo y sufijo opcionales)     */
/* lg es el campo grande de montos («$ 120»).                            */
/* ------------------------------------------------------------------ */

export function TextField({ label, helperText, error, prefix, suffix, size = "md", ...input }: { label: string; helperText?: string; error?: string; prefix?: string; suffix?: string; size?: "md" | "lg" } & Omit<InputProps, "size" | "prefix">) {
  const lg = size === "lg";
  return (
    <FieldShell label={label} helperText={helperText} error={error} required={input.required}>
      <InputGroup
        startElement={prefix ? <Text as="span" textStyle={lg ? "h2" : "body"} color="content.subtle">{prefix}</Text> : undefined}
        endElement={suffix ? <Text as="span" textStyle="bodySm" color="content.subtle">{suffix}</Text> : undefined}
      >
        <Input {...controlStyles} h={lg ? "72px" : "52px"} textStyle={lg ? "display" : "body"} px="4" {...input} />
      </InputGroup>
    </FieldShell>
  );
}

/* Select (Figma: «Select»). Se usa el select nativo: en teléfonos abre la lista del sistema, que es más fácil de usar. */
export function SelectField({ label, helperText, error, options, icon: Icon, ...rest }: { label: string; helperText?: string; error?: string; options: { value: string; label: string }[]; icon?: LucideIcon } & React.ComponentProps<typeof NativeSelect.Field>) {
  return (
    <FieldShell label={label} helperText={helperText} error={error}>
      <NativeSelect.Root position="relative">
        {Icon ? (
          <Box position="absolute" left="4" top="50%" transform="translateY(-50%)" zIndex="1" pointerEvents="none" color="content.default">
            <Icon size={20} aria-hidden />
          </Box>
        ) : null}
        <NativeSelect.Field {...controlStyles} h="52px" textStyle="body" ps={Icon ? "12" : "4"} {...rest}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator color="content.default" />
      </NativeSelect.Root>
    </FieldShell>
  );
}

/* DateInput (Figma: «DateInput»). Selector de fecha nativo. */
export function DateField({ label, helperText, error, ...input }: { label: string; helperText?: string; error?: string } & InputProps) {
  return (
    <FieldShell label={label} helperText={helperText} error={error}>
      <InputGroup startElement={<Calendar size={20} aria-hidden />}>
        <Input
          type="date"
          {...controlStyles}
          h="52px"
          textStyle="body"
          position="relative"
          css={{
            // Un solo ícono: el selector nativo se vuelve invisible y cubre todo el campo, así cualquier toque abre el calendario.
            "&::-webkit-calendar-picker-indicator": { position: "absolute", inset: 0, width: "auto", height: "auto", opacity: 0, cursor: "pointer" },
          }}
          {...input}
        />
      </InputGroup>
    </FieldShell>
  );
}

/* ------------------------------------------------------------------ */
/* CheckboxCard (Figma: «CheckboxCard»)                                  */
/* ------------------------------------------------------------------ */

export function CheckboxCardItem({ label, description, ...root }: { label: string; description?: string } & React.ComponentProps<typeof CheckboxCard.Root>) {
  return (
    <CheckboxCard.Root
      bg="surface.panel"
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="l2"
      _checked={{ bg: "interactive.selectedBg", borderColor: "interactive.selectedBorder" }}
      {...root}
    >
      <CheckboxCard.HiddenInput />
      <CheckboxCard.Control px="4" py="3" gap="3" alignItems="center" flexDirection="row">
        <CheckboxCard.Indicator borderRadius="l1" boxSize="5" borderColor="border.default" _checked={{ bg: "brand.primary.solid", borderColor: "brand.primary.solid", color: "brand.primary.contrast" }} />
        <CheckboxCard.Content gap="0">
          <CheckboxCard.Label textStyle="body" fontWeight="regular" color="content.default">
            {label}
          </CheckboxCard.Label>
          {description ? (
            <CheckboxCard.Description textStyle="caption" color="content.muted">
              {description}
            </CheckboxCard.Description>
          ) : null}
        </CheckboxCard.Content>
      </CheckboxCard.Control>
    </CheckboxCard.Root>
  );
}

/* ------------------------------------------------------------------ */
/* RadioCard (Figma: «RadioCard») · grupo vertical de opciones           */
/* ------------------------------------------------------------------ */

export type Option = { value: string; label: string; description?: string };

export function RadioCardGroup({ label, options, ...root }: { label?: string; options: Option[] } & React.ComponentProps<typeof RadioCard.Root>) {
  return (
    <RadioCard.Root orientation="vertical" display="flex" flexDirection="column" gap="3" {...root}>
      {label ? (
        <RadioCard.Label textStyle="label" color="content.default">
          {label}
        </RadioCard.Label>
      ) : null}
      {options.map((o) => (
        <RadioCard.Item
          key={o.value}
          value={o.value}
          bg="surface.panel"
          borderWidth="1px"
          borderColor="border.subtle"
          borderRadius="l2"
          _checked={{ bg: "interactive.selectedBg", borderColor: "interactive.selectedBorder" }}
        >
          <RadioCard.ItemHiddenInput />
          <RadioCard.ItemControl px="4" py="3" gap="3" alignItems="center" flexDirection="row">
            <RadioCard.ItemIndicator boxSize="5" borderColor="border.default" _checked={{ borderColor: "brand.primary.solid", borderWidth: "6px", bg: "surface.panel" }} />
            <RadioCard.ItemContent gap="0">
              <RadioCard.ItemText textStyle="body" fontWeight="regular" color="content.default">
                {o.label}
              </RadioCard.ItemText>
              {o.description ? (
                <RadioCard.ItemDescription textStyle="caption" color="content.muted">
                  {o.description}
                </RadioCard.ItemDescription>
              ) : null}
            </RadioCard.ItemContent>
          </RadioCard.ItemControl>
        </RadioCard.Item>
      ))}
    </RadioCard.Root>
  );
}

/* Radio en línea (Figma: «Radio»), con etiqueta de grupo como «Es un:». */
export function RadioInline({ label, options, ...root }: { label: string; options: Option[] } & React.ComponentProps<typeof RadioGroup.Root>) {
  return (
    <RadioGroup.Root display="flex" flexDirection="column" gap="1" {...root}>
      <RadioGroup.Label textStyle="label" color="content.default">
        {label}
      </RadioGroup.Label>
      <Flex gap="8">
        {options.map((o) => (
          <RadioGroup.Item key={o.value} value={o.value} minH="11" gap="3">
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator boxSize="5" borderColor="border.default" _checked={{ borderColor: "brand.primary.solid", borderWidth: "6px", bg: "surface.panel" }} />
            <RadioGroup.ItemText textStyle="body">{o.label}</RadioGroup.ItemText>
          </RadioGroup.Item>
        ))}
      </Flex>
    </RadioGroup.Root>
  );
}

/* ------------------------------------------------------------------ */
/* CategoryTile (Figma: «CategoryTile», default | selected | add)        */
/* Cuadrícula de 2 columnas; el último mosaico agrega una categoría.     */
/* ------------------------------------------------------------------ */

export function CategoryTiles({ label, options, onAdd, ...root }: { label: string; options: (Option & { icon: LucideIcon })[]; onAdd?: () => void } & React.ComponentProps<typeof RadioCard.Root>) {
  return (
    <RadioCard.Root {...root}>
      <RadioCard.Label srOnly>{label}</RadioCard.Label>
      <SimpleGrid columns={2} gap="2">
        {options.map(({ value, label: l, icon: Icon }) => (
          <RadioCard.Item key={value} value={value} bg="surface.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="l2" _checked={{ bg: "interactive.selectedBg", borderColor: "interactive.selectedBorder" }}>
            <RadioCard.ItemHiddenInput />
            <RadioCard.ItemControl flexDirection="column" alignItems="center" gap="2" px="3" py="4">
              <Flex w="10" h="10" borderRadius="full" bg="surface.muted" align="center" justify="center" css={{ "[data-state=checked] &": { background: "var(--chakra-colors-brand-primary-emphasized)" } }}>
                <Icon size={20} aria-hidden />
              </Flex>
              <RadioCard.ItemText textStyle="label" textAlign="center">
                {l}
              </RadioCard.ItemText>
            </RadioCard.ItemControl>
          </RadioCard.Item>
        ))}
        {onAdd ? (
          <Flex
            as="button"
            onClick={onAdd}
            direction="column"
            align="center"
            justify="center"
            gap="2"
            px="3"
            py="4"
            borderRadius="l2"
            borderWidth="1px"
            borderStyle="dashed"
            borderColor="border.default"
            color="brand.primary.fg"
            bg="transparent"
            _hover={{ bg: "brand.primary.subtle" }}
          >
            <Plus size={20} aria-hidden />
            <Text as="span" textStyle="label">
              Nueva
            </Text>
          </Flex>
        ) : null}
      </SimpleGrid>
    </RadioCard.Root>
  );
}

/* ------------------------------------------------------------------ */
/* SegmentGroup (Figma: «SegmentGroup», 2 o 3 opciones)                  */
/* En código mide 44 px de alto (en Figma 38) por área táctil.           */
/* ------------------------------------------------------------------ */

export function Segmented({ label, items, ...root }: { label: string; items: { value: string; label: string }[] } & React.ComponentProps<typeof SegmentGroup.Root>) {
  return (
    <SegmentGroup.Root aria-label={label} w="full" bg="surface.muted" p="0.5" borderRadius="l2" h="11" {...root}>
      <SegmentGroup.Indicator bg="surface.panel" boxShadow="xs" borderRadius="l1" />
      {items.map((i) => (
        <SegmentGroup.Item key={i.value} value={i.value} flex="1" justifyContent="center" textStyle="label" color="content.muted" _checked={{ color: "content.default" }}>
          <SegmentGroup.ItemText>{i.label}</SegmentGroup.ItemText>
          <SegmentGroup.ItemHiddenInput />
        </SegmentGroup.Item>
      ))}
    </SegmentGroup.Root>
  );
}

/* FilterChip (Figma: «FilterChip»). Una sola opción activa a la vez. */
export function FilterChips({ label, options, value, onChange }: { label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <Flex role="group" aria-label={label} gap="2" overflowX="auto" pb="1">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Box
            as="button"
            key={o.value}
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            flexShrink="0"
            minH="11"
            px="4"
            borderRadius="full"
            borderWidth="1px"
            borderColor={on ? "brand.primary.solid" : "border.subtle"}
            bg={on ? "brand.primary.subtle" : "surface.panel"}
            color={on ? "brand.primary.fg" : "content.muted"}
            textStyle="label"
          >
            {o.label}
          </Box>
        );
      })}
    </Flex>
  );
}

/* IconOption (Figma: «IconOption»). Elegir ícono para una categoría o meta propia. */
export function IconOptions({ label, options, value, onChange }: { label: string; options: { value: string; label: string; icon: LucideIcon }[]; value: string; onChange: (v: string) => void }) {
  return (
    <Stack gap="2">
      <Text id="icon-options-label" textStyle="label">
        {label}
      </Text>
      <Flex role="radiogroup" aria-labelledby="icon-options-label" wrap="wrap" gap="3">
        {options.map(({ value: v, label: l, icon: Icon }) => {
          const on = v === value;
          return (
            <Flex
              as="button"
              key={v}
              role="radio"
              aria-checked={on}
              aria-label={l}
              onClick={() => onChange(v)}
              w="14"
              h="14"
              align="center"
              justify="center"
              borderRadius="l3"
              borderWidth={on ? "2px" : "1px"}
              borderColor={on ? "brand.primary.solid" : "border.subtle"}
              bg={on ? "brand.primary.subtle" : "surface.panel"}
              color={on ? "brand.primary.fg" : "content.muted"}
            >
              <Icon size={24} aria-hidden />
            </Flex>
          );
        })}
      </Flex>
    </Stack>
  );
}

/* PinInput (Figma: «PinInput»). 4 números, ocultos. */
export function PinField({ label, helperText, ...root }: { label: string; helperText?: string } & React.ComponentProps<typeof PinInput.Root>) {
  return (
    <PinInput.Root mask otp count={4} type="numeric" {...root}>
      <Stack gap="2" align="center">
        <PinInput.Label textStyle="label">{label}</PinInput.Label>
        <PinInput.HiddenInput />
        <PinInput.Control display="flex" gap="3">
          {[0, 1, 2, 3].map((i) => (
            <PinInput.Input key={i} index={i} w="14" h="16" textStyle="h2" {...controlStyles} />
          ))}
        </PinInput.Control>
        {helperText ? (
          <Text textStyle="caption" color="content.muted">
            {helperText}
          </Text>
        ) : null}
      </Stack>
    </PinInput.Root>
  );
}

