import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "La sembradora",
    short_name: "Sembradora",
    description: "Herramientas para tu sueldo, tu dinero y tus derechos.",
    lang: "es-MX",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FFFCF5",
    theme_color: "#3E705F",
    icons: [
      { src: "/iconos/icono.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/iconos/icono-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/iconos/icono-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/iconos/icono-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
