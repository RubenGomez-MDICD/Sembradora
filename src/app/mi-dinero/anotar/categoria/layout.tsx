import type { Metadata } from "next";

export const metadata: Metadata = { title: "¿En qué fue?" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
