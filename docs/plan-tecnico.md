# Plan técnico de La sembradora

Documento de decisiones para construir el sitio. Sirve también como base del apartado 9.4.4 de la tesis (desarrollo técnico). Cada decisión indica por qué se tomó; las que siguen abiertas están en la última sección.

Diseño de referencia: archivo de Figma «Página Web Educación Financiera», páginas Componentes y Pantallas. Cada ruta del código indica qué pantallas de Figma la diseñan (`src/lib/routes.ts`).

## 1. Qué es y para quién

- Sitio de educación financiera para personas trabajadoras del hogar del Área Metropolitana de Guadalajara.
- Se usa sobre todo en el teléfono, muchas veces un Android de gama baja con datos limitados.
- No hay cuentas ni inicio de sesión. Lo que la usuaria anota se queda en su teléfono.
- Cinco secciones: Mi sueldo, Mi dinero, Mis ahorros, Mis derechos y Aprende.

## 2. Stack

| Pieza | Elección | Por qué |
| --- | --- | --- |
| Marco | Next.js (App Router) con TypeScript | Páginas estáticas que cargan rápido y funciones de servidor solo donde hacen falta (respaldo). Se publica en Vercel sin configuración. |
| Componentes | Chakra UI v3 | Es la librería que se usó para diseñar en Figma; los componentes ya son accesibles (foco, teclado, ARIA). |
| Tema | `src/theme`, tokens tomados de las variables de Figma | Una sola fuente de verdad: los nombres de las variables CSS coinciden con el «code syntax» de Figma. |
| Íconos | lucide-react | Los mismos íconos Lucide del diseño. Licencia ISC. |
| Fuentes | Nunito y Open Sans servidas desde el propio sitio (@fontsource) | No se piden fuentes a Google: más privacidad y menos dependencia de conexiones externas. |
| Guardado local | Dexie (IndexedDB) | Base de datos en el navegador, funciona sin internet y aguanta miles de movimientos. |
| Publicación | Vercel, plan gratuito | Cada cambio en GitHub se publica solo y cada propuesta tiene su vista previa. |

## 3. Rutas

El mapa completo está en `src/lib/routes.ts`. Resumen:

| Sección | Rutas principales | Figma |
| --- | --- | --- |
| Inicio | `/`, `/fuentes` | IN-1, IN-2 (menú), IN-3 |
| Mi sueldo | `/mi-sueldo` y los pasos `tareas`, `frecuencia`, `casa`, `pago`, `resultado`; además `tarifa` y `platicarlo` | MS-0 a MS-6 |
| Mi dinero | `/mi-dinero`, `anotar`, `movimientos`, `ideas`, `tope`, `deudas`, `respaldo`, `pin` | MD-0 a MD-18 |
| Mis ahorros | `/mis-ahorros`, `meta`, `plazo`, `plan`, `tandas`, `por-que-ahorrar`, `emergencias` | AH-0 a AH-8 |
| Mis derechos | `/mis-derechos`, `contrato`, `datos`, `resultado`, `platicarlo`, `imss` | DR-0 a DR-5b |
| Aprende | `/aprende`, `glosario`, `apoyos` | AP-0 a AP-4 |

Reglas:

- Un paso, una ruta. Así funciona el botón «atrás» del teléfono y se puede retomar un flujo.
- Los estados de una misma pantalla (por ejemplo, balance vacío, con datos o en negativo) viven en la misma ruta.
- Mientras una ruta no tenga su pantalla, se muestra un esqueleto navegable que indica su diseño en Figma (`src/app/[...slug]/page.tsx`).

## 4. Guardado en el teléfono

Base de datos `sembradora` en IndexedDB, con Dexie (código en `src/lib/db`). Todos los registros tienen `id` (UUID), `creado`, `actualizado` (fecha ISO) y, si se borraron, `borrado`. Los montos se guardan en centavos enteros para evitar errores de redondeo.

