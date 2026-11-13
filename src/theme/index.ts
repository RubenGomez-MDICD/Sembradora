/**
 * Tema de La sembradora para Chakra UI v3.
 *
 * Fuente de verdad: variables del archivo de Figma «Página Web Educación Financiera»
 * (colecciones Primitives, Color, Spacing, Radius, Typography y Elevation).
 * Los nombres de las variables CSS coinciden con el «code syntax» de Figma,
 * por ejemplo var(--chakra-colors-brand-primary-solid).
 *
 * Solo hay modo claro: el sitio no ofrece modo oscuro por ahora.
 */
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { buttonRecipe } from "./recipes/button";

const px = (n: number) => `${n / 16}rem`;

const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: "green",
    },
    "html, body": {
      bg: "surface.default",
      color: "content.default",
      fontFamily: "body",
    },
    // Solo en body: si el tamaño base fuera html, cambiaría el valor de 1rem (16 px).
    body: {
      fontSize: "body",
      lineHeight: "body",
    },
    "*:focus-visible": {
      outlineColor: "interactive.focusRing",
    },
  },
  theme: {
    tokens: {
      colors: {
        // Primitives / color
        green: {
          50: { value: "#EDF5F3" },
          100: { value: "#C5DEDA" },
          200: { value: "#9DC8C1" },
          300: { value: "#75B0A7" },
          400: { value: "#5A9C93" },
          500: { value: "#3E705F" },
          600: { value: "#2E5550" },
          700: { value: "#1E3B38" },
          800: { value: "#112220" },
          900: { value: "#060E0D" },
        },
        purple: {
          50: { value: "#F4F1FA" },
          100: { value: "#E3DCF2" },
          200: { value: "#CBBDE6" },
          300: { value: "#AE98D6" },
          400: { value: "#9378C6" },
          500: { value: "#7759B0" },
          600: { value: "#5F4592" },
          700: { value: "#4A3573" },
          800: { value: "#33244F" },
          900: { value: "#1C142C" },
        },
        neutral: {
          0: { value: "#FFFFFF" },
          50: { value: "#FFFCF5" },
          100: { value: "#F5F2EC" },
          200: { value: "#E8E5DF" },
          300: { value: "#D5D2CC" },
          400: { value: "#B0ADA9" },
          500: { value: "#9C9894" },
          600: { value: "#7D7A76" },
          700: { value: "#5C5755" },
          800: { value: "#3D3A38" },
          900: { value: "#292727" },
        },
        success: { 100: { value: "#E6F5EF" }, 300: { value: "#8CBEA9" }, 700: { value: "#1E7A54" } },
        warning: { 100: { value: "#FDF3DC" }, 300: { value: "#C9AF79" }, 700: { value: "#8A5D00" } },
        error: { 100: { value: "#FDE8E7" }, 300: { value: "#E59B95" }, 700: { value: "#C83C31" }, 800: { value: "#A12E25" } },
        info: { 100: { value: "#E8F1FB" }, 300: { value: "#8DAFD2" }, 700: { value: "#1D5FA0" } },
      },
      fonts: {
        heading: { value: "'Nunito Variable', 'Nunito', system-ui, sans-serif" },
        body: { value: "'Open Sans Variable', 'Open Sans', system-ui, sans-serif" },
      },
      // Primitives / font-size (en px en Figma; aquí en rem para respetar el zoom del teléfono)
      fontSizes: {
        "2xs": { value: px(11) },
        xs: { value: px(12) },
        sm: { value: px(13) },
        md: { value: px(15) },
        lg: { value: px(17) },
        xl: { value: px(20) },
        "2xl": { value: px(26) },
        "3xl": { value: px(32) },
        // Typography / font-size
        display: { value: "{fontSizes.3xl}" },
        h1: { value: "{fontSizes.2xl}" },
        h2: { value: "{fontSizes.xl}" },
        h3: { value: "{fontSizes.lg}" },
        h4: { value: "{fontSizes.md}" },
        "body-lg": { value: "{fontSizes.lg}" },
        body: { value: "{fontSizes.md}" },
        "body-sm": { value: "{fontSizes.sm}" },
        label: { value: "{fontSizes.sm}" },
        caption: { value: "{fontSizes.xs}" },
        overline: { value: "{fontSizes.2xs}" },
        cta: { value: "{fontSizes.md}" },
      },
      lineHeights: {
        display: { value: px(37) },
        h1: { value: px(31) },
        h2: { value: px(25) },
        h3: { value: px(22) },
        h4: { value: px(20) },
        "body-lg": { value: px(30) },
        body: { value: px(26) },
        "body-sm": { value: px(21) },
        label: { value: px(18) },
        caption: { value: px(18) },
        overline: { value: px(15) },
        cta: { value: px(18) },
      },
      fontWeights: {
        regular: { value: "400" },
        semibold: { value: "600" },
        bold: { value: "700" },
        extrabold: { value: "800" },
      },
      radii: {
        sm: { value: px(4) },
        md: { value: px(6) },
        lg: { value: px(8) },
        xl: { value: px(12) },
        "2xl": { value: px(16) },
        "3xl": { value: px(24) },
      },
    },
    semanticTokens: {
      radii: {
        l1: { value: "{radii.sm}" },
        l2: { value: "{radii.lg}" },
        l3: { value: "{radii.xl}" },
        l4: { value: "{radii.2xl}" },
      },
      shadows: {
        xs: { value: "0 1px 2px 0 {colors.shadow}" },
        sm: { value: "0 1px 3px 0 {colors.shadow}" },
        md: { value: "0 4px 8px -1px {colors.shadow}" },
        lg: { value: "0 8px 16px -2px {colors.shadow.strong}" },
        xl: { value: "0 16px 32px -4px {colors.shadow.strong}" },
      },
      colors: {
        shadow: {
          DEFAULT: { value: "#2927271A" },
          strong: { value: "#2927272E" },
        },
        // Color / brand
        brand: {
          primary: {
            solid: { value: "{colors.green.500}" },
            solidHover: { value: "{colors.green.600}" },
            solidActive: { value: "{colors.green.700}" },
            contrast: { value: "{colors.neutral.0}" },
            fg: { value: "{colors.green.500}" },
            subtle: { value: "{colors.green.50}" },
            muted: { value: "{colors.green.100}" },
            emphasized: { value: "{colors.green.200}" },
            border: { value: "{colors.green.500}" },
          },
          secondary: {
            solid: { value: "{colors.purple.500}" },
            solidHover: { value: "{colors.purple.600}" },
            solidActive: { value: "{colors.purple.700}" },
            contrast: { value: "{colors.neutral.0}" },
            fg: { value: "{colors.purple.700}" },
            subtle: { value: "{colors.purple.50}" },
            muted: { value: "{colors.purple.100}" },
            emphasized: { value: "{colors.purple.200}" },
            border: { value: "{colors.purple.500}" },
          },
        },
        // Color / surface, content, border, interactive
        surface: {
          default: { value: "{colors.neutral.50}" },
          subtle: { value: "{colors.neutral.100}" },
          muted: { value: "{colors.neutral.200}" },
          panel: { value: "{colors.neutral.0}" },
          inverted: { value: "{colors.neutral.900}" },
        },
        content: {
          default: { value: "{colors.neutral.900}" },
          muted: { value: "{colors.neutral.700}" },
          subtle: { value: "{colors.neutral.600}" },
          disabled: { value: "{colors.neutral.400}" },
          inverted: { value: "{colors.neutral.50}" },
        },
        border: {
          DEFAULT: { value: "{colors.neutral.200}" },
          subtle: { value: "{colors.neutral.200}" },
          default: { value: "{colors.neutral.500}" },
          strong: { value: "{colors.neutral.700}" },
          muted: { value: "{colors.neutral.200}" },
          emphasized: { value: "{colors.neutral.500}" },
          inverted: { value: "{colors.neutral.800}" },
          error: { value: "{colors.error.700}" },
          warning: { value: "{colors.warning.300}" },
          success: { value: "{colors.success.300}" },
          info: { value: "{colors.info.300}" },
        },
        interactive: {
          focusRing: { value: "{colors.green.500}" },
          link: { value: "{colors.green.500}" },
          linkHover: { value: "{colors.green.600}" },
          selectedBg: { value: "{colors.green.50}" },
          selectedBorder: { value: "{colors.green.500}" },
          disabledBg: { value: "{colors.neutral.200}" },
          disabledFg: { value: "{colors.neutral.400}" },
        },
        // Color / feedback
        feedback: {
          success: {
            bg: { value: "{colors.success.100}" },
            border: { value: "{colors.success.300}" },
            fg: { value: "{colors.success.700}" },
            solid: { value: "{colors.success.700}" },
          },
          warning: {
            bg: { value: "{colors.warning.100}" },
            border: { value: "{colors.warning.300}" },
            fg: { value: "{colors.warning.700}" },
            solid: { value: "{colors.warning.700}" },
          },
          error: {
            bg: { value: "{colors.error.100}" },
            border: { value: "{colors.error.300}" },
            fg: { value: "{colors.error.700}" },
            fgInverted: { value: "{colors.error.300}" },
            solid: { value: "{colors.error.700}" },
            solidHover: { value: "{colors.error.800}" },
          },
          info: {
            bg: { value: "{colors.info.100}" },
            border: { value: "{colors.info.300}" },
            fg: { value: "{colors.info.700}" },
            solid: { value: "{colors.info.700}" },
          },
        },
        // Mapeo de los nombres base de Chakra a la paleta del sitio,
        // para que los componentes de Chakra usen los neutros cálidos sin estilos extra.
        bg: {
          DEFAULT: { value: "{colors.neutral.50}" },
          subtle: { value: "{colors.neutral.100}" },
          muted: { value: "{colors.neutral.200}" },
          emphasized: { value: "{colors.neutral.300}" },
          inverted: { value: "{colors.neutral.900}" },
          panel: { value: "{colors.neutral.0}" },
          error: { value: "{colors.error.100}" },
          warning: { value: "{colors.warning.100}" },
          success: { value: "{colors.success.100}" },
          info: { value: "{colors.info.100}" },
        },
        fg: {
          DEFAULT: { value: "{colors.neutral.900}" },
          muted: { value: "{colors.neutral.700}" },
          subtle: { value: "{colors.neutral.600}" },
          inverted: { value: "{colors.neutral.50}" },
          error: { value: "{colors.error.700}" },
          warning: { value: "{colors.warning.700}" },
          success: { value: "{colors.success.700}" },
          info: { value: "{colors.info.700}" },
        },
        // Paletas para la prop colorPalette de Chakra (Button, Checkbox, Progress, etc.).
        green: {
          solid: { value: "{colors.green.500}" },
          solidHover: { value: "{colors.green.600}" },
          contrast: { value: "{colors.neutral.0}" },
          fg: { value: "{colors.green.500}" },
          subtle: { value: "{colors.green.50}" },
          muted: { value: "{colors.green.100}" },
          emphasized: { value: "{colors.green.200}" },
          focusRing: { value: "{colors.green.500}" },
          border: { value: "{colors.green.500}" },
        },
        purple: {
          solid: { value: "{colors.purple.500}" },
          solidHover: { value: "{colors.purple.600}" },
          contrast: { value: "{colors.neutral.0}" },
          fg: { value: "{colors.purple.700}" },
          subtle: { value: "{colors.purple.50}" },
          muted: { value: "{colors.purple.100}" },
          emphasized: { value: "{colors.purple.200}" },
          focusRing: { value: "{colors.purple.500}" },
          border: { value: "{colors.purple.500}" },
        },
        danger: {
          solid: { value: "{colors.error.700}" },
          solidHover: { value: "{colors.error.800}" },
          contrast: { value: "{colors.neutral.0}" },
          fg: { value: "{colors.error.700}" },
          subtle: { value: "{colors.error.100}" },
          muted: { value: "{colors.error.100}" },
          emphasized: { value: "{colors.error.300}" },
          focusRing: { value: "{colors.error.700}" },
          border: { value: "{colors.error.300}" },
        },
      },
    },
    // Estilos de texto de Figma (Tipografía/…)
    textStyles: {
      display: { value: { fontFamily: "heading", fontWeight: "extrabold", fontSize: "display", lineHeight: "display", letterSpacing: "-0.3px" } },
      h1: { value: { fontFamily: "heading", fontWeight: "bold", fontSize: "h1", lineHeight: "h1" } },
      h2: { value: { fontFamily: "heading", fontWeight: "bold", fontSize: "h2", lineHeight: "h2" } },
      h3: { value: { fontFamily: "heading", fontWeight: "semibold", fontSize: "h3", lineHeight: "h3" } },
      h4: { value: { fontFamily: "heading", fontWeight: "semibold", fontSize: "h4", lineHeight: "h4" } },
      bodyLg: { value: { fontFamily: "body", fontWeight: "regular", fontSize: "body-lg", lineHeight: "body-lg" } },
      body: { value: { fontFamily: "body", fontWeight: "regular", fontSize: "body", lineHeight: "body" } },
      bodySm: { value: { fontFamily: "body", fontWeight: "regular", fontSize: "body-sm", lineHeight: "body-sm" } },
      label: { value: { fontFamily: "body", fontWeight: "semibold", fontSize: "label", lineHeight: "label", letterSpacing: "0.01em" } },
      caption: { value: { fontFamily: "body", fontWeight: "regular", fontSize: "caption", lineHeight: "caption" } },
      overline: { value: { fontFamily: "heading", fontWeight: "bold", fontSize: "overline", lineHeight: "overline", letterSpacing: "0.1em", textTransform: "uppercase" } },
      cta: { value: { fontFamily: "heading", fontWeight: "bold", fontSize: "cta", lineHeight: "cta", letterSpacing: "0.01em" } },
    },
    recipes: {
      button: buttonRecipe,
    },
  },
});

export const system = createSystem(defaultConfig, config);
