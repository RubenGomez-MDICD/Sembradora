"use client";

import { useState } from "react";
import NextLink from "next/link";
import { Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { CloudUpload, CreditCard, Pencil, Plus, Smartphone, Sprout } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Alert, EmptyState, FeatureItem, LinkCard, ProgressBar, Segmented, Stat } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import { avanceTope, estadoBalance, resumen, resumenDeudas, type Periodo } from "@/lib/calculos/dinero";
import { guardarAjuste } from "@/lib/db";
import { useRegistro, useTabla } from "@/lib/db/hooks";
import { formatFechaCorta, formatMoney } from "@/lib/format";
import { nombreCategoria, useCategoriasMapa } from "./datos";

const INTRO = "mi-dinero-intro";

/** Figma: MD-0 · Primera vez */
function PrimeraVez() {
  return (
    <>
      <AppHeader type="back" title="Inicio" backHref="/" />
      <Screen>
        <Flex h="32" borderRadius="l3" bg="brand.primary.subtle" align="center" justify="center">
          <Flex w="20" h="20" borderRadius="full" bg="brand.primary.muted" color="brand.primary.fg" align="center" justify="center">
            <Sprout size={36} aria-hidden />
          </Flex>
        </Flex>
        <PageTitle title="Anota lo que gastas en un minuto">Así ves en qué se va tu dinero sin hacer cuentas.</PageTitle>
        <Stack as="ul" gap="5" listStyleType="none" p="0" m="0">
          <li>
            <FeatureItem icon={Smartphone} title="Se queda en tu teléfono" description="No pedimos tu nombre, correo ni número." />
          </li>
          <li>
            <FeatureItem icon={Pencil} title="Corrige cuando quieras" description="Puedes cambiar o borrar cualquier movimiento." />
          </li>
          <li>
            <FeatureItem icon={CloudUpload} title="Respaldo si lo necesitas" description="Guarda un código para no perder lo que anotaste." />
          </li>
        </Stack>
        <Stack gap="2">
          <Button size="lg" onClick={() => void guardarAjuste(INTRO, true)}>
            Empezar
          </Button>
          <Button size="lg" variant="ghost" asChild>
            <NextLink href="/mi-dinero/respaldo">¿Cómo funciona el respaldo?</NextLink>
          </Button>
        </Stack>
      </Screen>
    </>
  );
}

