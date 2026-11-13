import type { Metadata } from "next";

export const metadata: Metadata = { title: "Para tus patrones" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
