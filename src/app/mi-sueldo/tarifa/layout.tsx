import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tu tarifa para compartir" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
