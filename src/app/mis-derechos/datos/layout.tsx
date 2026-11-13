import type { Metadata } from "next";

export const metadata: Metadata = { title: "Calcula tus prestaciones" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
