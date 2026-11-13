"use client";

import { Stack, Text } from "@chakra-ui/react";
import { Coins, PiggyBank, Target, Users } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { LinkCard } from "@/components/ds";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import { ideas, resumen } from "@/lib/calculos/dinero";
import { useTabla } from "@/lib/db/hooks";
import { formatMoney } from "@/lib/format";
import { nombreCategoria, useCategoriasMapa } from "../datos";

/** Figma: MD-13 · Ideas para ordenar y MD-13b · Ideas sin datos */
export default function Ideas() {
  const movimientos = useTabla("movimientos");
  const metas = useTabla("metas");
  const mapa = useCategoriasMapa();
  if (!movimientos) return <AppHeader type="back" title="Mi dinero" meta="Ideas" backHref="/mi-dinero" />;

  const semana = resumen(movimientos, "semana");
  const i = ideas(semana);
  const nombre = (id: string) => nombreCategoria(mapa, id);
  const meta = metas?.[0]?.nombre;

  return (
    <>
      <AppHeader type="back" title="Mi dinero" meta="Ideas" backHref="/mi-dinero" />
      <Screen>
        <PageTitle title="Ideas para ordenar tu dinero">{i.hayDatos ? "Con base en lo que anotaste esta semana. Tú eliges cuál probar." : "Cuando anotes una semana de gastos, aquí verás ideas con tus propias cifras."}</PageTitle>
        {i.mayor ? (
          <Stack gap="1" bg="surface.subtle" borderRadius="l3" p="4">
            <Text textStyle="overline" color="content.subtle">
              Lo que más se lleva tu dinero
            </Text>
            <Text textStyle="label">
              {nombre(i.mayor.categoriaId)}: {formatMoney(i.mayor.monto)} de {formatMoney(semana.gastos)} en gastos ({Math.round(i.mayor.proporcion * 100)} %)
            </Text>
          </Stack>
        ) : null}
        <Stack gap="3">
          <LinkCard
            href="/mi-dinero/tope"
            icon={Target}
            title="Ponle un tope a una categoría"
            description={i.mayor ? `${nombre(i.mayor.categoriaId)} se lleva ${formatMoney(i.mayor.monto)} de tus ${formatMoney(semana.gastos)} de gastos. Un tope te avisa antes de pasarte.` : "Decide cuánto quieres gastar en comida a la semana y te avisamos cuando te acerques."}
          />
          <LinkCard
            href="/mis-ahorros"
            icon={PiggyBank}
            title="Aparta primero, gasta después"
            description={i.apartar ? `Esta semana te entraron ${formatMoney(i.apartar.de)}. Si apartas ${formatMoney(i.apartar.monto)} al cobrar, te quedan ${formatMoney(i.apartar.de - i.apartar.monto)} para la semana.` : "Cuando te paguen, separa una parte para tu meta antes de gastar."}
          />
          <LinkCard
            href="/mi-dinero/movimientos"
            icon={Coins}
            title="Junta los gastos chicos"
            description={i.chicos ? `En ${nombre(i.chicos.categoriaId).toLowerCase()} van ${formatMoney(i.chicos.monto)} esta semana en pagos chicos. Al mes serían unos ${formatMoney(i.chicos.alMes)}.` : "Los $18 del camión son $90 a la semana. Verlos juntos ayuda a decidir."}
          />
          <LinkCard
            href="/mis-ahorros/tandas"
            icon={Users}
            title="Usa una tanda para lo grande"
            description={i.tanda ? `Ya das ${formatMoney(i.tanda)} a una tanda. Cuando te toque, puedes sumarla a ${meta ? `tu meta ${meta}` : "una meta"}.` : "Si viene una compra grande, una tanda te ayuda a juntar sin tocar tu gasto diario."}
          />
        </Stack>
        <Text textStyle="caption" color="content.muted">
          {i.hayDatos ? "Las cifras salen de lo que anotaste. " : ""}Son ideas, no reglas: tú conoces tus gastos.
        </Text>
      </Screen>
    </>
  );
}
