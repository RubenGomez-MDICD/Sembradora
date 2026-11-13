import type { Metadata } from "next";
import { Showcase } from "./showcase";

export const metadata: Metadata = {
  title: "Componentes",
  robots: { index: false, follow: false },
};

/** Página de revisión: muestra cada componente de la librería para compararlo con Figma. */
export default function ComponentesPage() {
  return <Showcase />;
}
