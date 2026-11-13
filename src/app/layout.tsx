import type { Metadata, Viewport } from "next";
import "@fontsource-variable/nunito";
import "@fontsource-variable/open-sans";
import "./globals.css";
import { Provider } from "@/components/ui/provider";

export const metadata: Metadata = {
  title: { default: "La sembradora", template: "%s · La sembradora" },
  description: "Herramientas para tu sueldo, tu dinero y tus derechos como trabajadora del hogar.",
  applicationName: "La sembradora",
};

export const viewport: Viewport = {
  themeColor: "#3E705F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" suppressHydrationWarning>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
