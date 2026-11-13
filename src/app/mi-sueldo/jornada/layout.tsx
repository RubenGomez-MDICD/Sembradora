import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tu jornada" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
