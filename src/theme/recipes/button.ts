import { defineRecipe } from "@chakra-ui/react";

/**
 * Button e IconButton (Figma: «Button», «Button.Danger», «IconButton»).
 * Se combina con la receta base de Chakra: aquí solo van las diferencias.
 * - Texto: estilo «CTA Button» (Nunito Bold 15).
 * - Alturas de 44 px (md) y 48 px (lg). En Figma md mide 40 px; se sube a 44 por área táctil (WCAG 2.5.8).
 * - outline: fondo panel y borde neutro (border/default). Para peligro, DangerButton cambia el borde.
 * - Deshabilitado: colores interactive/disabled en lugar de transparencia, para que se siga leyendo.
 */
export const buttonRecipe = defineRecipe({
  base: {
    fontFamily: "heading",
    fontWeight: "bold",
    letterSpacing: "0.01em",
    borderRadius: "l2",
    _disabled: {
      opacity: 1,
      bg: "interactive.disabledBg",
      color: "interactive.disabledFg",
      borderColor: "transparent",
      cursor: "not-allowed",
    },
  },
  variants: {
    size: {
      sm: { h: "9", minW: "9", textStyle: "label", px: "3" },
      md: { h: "11", minW: "11", textStyle: "cta", px: "4", _icon: { width: "5", height: "5" } },
      lg: { h: "12", minW: "12", textStyle: "cta", px: "6", gap: "2", _icon: { width: "5", height: "5" } },
    },
    variant: {
      solid: {
        _hover: { bg: "colorPalette.solidHover" },
        // Mientras carga conserva su color: no es un botón deshabilitado, es una acción en curso.
        _loading: { bg: "colorPalette.solid", color: "colorPalette.contrast" },
        _expanded: { bg: "colorPalette.solidHover" },
      },
      outline: {
        bg: "surface.panel",
        "--outline-color": "colors.border.default",
        color: "colorPalette.fg",
        _hover: { bg: "colorPalette.subtle" },
      },
      ghost: {
        color: "colorPalette.fg",
        _hover: { bg: "colorPalette.subtle" },
      },
    },
  },
});
