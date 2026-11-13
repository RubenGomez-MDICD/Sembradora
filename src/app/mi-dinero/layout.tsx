import type { Metadata } from "next";
import { Candado } from "./candado";

export const metadata: Metadata = { title: "Mi dinero" };

/** Toda la sección pasa por el candado del PIN opcional (MD-12). */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <Candado>{children}</Candado>;
}
