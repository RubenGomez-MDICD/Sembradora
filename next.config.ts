import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Importa solo los componentes de Chakra que se usan (menos JavaScript en el teléfono).
    optimizePackageImports: ["@chakra-ui/react", "lucide-react"],
  },
};

export default nextConfig;
