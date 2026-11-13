# La sembradora

Sitio de educación financiera para personas trabajadoras del hogar en Guadalajara: sueldo justo, registro de gastos y deudas, ahorro, derechos laborales y un glosario en lenguaje claro.

Es el artefacto de la tesis «Cartografías de la vulnerabilidad», Maestría en Diseño de Información y Comunicación Digital, Universidad de Guadalajara.

## Cómo correrlo

Requiere Node.js 20.9 o más reciente.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # versión de producción
```

## Estructura

```
docs/plan-tecnico.md    Decisiones técnicas y fases
src/app/                Páginas (App Router de Next.js)
src/app/[...slug]/      Esqueleto navegable de las rutas que aún no tienen pantalla
src/components/         Componentes del sitio (AppHeader, SectionCard, Screen…)
src/lib/routes.ts       Mapa del sitio con las pantallas de Figma de cada ruta
src/theme/              Tema de Chakra UI con los tokens de Figma
```

## Diseño y tokens

El diseño vive en Figma («Página Web Educación Financiera»). Los tokens del tema salen de sus variables y conservan los mismos nombres de variable CSS, por ejemplo `var(--chakra-colors-brand-primary-solid)`.

| Figma | Código |
| --- | --- |
| `padding/xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl` | `2`, `3`, `4`, `6`, `8`, `12`, `16` (escala de Chakra, 4 px por paso) |
| `radius/l1` a `l4` | `l1` a `l4` (4, 8, 12 y 16 px) |
| Estilos de texto (Display, H1…Caption, Overline, CTA) | `textStyle="display"`, `h1`, …, `caption`, `overline`, `cta` |
| Color `brand/primary/*`, `surface/*`, `content/*`, `border/*`, `feedback/*` | mismos nombres con punto: `brand.primary.solid`, `surface.panel`… |

## Publicación

Se publica en Vercel desde la rama `main`. Cada cambio en GitHub genera una vista previa.