| Tabla | Para qué | Campos principales |
| --- | --- | --- |
| `movimientos` | Gastos e ingresos | tipo (gasto, ingreso), monto, categoriaId, nota, fecha, deudaId opcional |
| `categorias` | Categorías de fábrica y propias | nombre, icono, tipo, propia |
| `deudas` | Lo que debes | nombre, tipo (tarjeta, persona, tienda, banco o app, empeño), montoInicial, frecuencia, pagoPorPeriodo, proximoPago, interes opcional |
| `metas` | Metas de ahorro | nombre, icono, montoObjetivo, plazo (número y unidad), frecuencia de aporte |
| `tandas` | Tandas sumadas a una meta | monto, frecuencia, personas, turno, inicio, metaId |
| `topes` | Topes semanales por categoría | categoriaId, montoSemanal |
| `calculos` | Resultados de Mi sueldo y Mis derechos | tipo, datos de entrada, resultado, fecha |
| `borradores` | Avance de cada flujo de varios pasos | el `id` es el nombre del flujo; datos |
| `ajustes` | Preferencias | el `id` es la clave: pin (solo su huella cifrada), ultimoRespaldo |

Reglas:

- El avance de cada flujo se guarda solo al cambiar un campo. El componente SaveStatus muestra «Guardando», «Se guardó» o el error.
- Un préstamo recibido crea un ingreso y una deuda. Cada pago de una deuda crea un gasto en la categoría Deudas.
- Borrar un movimiento usa Deshacer durante unos segundos en lugar de pedir confirmación.
- Borrar no quita el registro: lo marca con `borrado`. Así Deshacer lo regresa y, al juntar un respaldo viejo, lo borrado no revive.
- Las categorías de fábrica tienen `id` fijos (`comida`, `pago-trabajo`…) para que dos respaldos se junten sin duplicarlas. «Deudas» está oculta: se usa sola al anotar un pago.
- Las pruebas (`npm test`, con Vitest y fake-indexeddb) cubren cada regla de esta sección y de la sección 5 con los datos de ejemplo de Figma.

## 5. Respaldo

Dos caminos, los dos opcionales:

1. **Archivo**: se descarga un archivo con todos los datos. Se puede mandar por WhatsApp y recuperar sin internet.
2. **Código de respaldo**: el teléfono cifra los datos con el código antes de mandarlos, y el servidor solo guarda texto cifrado que no puede leer.
   - Código de 3 grupos sin letras que se confunden (sin O, 0, I ni 1). Se acepta en minúsculas, con espacios o sin guiones.
   - Del código salen dos cosas por separado: un identificador para buscar el respaldo y la llave para descifrarlo (Web Crypto: PBKDF2 y AES-GCM).
   - El servidor es una función de Vercel con una base de datos del Marketplace de Vercel (por ejemplo, Upstash o Neon).

Al recuperar en un teléfono que ya tiene datos se elige entre **juntar** (unión por `id`; gana el registro con `actualizado` más reciente) o **reemplazar** (botón de peligro y opción de guardar antes un archivo).

## 6. Cálculos

Los cálculos viven en `src/lib/calculos`, separados de las pantallas, con pruebas automáticas para cada caso de Figma:

- **Sueldo justo**: tabulador de Salario Digno de CACEH (2024), modulado por tareas, frecuencia, tamaño de la casa, personas y horas.
- **Prestaciones**: aguinaldo (15 días, art. 87 LFT), vacaciones según antigüedad (art. 76), prima vacacional del 25 % (art. 80).
- **Salida**: finiquito y liquidación (art. 49 fracción IV, 50, 162 y 518 LFT). Se presentan como montos aproximados.
- **Ahorro**: aporte por semana o por mes según meta y plazo; fechas y monto de una tanda.
- **Referencia legal**: salario mínimo de personas trabajadoras del hogar 2026 (CONASAMI).

