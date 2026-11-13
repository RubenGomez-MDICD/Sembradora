"use client";

/**
 * Compartir desde el teléfono sin servicios de terceros (plan técnico, sección 9).
 * Se usa el menú de compartir del sistema cuando existe; si no, se copia o se descarga.
 */

/** Comparte un enlace. Devuelve cómo se hizo, para dar el aviso correcto. */
export async function compartirEnlace(datos: { title: string; text?: string; url: string }): Promise<"compartido" | "copiado" | "cancelado"> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(datos);
      return "compartido";
    } catch {
      return "cancelado";
    }
  }
  await navigator.clipboard.writeText(datos.url);
  return "copiado";
}

/**
 * Dibuja una tarjeta de texto como imagen PNG (DR-3b «Descargar como imagen»).
 * Se dibuja a mano en un canvas para no cargar librerías.
 */
export async function tarjetaComoImagen(t: { eyebrow: string; titulo: string; lineas: string[]; pie: string }): Promise<Blob> {
  await document.fonts?.ready;
  const W = 1080;
  const P = 72;
  const ancho = W - P * 2;
  const css = getComputedStyle(document.documentElement);
  const color = (v: string, f: string) => css.getPropertyValue(v).trim() || f;
  const fondo = color("--chakra-colors-surface-panel", "#ffffff");
  const texto = color("--chakra-colors-content-default", "#292727");
  const suave = color("--chakra-colors-content-muted", "#5c5955");
  const marca = color("--chakra-colors-brand-primary-solid", "#3E705F");
  const titulo = "'Nunito Variable', Nunito, sans-serif";
  const cuerpo = "'Open Sans Variable', 'Open Sans', sans-serif";

  const medir = document.createElement("canvas").getContext("2d")!;
  const partir = (s: string, fuente: string) => {
    medir.font = fuente;
    const palabras = s.split(" ");
    const renglones: string[] = [];
    let actual = "";
    for (const p of palabras) {
      const prueba = actual ? `${actual} ${p}` : p;
      if (medir.measureText(prueba).width > ancho && actual) {
        renglones.push(actual);
        actual = p;
      } else actual = prueba;
    }
    if (actual) renglones.push(actual);
    return renglones;
  };

  const fEyebrow = `700 30px ${titulo}`;
  const fTitulo = `700 54px ${titulo}`;
  const fLinea = `400 38px ${cuerpo}`;
  const fPie = `400 32px ${cuerpo}`;
  const bloques: { lineas: string[]; fuente: string; alto: number; color: string; antes: number }[] = [
    { lineas: [t.eyebrow.toUpperCase()], fuente: fEyebrow, alto: 40, color: marca, antes: 0 },
    { lineas: partir(t.titulo, fTitulo), fuente: fTitulo, alto: 66, color: texto, antes: 20 },
    ...t.lineas.map((l) => ({ lineas: partir(l, fLinea), fuente: fLinea, alto: 54, color: texto, antes: 28 })),
    { lineas: partir(t.pie, fPie), fuente: fPie, alto: 46, color: suave, antes: 40 },
  ];
  const H = P * 2 + bloques.reduce((s, b) => s + b.antes + b.lineas.length * b.alto, 0);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = marca;
  ctx.fillRect(0, 0, W, 16);
  let y = P;
  ctx.textBaseline = "top";
  for (const b of bloques) {
    y += b.antes;
    ctx.font = b.fuente;
    ctx.fillStyle = b.color;
    for (const l of b.lineas) {
      ctx.fillText(l, P, y);
      y += b.alto;
    }
  }
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("No se pudo crear la imagen"))), "image/png"));
}

/** Manda un archivo al menú de compartir o, si no se puede, lo descarga. */
export async function compartirODescargar(archivo: Blob, nombre: string, titulo: string): Promise<"compartido" | "descargado" | "cancelado"> {
  const file = new File([archivo], nombre, { type: archivo.type });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: titulo });
      return "compartido";
    } catch {
      return "cancelado";
    }
  }
  const url = URL.createObjectURL(archivo);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "descargado";
}
