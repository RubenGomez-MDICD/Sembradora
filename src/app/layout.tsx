import type { Metadata, Viewport } from "next";
import "./fuentes.css";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Provider } from "@/components/ui/provider";

export const metadata: Metadata = {
  title: { default: "La sembradora", template: "%s · La sembradora" },
  description: "Herramientas para tu sueldo, tu dinero y tus derechos como trabajadora del hogar.",
  applicationName: "La sembradora",
  // En iPhone, al agregarla a inicio se abre como app y con su propio nombre.
  appleWebApp: { capable: true, title: "Sembradora", statusBarStyle: "default" },
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
        {/* Solo visitas por página y velocidad real; sin cookies y sin los datos que se anotan (plan técnico, sección 9). */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
