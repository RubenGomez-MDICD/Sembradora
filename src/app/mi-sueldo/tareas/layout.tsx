import type { Metadata } from "next";

export const metadata: Metadata = { title: "¿Qué haces en la casa?" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
