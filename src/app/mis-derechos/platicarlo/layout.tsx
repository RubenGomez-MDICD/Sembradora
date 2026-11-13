import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cómo platicarlo con tus patrones" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