Los valores que cambian cada año (salario mínimo, tabulador) van en un archivo de datos con su fuente y fecha, para actualizarlos sin tocar el código.

## 7. Accesibilidad

Meta: WCAG 2.2 nivel AA.

- Áreas táctiles de al menos 44 px (botones de 44 y 48 px).
- Contraste medido sobre las superficies reales. El 12 de noviembre de 2026 se ajustaron tres colores en Figma y en el código: `content/subtle` #7D7A76 → #716E6A (4.54:1 sobre `surface/subtle`), `border/default` #9C9894 → #8F8B88 (3.3:1, mínimo 3:1 para bordes de controles) y `feedback/error/fg` #C83C31 → #C03A2F (4.6:1 sobre su fondo).
- Foco visible en todo, orden de foco lógico, Drawer y diálogos atrapan el foco.
- Avisos (Toast y SaveStatus) en regiones `aria-live="polite"`, solo para lo que causa la usuaria.
- Nada depende solo del color: los términos del glosario llevan subrayado y las barras llevan monto escrito.
- Se respeta «reducir movimiento» del teléfono y el zoom de texto hasta 200 %.
- Idioma `es-MX` declarado; textos en lenguaje claro.

## 8. Rendimiento

- Presupuesto: primera carga de cada página por debajo de 200 KB de JavaScript comprimido y Lighthouse móvil de 90 o más.
- Páginas estáticas siempre que se pueda; las calculadoras se hidratan solo donde hay interacción.
- Pruebas en un Android de gama baja real además del simulador.

## 9. Privacidad

- Sin cuentas, sin cookies de rastreo y sin servicios de terceros en el navegador.
- Los datos personales nunca salen del teléfono sin cifrar.
- Si se agrega analítica, debe ser sin cookies y sin datos personales (decisión pendiente).

## 10. Fases

1. Plan técnico (este documento).
2. Proyecto base: tema con tokens, rutas, menú, Inicio y esqueleto navegable. Publicado en Vercel.
3. Componentes de la librería en código: Button, Card, Stat, Alert, Toast, Input, Select, RadioCard, CheckboxCard, Progress, DataList, Steps, SegmentGroup, AppHeader, SaveStatus, DebtCard y Chart.
4. Guardado local con Dexie y pruebas del modelo de datos.

Estado al 13 de noviembre de 2026: fases 1 a 4 terminadas; Inicio y Aprende construidas.

Después, por secciones: Inicio y Aprende → Mi sueldo y Mis derechos → Mis ahorros → Mi dinero y deudas → Respaldo.

## 11. Pendientes y decisiones abiertas

- **Fórmula de Mi sueldo** (en pausa): falta la regla exacta de modulación por tareas acumuladas y frecuencia.
- **Montos legales**: validar liquidación y finiquito con CACEH o PROFEDET antes de publicar.
- **Licencia de los contenidos**: el código usa la licencia MIT. Los textos, ilustraciones y la identidad del sitio pueden llevar una licencia aparte (por ejemplo, Creative Commons BY 4.0).
- **Analítica**: decidir si se usa y con qué herramienta.
- **Dominio**: el de Vercel (`*.vercel.app`) o uno propio.
- **Ilustraciones**: dirección de estilo pendiente.
- **Glosario**: los 42 textos de `src/content/glosario.ts` son un borrador con su artículo de ley; validarlos con CACEH o PROFEDET.

## 12. Para actualizar en el documento de tesis

Cambios ya hechos en el diseño y el código que la tesis debe reflejar cuando se redacte o revise el apartado correspondiente:

- **Paleta (9.4.3)**: secundario cambiado de naranja a morado (#7759B0) porque se confundía con el color de error; ajuste de contraste en `content/subtle`, `border/default` y `feedback/error/fg` (valores en la sección 7).
- **Desarrollo técnico (9.4.4)**: stack, guardado local, respaldo cifrado y licencia MIT del código.
