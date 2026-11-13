import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "La sembradora",
    short_name: "Sembradora",
    description: "Herramientas para tu sueldo, tu dinero y tus derechos.",
    lang: "es-MX",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFCF5",
    theme_color: "#3E705F",
    icons: [],
  };
}
