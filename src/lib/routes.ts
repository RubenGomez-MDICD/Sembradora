/**
 * Mapa del sitio. Cada ruta indica las pantallas de Figma que la diseñan
 * (página «Pantallas»), para poder rastrear diseño ↔ código.
 *
 * Las rutas que todavía no tienen pantalla propia se muestran con
 * src/app/[...slug]/page.tsx como esqueleto navegable.
 */
export type SectionId = "inicio" | "mi-sueldo" | "mi-dinero" | "mis-ahorros" | "mis-derechos" | "aprende";

export type RouteInfo = {
  path: string;
  section: SectionId;
  title: string;
  description: string;
  figma: string[];
  /** Ruta hija que no aparece en la lista de su sección (pasos intermedios). */
  hidden?: boolean;
  /** Ya tiene su página en src/app; el esqueleto deja de generarla. */
  lista?: boolean;
};

export const SECTIONS: Record<SectionId, { label: string; path: string; summary: string; loop?: string }> = {
  inicio: { label: "Inicio", path: "/", summary: "Herramientas para tu sueldo, tu dinero y tus derechos." },
  "mi-sueldo": { label: "Mi sueldo", path: "/mi-sueldo", summary: "Calcula cuánto te toca por tu trabajo.", loop: "L3a" },
  "mi-dinero": { label: "Mi dinero", path: "/mi-dinero", summary: "Anota tus gastos y mira tu balance.", loop: "L2" },
  "mis-ahorros": { label: "Mis ahorros", path: "/mis-ahorros", summary: "Tandas, emergencias y metas.", loop: "L3c" },
  "mis-derechos": { label: "Mis derechos", path: "/mis-derechos", summary: "Aguinaldo, vacaciones y el IMSS.", loop: "L3b" },
  aprende: { label: "Aprende", path: "/aprende", summary: "Glosario y conceptos.", loop: "L1" },
};