/** Figma: MD-1 (vacío), MD-4 (balance), MD-4b (solo gastos), MD-4c (gastaste de más), MD-4i y MD-4p (con aviso). */
export default function MiDinero() {
  const intro = useRegistro("ajustes", INTRO);
  const movimientos = useTabla("movimientos");
  const deudas = useTabla("deudas");
  const topes = useTabla("topes");
  const categorias = useCategoriasMapa();
  const [periodo, setPeriodo] = useState<Periodo>("semana");

  if (intro === undefined || movimientos === undefined) return <AppHeader type="back" title="Inicio" backHref="/" />;
  if (!intro && movimientos.length === 0) return <PrimeraVez />;

  const r = resumen(movimientos, periodo);
  const semana = periodo === "semana" ? r : resumen(movimientos, "semana");
  const estado = estadoBalance(r);
  const d = resumenDeudas(deudas ?? [], movimientos);
  const cuando = periodo === "semana" ? "esta semana" : "este mes";

  return (
    <>
      <AppHeader type="back" title="Mi dinero" meta="Tu balance" backHref="/" />
      <Screen>
        <Heading as="h1" srOnly>
          Mi dinero
        </Heading>
        <Segmented
          label="Periodo"
          value={periodo}
          onValueChange={(e) => setPeriodo((e.value ?? "semana") as Periodo)}
          items={[
            { value: "semana", label: "Esta semana" },
            { value: "mes", label: "Este mes" },
          ]}
        />

        {estado === "vacio" ? (
          <EmptyState icon={Sprout} title={movimientos.length ? `Nada anotado ${cuando}` : "Aún no anotas nada"} description="Cuando anotes lo que gastas o lo que te entra, aquí verás cuánto te queda y en qué se va tu dinero.">
            <Button size="lg" asChild>
              <NextLink href="/mi-dinero/anotar">Anotar un gasto</NextLink>
            </Button>
            <Button variant="outline" asChild>
              <NextLink href="/mi-dinero/anotar?tipo=ingreso">Anotar un ingreso</NextLink>
            </Button>
          </EmptyState>
        ) : (
          <>
            {estado === "soloGastos" ? (
              <>
                <Stat label={`Llevas gastado ${cuando}`} value={formatMoney(r.gastos)} helpText="Todavía no anotas lo que te entró." />
                <Alert status="info" title={periodo === "semana" ? "¿Ya te pagaron esta semana?" : "¿Ya te pagaron este mes?"}>
                  Anota lo que te entró para saber cuánto te queda.
                </Alert>
              </>
            ) : estado === "deMas" ? (
              <>
                <Stat tone="neutral" label={`${periodo === "semana" ? "Esta semana" : "Este mes"} te faltaron`} value={formatMoney(r.balance)} helpText={`Entraron ${formatMoney(r.ingresos)} y gastaste ${formatMoney(r.gastos)}.`} />
                <Alert status="warning" title="Gastaste más de lo que recibiste">
                  Pasa cuando llegan gastos que no esperabas. Mira en qué se fue tu dinero y, si quieres, revisa ideas para la próxima semana.
                </Alert>
              </>
            ) : (
              <Stat
                label={`Te queda ${cuando}`}
                value={formatMoney(r.balance)}
                helpText={`De ${formatMoney(r.ingresos)} que te entraron${r.prestado ? ` (incluye ${formatMoney(r.prestado)} prestados)` : ""} · ${formatMoney(r.gastos)} en gastos`}
              />
            )}

            {r.porCategoria.length ? (
              <Stack as="section" aria-labelledby="en-que" gap="3">
                <Text as="h2" id="en-que" textStyle="label">
                  En qué se va tu dinero
                </Text>
                {r.porCategoria.map((c) => {
                  const tope = periodo === "semana" ? topes?.find((t) => t.categoriaId === c.categoriaId) : undefined;
                  const a = tope ? avanceTope(tope, semana) : null;
                  return (
                    <Stack key={c.categoriaId} gap="1">
                      <ProgressBar
                        label={nombreCategoria(categorias, c.categoriaId)}
                        amount={tope ? `${formatMoney(c.monto)} de ${formatMoney(tope.montoSemanal)}` : formatMoney(c.monto)}
                        value={tope ? a!.proporcion * 100 : (c.monto / r.gastos) * 100}
                      />
                      {a && a.estado !== "bien" ? (
                        <Text textStyle="caption" color="feedback.warning.fg">
                          {a.estado === "pasado" ? `Te pasaste de tu tope por ${formatMoney(a.diferencia)}.` : `Vas en el ${Math.round(a.proporcion * 100)} % de tu tope.`}
                        </Text>
                      ) : null}
                    </Stack>
                  );
                })}
              </Stack>
            ) : null}

            <Stack gap="2">
              <Button size="lg" asChild>
                <NextLink href={estado === "soloGastos" ? "/mi-dinero/anotar?tipo=ingreso" : "/mi-dinero/anotar"}>
                  <Plus aria-hidden /> {estado === "soloGastos" ? "Anotar lo que te entró" : "Anotar otro movimiento"}
                </NextLink>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <NextLink href="/mi-dinero/movimientos">Ver mis movimientos</NextLink>
              </Button>
            </Stack>
          </>
        )}

        <Stack gap="3">
          {d.activas.length ? (
            <LinkCard
              href="/mi-dinero/deudas"
              icon={CreditCard}
              eyebrow="Lo que debes"
              title={`${formatMoney(d.total)} en ${d.activas.length} ${d.activas.length === 1 ? "deuda" : "deudas"}`}
              description={d.proximo ? `Próximo pago: ${formatMoney(d.proximo.deuda.pagoPorPeriodo)} el ${formatFechaCorta(d.proximo.deuda.proximoPago!)}.` : "Toca para ver cuánto te falta."}
            />
          ) : (
            <LinkCard href="/mi-dinero/deudas" icon={CreditCard} eyebrow="Lo que debes" title="Tus deudas" description="Anota lo que debes y cuándo pagas." />
          )}
          {estado === "vacio" ? (
            <LinkCard href="/mi-dinero/respaldo" icon={CloudUpload} eyebrow="Mi dinero" title="Tu respaldo" description="Opcional. Para no perder lo que anotes si cambias de teléfono." />
          ) : (
            <LinkCard href="/mi-dinero/ideas" icon={Sprout} eyebrow="Ordenarlo" title="Ideas para ordenar tu dinero" description="Con base en lo que anotaste." />
          )}
        </Stack>
      </Screen>
    </>
  );
}
