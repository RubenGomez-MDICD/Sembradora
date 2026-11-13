import type { Metadata } from "next";

export const metadata: Metadata = { title: "Para emergencias" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
