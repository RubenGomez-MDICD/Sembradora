import type { Metadata } from "next";

export const metadata: Metadata = { title: "Este es tu código" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
