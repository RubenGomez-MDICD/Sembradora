import { Box, DataList as CDataList, Flex, LinkBox, LinkOverlay, Progress, Stack, Stat as CStat, Text, VisuallyHidden } from "@chakra-ui/react";
import NextLink from "next/link";
import type { LucideIcon } from "lucide-react";
import { formatMoney } from "@/lib/format";

/* ------------------------------------------------------------------ */
/* Stat (Figma: «Stat», tone primary | neutral)                          */
/* ------------------------------------------------------------------ */

export function Stat({ label, value, helpText, tone = "primary" }: { label: string; value: string; helpText?: string; tone?: "primary" | "neutral" }) {
  return (
    <CStat.Root bg={tone === "primary" ? "brand.primary.subtle" : "surface.subtle"} borderRadius="l3" p="6" gap="1">
      <CStat.Label textStyle="bodySm" color="content.muted">
        {label}
      </CStat.Label>
      <CStat.ValueText textStyle="display" color="content.default">
        {value}
      </CStat.ValueText>
      {helpText ? (
        <CStat.HelpText textStyle="bodySm" color="content.muted">
          {helpText}
        </CStat.HelpText>
      ) : null}
    </CStat.Root>
  );
}

/* ------------------------------------------------------------------ */
/* Progress (Figma: «Progress», tone primary | secondary)                */
/* El valor es exacto (no se redondea a decenas como en Figma).          */
/* ------------------------------------------------------------------ */

export function ProgressBar({ label, amount, value, tone = "primary", showLabel = true }: { label: string; amount?: string; value: number; tone?: "primary" | "secondary" | "neutral"; showLabel?: boolean }) {
  const range = tone === "primary" ? "brand.primary.solid" : tone === "secondary" ? "brand.secondary.solid" : "content.default";
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <Progress.Root value={clamped} max={100} gap="1" display="flex" flexDirection="column">
      {showLabel ? (
        <Flex justify="space-between" gap="2">
          <Progress.Label textStyle="bodySm" fontWeight="regular" color="content.default">
            {label}
          </Progress.Label>
          {amount ? (
            <Progress.ValueText textStyle="label" color="content.default">
              {amount}
            </Progress.ValueText>
          ) : null}
        </Flex>
      ) : (
        <VisuallyHidden>
          <Progress.Label>{label}</Progress.Label>
        </VisuallyHidden>
      )}
      <Progress.Track h="2" bg="surface.muted" borderRadius="full">
        <Progress.Range bg={range} borderRadius="full" />
      </Progress.Track>
    </Progress.Root>
  );
}

/* ------------------------------------------------------------------ */
/* DataList (Figma: «DataList.Item», term plain | glossary)              */
/* ------------------------------------------------------------------ */

export type DataRow = { label: string; value: string; note?: React.ReactNode; onTermClick?: () => void };

export function DataList({ rows }: { rows: DataRow[] }) {
  return (
    <CDataList.Root orientation="horizontal" gap="0">
      {rows.map((r) => (
        <CDataList.Item key={r.label} py="3" gap="3" borderBottomWidth="1px" borderColor="border.subtle" alignItems="center" justifyContent="space-between">
          <CDataList.ItemLabel display="flex" flexDirection="column" alignItems="flex-start" textAlign="left" minW="0" color="content.default" flex="1">
            {r.onTermClick ? (
              <Box
                as="button"
                onClick={r.onTermClick}
                textAlign="left"
                textStyle="body"
                color="interactive.link"
                textDecoration="underline"
                textDecorationStyle="dotted"
                textUnderlineOffset="3px"
                aria-haspopup="dialog"
              >
                {r.label}
              </Box>
            ) : (
              <Text as="span" textStyle="body">
                {r.label}
              </Text>
            )}
            {r.note ? (
              <Text as="span" textStyle="caption" color="content.subtle">
                {r.note}
              </Text>
            ) : null}
          </CDataList.ItemLabel>
          <CDataList.ItemValue flex="none" textStyle="h4" color="content.default">
            {r.value}
          </CDataList.ItemValue>
        </CDataList.Item>
      ))}
    </CDataList.Root>
  );
}

/* ------------------------------------------------------------------ */
/* MovementRow (Figma: «MovementRow», type gasto | ingreso)              */
/* ------------------------------------------------------------------ */

export function MovementRow({ kind, category, note, amountCents, icon: Icon, onSelect }: { kind: "gasto" | "ingreso"; category: string; note?: string; amountCents: number; icon: LucideIcon; onSelect?: () => void }) {
  const ingreso = kind === "ingreso";
  return (
    <Flex
      as={onSelect ? "button" : "div"}
      onClick={onSelect}
      w="full"
      textAlign="left"
      align="center"
      gap="3"
      py="3"
      borderBottomWidth="1px"
      borderColor="border.subtle"
      bg="transparent"
      _hover={onSelect ? { bg: "surface.subtle" } : undefined}
    >
      <Flex flexShrink="0" w="10" h="10" borderRadius="full" bg={ingreso ? "feedback.success.bg" : "surface.muted"} color={ingreso ? "feedback.success.fg" : "content.default"} align="center" justify="center">
        <Icon size={20} aria-hidden />
      </Flex>
      <Stack gap="0" flex="1" minW="0">
        <Text textStyle="body">{category}</Text>
        {note ? (
          <Text textStyle="caption" color="content.subtle" truncate>
            {note}
          </Text>
        ) : null}
      </Stack>
      <Text textStyle="h4" color={ingreso ? "feedback.success.fg" : "content.default"} flexShrink="0">
        <VisuallyHidden>{ingreso ? "Ingreso de " : "Gasto de "}</VisuallyHidden>
        {formatMoney(ingreso ? amountCents : -amountCents, { sign: "always" })}
      </Text>
    </Flex>
  );
}