export const ROUTES: RouteInfo[] = [
  // Inicio
  { path: "/fuentes", lista: true, section: "inicio", title: "Fuentes y créditos", description: "De dónde salen los datos y los cálculos.", figma: ["IN-3"] },

  // Mi sueldo
  { path: "/mi-sueldo", lista: true, section: "mi-sueldo", title: "¿Cuánto te toca por tu trabajo?", description: "Calcula un sueldo justo según lo que haces en la casa.", figma: ["MS-0"] },
  { path: "/mi-sueldo/tareas", lista: true, section: "mi-sueldo", title: "¿Qué haces en la casa?", description: "Paso 1 de 5. Tareas con descripción.", figma: ["MS-1"] },
  { path: "/mi-sueldo/frecuencia", lista: true, section: "mi-sueldo", title: "¿Cada cuánto lo haces?", description: "Paso 2 de 5. Días que vas y frecuencia de cada tarea.", figma: ["MS-1b"] },
  { path: "/mi-sueldo/jornada", lista: true, section: "mi-sueldo", title: "Tu jornada", description: "Paso 3 de 5. Horas al día y cuánto te toca.", figma: ["MS-2"] },
  { path: "/mi-sueldo/pago", lista: true, section: "mi-sueldo", title: "¿Cuánto te pagan ahora?", description: "Paso 4 de 5. Comparación con lo que te toca.", figma: ["MS-3"] },
  { path: "/mi-sueldo/resultado", lista: true, section: "mi-sueldo", title: "Lo que puedes hacer", description: "Paso 5 de 5. Sueldo menor o sueldo justo.", figma: ["MS-4a", "MS-4b"] },
  { path: "/mi-sueldo/tarifa", lista: true, section: "mi-sueldo", title: "Tu tarifa para compartir", description: "Desglose y fundamento para mostrar a tus patrones.", figma: ["MS-5"] },
  { path: "/mi-sueldo/platicarlo", lista: true, section: "mi-sueldo", title: "Cómo platicar de tu sueldo", description: "Guía para pedir un pago justo.", figma: ["MS-6"] },

  // Mi dinero
  { path: "/mi-dinero", section: "mi-dinero", title: "Mi dinero", description: "Primera vez, balance vacío o balance de la semana.", figma: ["MD-0", "MD-1", "MD-4", "MD-4b", "MD-4c"] },
  { path: "/mi-dinero/anotar", section: "mi-dinero", title: "Nuevo movimiento", description: "Monto de un gasto o de un ingreso.", figma: ["MD-2", "MD-2i"] },
  { path: "/mi-dinero/anotar/categoria", section: "mi-dinero", title: "¿En qué fue?", description: "Categoría, categoría nueva o préstamo.", figma: ["MD-3", "MD-3i", "MD-3n", "MD-3c", "MD-3p"], hidden: true },
  { path: "/mi-dinero/movimientos", section: "mi-dinero", title: "Mis movimientos", description: "Historial por día, editar y borrar con Deshacer.", figma: ["MD-5", "MD-6", "MD-7"] },
  { path: "/mi-dinero/ideas", section: "mi-dinero", title: "Ideas para ordenar tu dinero", description: "Ideas con tus propias cifras.", figma: ["MD-13", "MD-13b"] },
  { path: "/mi-dinero/tope", section: "mi-dinero", title: "Ponle un tope a una categoría", description: "Límite semanal con aviso al 80 %.", figma: ["MD-14"], hidden: true },
  { path: "/mi-dinero/deudas", section: "mi-dinero", title: "Lo que debes", description: "Deudas, lo que falta y el próximo pago.", figma: ["MD-15"] },
  { path: "/mi-dinero/deudas/nueva", section: "mi-dinero", title: "Anotar una deuda", description: "Tipo, monto y forma de pago.", figma: ["MD-16"], hidden: true },
  { path: "/mi-dinero/deudas/ejemplo", section: "mi-dinero", title: "Detalle de una deuda", description: "Avance, próximos pagos y anotar un pago.", figma: ["MD-17", "MD-17t", "MD-17r", "MD-18"], hidden: true },
  { path: "/mi-dinero/respaldo", section: "mi-dinero", title: "Tu respaldo", description: "Código de respaldo o archivo.", figma: ["MD-8", "MD-8f"] },
  { path: "/mi-dinero/respaldo/codigo", section: "mi-dinero", title: "Este es tu código", description: "Código creado.", figma: ["MD-9"], hidden: true },
  { path: "/mi-dinero/respaldo/recuperar", section: "mi-dinero", title: "Recupera tus datos", description: "Con código o con archivo; juntar o reemplazar.", figma: ["MD-10", "MD-10b", "MD-10f", "MD-11", "MD-11b", "MD-11c"], hidden: true },
  { path: "/mi-dinero/pin", section: "mi-dinero", title: "Proteger con PIN", description: "PIN opcional para teléfonos compartidos.", figma: ["MD-12"] },

  // Mis ahorros
  { path: "/mis-ahorros", lista: true, section: "mis-ahorros", title: "Mis ahorros", description: "Tu meta y temas de ahorro.", figma: ["AH-0", "AH-6"] },
  { path: "/mis-ahorros/meta", lista: true, section: "mis-ahorros", title: "¿Para qué quieres ahorrar?", description: "Paso 1 de 3. Meta o meta propia.", figma: ["AH-1", "AH-1b"] },
  { path: "/mis-ahorros/plazo", lista: true, section: "mis-ahorros", title: "¿Cuánto necesitas y para cuándo?", description: "Paso 2 de 3.", figma: ["AH-2"], hidden: true },
  { path: "/mis-ahorros/plan", lista: true, section: "mis-ahorros", title: "Tu plan", description: "Paso 3 de 3.", figma: ["AH-3"], hidden: true },
  { path: "/mis-ahorros/tandas", lista: true, section: "mis-ahorros", title: "Las tandas", description: "Cómo usarlas a tu favor.", figma: ["AH-4"] },
  { path: "/mis-ahorros/tandas/sumar", lista: true, section: "mis-ahorros", title: "Suma tu tanda a una meta", description: "Cuándo y cuánto recibes.", figma: ["AH-5"], hidden: true },
  { path: "/mis-ahorros/por-que-ahorrar", lista: true, section: "mis-ahorros", title: "Por qué ahorrar", description: "Lo que cambia con un guardadito.", figma: ["AH-7"] },
  { path: "/mis-ahorros/emergencias", lista: true, section: "mis-ahorros", title: "Para emergencias", description: "Cuánto apartar para los apuros.", figma: ["AH-8"] },

  // Mis derechos
  { path: "/mis-derechos", lista: true, section: "mis-derechos", title: "Mis derechos", description: "Lo que te corresponde por ley.", figma: ["DR-0"] },
  { path: "/mis-derechos/contrato", lista: true, section: "mis-derechos", title: "¿Tienes un contrato por escrito?", description: "Paso 1 de 4.", figma: ["DR-1a"] },
  { path: "/mis-derechos/contrato/armar", lista: true, section: "mis-derechos", title: "Arma tu contrato", description: "Datos prellenados con Mi sueldo.", figma: ["DR-5a"] },
  { path: "/mis-derechos/contrato/ver", lista: true, section: "mis-derechos", title: "Tu contrato", description: "Contrato listo para firmar, descargar o mandar.", figma: ["DR-5b"], hidden: true },
  { path: "/mis-derechos/datos", lista: true, section: "mis-derechos", title: "Calcula tus prestaciones", description: "Paso 2 de 4. Sueldo, antigüedad y situación.", figma: ["DR-1", "DR-1b", "DR-1c", "DR-1d", "DR-1e"], hidden: true },
  { path: "/mis-derechos/resultado", lista: true, section: "mis-derechos", title: "Lo que te toca", description: "Paso 3 de 4. Prestaciones, liquidación o finiquito.", figma: ["DR-2", "DR-2b", "DR-2L", "DR-2F"], hidden: true },
  { path: "/mis-derechos/platicarlo", lista: true, section: "mis-derechos", title: "Cómo platicarlo con tus patrones", description: "Paso 4 de 4. Guía para pedir tu registro.", figma: ["DR-3"] },
  { path: "/mis-derechos/platicarlo/patrones", lista: true, section: "mis-derechos", title: "Para tus patrones", description: "Tarjeta para mandarles cómo registrarte en el IMSS.", figma: ["DR-3b"], hidden: true },
  { path: "/mis-derechos/imss", lista: true, section: "mis-derechos", title: "El IMSS", description: "Qué te da y cómo te registran.", figma: ["DR-4", "DR-4b", "DR-4c"] },

  // Aprende
  { path: "/aprende", lista: true, section: "aprende", title: "Aprende", description: "Las palabras del banco y de la ley, dichas como las decimos.", figma: ["AP-0"] },
  { path: "/aprende/glosario", lista: true, section: "aprende", title: "Glosario", description: "Palabras con su explicación, filtros por tema.", figma: ["AP-1", "AP-2", "AP-3"] },
  { path: "/aprende/apoyos", lista: true, section: "aprende", title: "¿Quién te apoya?", description: "Organizaciones que te orientan gratis.", figma: ["AP-4"] },
];

export const findRoute = (path: string) => ROUTES.find((r) => r.path === path);

export const sectionChildren = (section: SectionId) =>
  ROUTES.filter((r) => r.section === section && r.path !== SECTIONS[section].path && !r.hidden);
