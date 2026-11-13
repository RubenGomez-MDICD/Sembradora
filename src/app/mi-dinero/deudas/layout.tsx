import type { Metadata } from "next";

export const metadata: Metadata = { title: "Lo que debes" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