/* ------------------------------------------------------------------ */
/* DebtCard (Figma: «DebtCard»)                                          */
/* ------------------------------------------------------------------ */

export function DebtCard({ href, title, kind, owedCents, paidCents, totalCents, next, icon: Icon }: { href: string; title: string; kind: string; owedCents: number; paidCents: number; totalCents: number; next: string; icon: LucideIcon }) {
  const value = totalCents > 0 ? (paidCents / totalCents) * 100 : 0;
  return (
    <LinkBox as="article" bg="surface.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="l3" p="4" display="flex" flexDirection="column" gap="3" _hover={{ bg: "surface.subtle" }}>
      <Flex align="center" gap="3">
        <Flex flexShrink="0" w="10" h="10" borderRadius="full" bg="surface.muted" align="center" justify="center">
          <Icon size={22} aria-hidden />
        </Flex>
        <Stack gap="1" flex="1" minW="0">
          <LinkOverlay asChild>
            <NextLink href={href}>
              <Text as="span" textStyle="h4">
                {title}
              </Text>
            </NextLink>
          </LinkOverlay>
          <Text textStyle="caption" color="content.muted">
            {kind}
          </Text>
        </Stack>
        <Stack gap="0" align="flex-end" flexShrink="0">
          <Text textStyle="h4">{formatMoney(owedCents)}</Text>
          <Text textStyle="caption" color="content.muted">
            te falta
          </Text>
        </Stack>
      </Flex>
      <ProgressBar label="Pagado" amount={`${formatMoney(paidCents)} de ${formatMoney(totalCents)}`} value={value} />
      <Text textStyle="caption" color="content.muted">
        {next}
      </Text>
    </LinkBox>
  );
}

/* ------------------------------------------------------------------ */
/* Chart.WeekBars (Figma: «Chart.WeekBars», style neutral | referencia)  */
/* Barras desde cero, monto visible, días futuros vacíos.                */
/* Incluye una tabla oculta para lectores de pantalla.                   */
/* ------------------------------------------------------------------ */

export type DayValue = { day: string; cents: number | null; today?: boolean };

export function WeekBars({ title = "Gastos por día", totalLabel, days, note, referenceCents }: { title?: string; totalLabel: string; days: DayValue[]; note?: string; referenceCents?: number }) {
  const max = Math.max(1, ...days.map((d) => d.cents ?? 0), referenceCents ?? 0);
  const H = 72;
  return (
    <Box as="figure" bg="surface.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="l3" p="4" m="0">
      <Flex justify="space-between" mb="3" aria-hidden>
        <Text textStyle="label">{title}</Text>
        <Text textStyle="label" color="content.muted">
          {totalLabel}
        </Text>
      </Flex>
      <Flex gap="1" align="flex-end" h="28" position="relative" aria-hidden>
        {referenceCents ? <Box position="absolute" left="0" right="0" bottom={`${18 + Math.round((H * referenceCents) / max)}px`} borderTopWidth="1px" borderStyle="dashed" borderColor="content.muted" /> : null}
        {days.map((d) => {
          const over = referenceCents != null && d.cents != null && d.cents > referenceCents;
          return (
            <Flex key={d.day} direction="column" align="center" justify="flex-end" gap="1" flex="1" h="full">
              <Text textStyle="caption" color={over ? "feedback.warning.fg" : "content.muted"}>
                {d.cents == null ? " " : formatMoney(d.cents)}
              </Text>
              <Box w="6" h={d.cents == null ? "2px" : `${Math.max(4, Math.round((H * d.cents) / max))}px`} bg={d.cents == null ? "border.subtle" : over ? "feedback.warning.solid" : "content.subtle"} borderTopRadius="sm" />
              <Text textStyle="caption" color={d.today ? "content.default" : "content.muted"} fontWeight={d.today ? "semibold" : "regular"}>
                {d.day}
              </Text>
            </Flex>
          );
        })}
      </Flex>
      {note ? (
        <Text as="figcaption" textStyle="caption" color="content.muted" mt="3">
          {note}
        </Text>
      ) : null}
      <VisuallyHidden>
        <table>
          <caption>{`${title}. ${totalLabel}.`}</caption>
          <tbody>
            {days.map((d) => (
              <tr key={d.day}>
                <th scope="row">{d.day}</th>
                <td>{d.cents == null ? "sin datos todavía" : formatMoney(d.cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </VisuallyHidden>
    </Box>
  );
}

/** Chart.WeekPace: cuánto del ingreso ya se gastó contra cuántos días pasaron. */
export function WeekPace({ spentCents, incomeCents, daysPassed, note }: { spentCents: number; incomeCents: number; daysPassed: number; note?: string }) {
  const spentPct = incomeCents > 0 ? (spentCents / incomeCents) * 100 : 0;
  const daysPct = (daysPassed / 7) * 100;
  return (
    <Stack bg="surface.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="l3" p="4" gap="3">
      <Text textStyle="label">Tu ritmo esta semana</Text>
      <ProgressBar label="Gastaste de lo que te entró" amount={`${formatMoney(spentCents)} de ${formatMoney(incomeCents)} · ${Math.round(spentPct)} %`} value={spentPct} tone="neutral" />
      <ProgressBar label="Días de la semana que pasaron" amount={`${daysPassed} de 7 · ${Math.round(daysPct)} %`} value={daysPct} tone="neutral" />
      {note ? (
        <Text textStyle="caption" color="content.muted">
          {note}
        </Text>
      ) : null}
    </Stack>
  );
}
