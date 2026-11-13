import type { Metadata } from "next";

export const metadata: Metadata = { title: "¿Cuánto te pagan ahora?" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
