import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { PageTitle } from "@/components/page-title";
import { Screen } from "@/components/screen";
import { Glosario } from "./glosario";

export const metadata: Metadata = { title: "Glosario" };

/** Figma: AP-3 · Glosario */
export default function GlosarioPage() {
  return (
    <>
      <AppHeader type="back" title="Aprende" meta="Glosario" backHref="/aprende" />
      <Screen>
        <PageTitle title="Glosario">Palabras del banco, de la ley y del dinero de todos los días. Toca una para ver su explicación.</PageTitle>
        {/* Lee la búsqueda de la dirección (?q= y ?t=) en el teléfono; la página sigue siendo estática. */}
        <Suspense>
          <Glosario />
        </Suspense>
      </Screen>
    </>
  );
}
