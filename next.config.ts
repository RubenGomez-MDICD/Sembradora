import type { NextConfig } from "next";

// Cada publicación tiene su propia versión: el service worker la usa para saber que hay algo nuevo.
const version = (process.env.VERCEL_GIT_COMMIT_SHA ?? "local").slice(0, 8);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_VERSION: version },
  experimental: {
    // Importa solo los componentes de Chakra que se usan (menos JavaScript en el teléfono).
    optimizePackageImports: ["@chakra-ui/react", "lucide-react"],
  },
  async headers() {
    return [
      {
        // Que el navegador siempre pregunte si hay un service worker nuevo (guía de PWA de Next).
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
