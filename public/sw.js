/*
 * Service worker de La sembradora: que el sitio abra sin internet.
 *
 * - Al instalarse guarda las pantallas esenciales (y sus archivos de código y estilos).
 * - Cada página que se visita con internet queda guardada para la próxima vez.
 * - Páginas: primero la red (para ver siempre lo más nuevo) y, si no hay, lo guardado.
 * - Archivos con huella (/_next/static): lo guardado primero; nunca cambian.
 * - /api y la analítica de Vercel no pasan por aquí.
 *
 * La versión llega en la dirección del script (sw.js?v=…): cada publicación es un
 * service worker nuevo que espera hasta que la persona toque «Actualizar».
 */

const VERSION = new URL(self.location.href).searchParams.get("v") || "dev";
const PAGINAS = `sembradora-paginas-${VERSION}`;
const ESTATICOS = "sembradora-estaticos";
const MAX_ESTATICOS = 400;
const SIN_INTERNET = "/sin-internet";

/** Lo que se guarda al instalar: lo que más se usa sin internet. */
const ESENCIALES = ["/", "/mi-dinero", "/mi-dinero/anotar", "/mi-dinero/anotar/categoria", "/mi-dinero/movimientos", "/aprende/glosario", SIN_INTERNET];

const esEstatico = (url) => url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/iconos/");
const clave = (url) => url.origin + url.pathname; // ?id= y ?tipo= comparten la misma página

/** Saca de un HTML las rutas de sus archivos de /_next/static para guardarlos también. */
function recursosDe(html) {
  const urls = new Set();
  for (const m of html.matchAll(/["'(\\](\/_next\/static\/[^"'()\s\\]+)/g)) urls.add(m[1]);
  return [...urls];
}

/** Guarda los archivos que falten. De las hojas de estilo saca también las fuentes. */
async function guardarEstaticos(urls) {
  const estaticos = await caches.open(ESTATICOS);
  await Promise.all(
    urls.map(async (u) => {
      try {
        let r = await estaticos.match(u);
        if (!r) {
          r = await fetch(u);
          if (!r.ok) return;
          await estaticos.put(u, r.clone());
        }
        if (u.endsWith(".css")) {
          const base = new URL(u, self.location.origin);
          const fuentes = [...(await r.text()).matchAll(/url\(["']?([^"')]+)["']?\)/g)].map((m) => new URL(m[1], base).pathname).filter((f) => f.startsWith("/_next/static/"));
          for (const f of fuentes) if (!(await estaticos.match(f))) {
            const rf = await fetch(f);
            if (rf.ok) await estaticos.put(f, rf);
          }
        }
      } catch {
        /* se intentará en la próxima visita */
      }
    }),
  );
}

async function guardarPagina(ruta) {
  const url = new URL(ruta, self.location.origin);
  const r = await fetch(url, { credentials: "same-origin" });
  if (!r.ok) return;
  const html = await r.clone().text();
  await (await caches.open(PAGINAS)).put(clave(url), r);
  await guardarEstaticos(recursosDe(html));
}

self.addEventListener("install", (e) => {
  e.waitUntil(Promise.all(ESENCIALES.map((r) => guardarPagina(r).catch(() => {}))));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      for (const nombre of await caches.keys()) if (nombre.startsWith("sembradora-paginas-") && nombre !== PAGINAS) await caches.delete(nombre);
      // Los archivos con huella se acumulan entre versiones: se quitan los más viejos.
      const estaticos = await caches.open(ESTATICOS);
      const llaves = await estaticos.keys();
      for (const k of llaves.slice(0, Math.max(0, llaves.length - MAX_ESTATICOS))) await estaticos.delete(k);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (e) => {
  if (e.data?.tipo === "ACTUALIZAR") self.skipWaiting();
  // La página en la que se instaló el service worker no pasó por él: se guarda aparte.
  if (e.data?.tipo === "GUARDAR" && typeof e.data.ruta === "string") e.waitUntil(guardarPagina(e.data.ruta).catch(() => {}));
});

/** Red con límite de tiempo: con señal débil no se queda esperando para siempre. */
function redConTiempo(req, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("tiempo")), ms);
    fetch(req).then(
      (r) => (clearTimeout(t), resolve(r)),
      (err) => (clearTimeout(t), reject(err)),
    );
  });
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_vercel/")) return;

  // Datos de navegación de Next (RSC): sin internet fallan y Next carga la página completa,
  // que sí sale de lo guardado. No se guardan porque dependen del estado de la navegación.
  if (req.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) return;

  if (esEstatico(url)) {
    e.respondWith(
      (async () => {
        const cache = await caches.open(ESTATICOS);
        const guardado = await cache.match(req, { ignoreSearch: true });
        if (guardado) return guardado;
        const r = await fetch(req);
        if (r.ok) e.waitUntil(cache.put(req, r.clone()));
        return r;
      })(),
    );
    return;
  }

  if (req.mode === "navigate") {
    e.respondWith(
      (async () => {
        const cache = await caches.open(PAGINAS);
        try {
          const r = await redConTiempo(req, 4000);
          if (r.ok && r.headers.get("content-type")?.includes("text/html")) {
            const copia = r.clone();
            e.waitUntil(
              (async () => {
                await cache.put(clave(url), copia.clone());
                // Sus archivos también, para que la página abra completa sin internet.
                await guardarEstaticos(recursosDe(await copia.text()));
              })(),
            );
          }
          return r;
        } catch {
          return (await cache.match(clave(url))) || (await cache.match(clave(new URL(SIN_INTERNET, url.origin)))) || Response.error();
        }
      })(),
    );
    return;
  }

  // Lo demás del mismo sitio (manifiesto, íconos de la app): lo guardado y se actualiza atrás.
  e.respondWith(
    (async () => {
      const cache = await caches.open(PAGINAS);
      const guardado = await cache.match(req);
      const red = fetch(req)
        .then((r) => {
          if (r.ok) cache.put(req, r.clone());
          return r;
        })
        .catch(() => guardado || Response.error());
      return guardado || red;
    })(),
  );
});
