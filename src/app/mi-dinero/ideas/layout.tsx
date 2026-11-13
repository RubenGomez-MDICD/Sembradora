import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ideas para ordenar tu dinero" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
