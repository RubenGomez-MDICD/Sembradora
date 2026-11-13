import { defineRecipe } from "@chakra-ui/react";

/**
 * Button (Figma: componente «Button» y «Button.Danger»).
 * Se combina con la receta base de Chakra: aquí solo van las diferencias.
 * - Texto: estilo «CTA Button» (Nunito Bold 15).
 * - Alturas de 44 y 48 px para que el área táctil sea cómoda en teléfonos chicos.
 * - Hover con el tono «solid-hover» de Figma en lugar de transparencia.
 */
export const buttonRecipe = defineRecipe({
  base: {
    fontFamily: "heading",
    fontWeight: "bold",
    letterSpacing: "0.01em",
    borderRadius: "l2",
  },
  variants: {
    size: {
      md: { h: "11", minW: "11", textStyle: "cta", px: "4" },
      lg: { h: "12", minW: "12", textStyle: "cta", px: "6" },
    },
    variant: {
      solid: {
        _hover: { bg: "colorPalette.solidHover" },
        _expanded: { bg: "colorPalette.solidHover" },
      },
    },
  },
});
