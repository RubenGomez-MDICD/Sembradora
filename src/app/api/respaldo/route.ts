import { NextResponse, type NextRequest } from "next/server";

/**
 * Almacén del respaldo con código (plan técnico, sección 5).
 * Guarda texto cifrado bajo un identificador; nunca recibe el código ni datos legibles.
 *
 * Usa Redis de Upstash por su API REST (sin dependencias). Lee las variables que crea
 * la integración del Marketplace de Vercel: KV_REST_API_URL y KV_REST_API_TOKEN,
 * o UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN.
 */

const URL_REDIS = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const DURA = 60 * 60 * 24 * 400; // 400 días sin actualizarse
const MAXIMO = 1_500_000; // 1.5 MB de texto cifrado
const LIMITE_POR_MINUTO = 30;

async function redis(...comando: (string | number)[]) {
  const r = await fetch(URL_REDIS!, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(comando), cache: "no-store" });
  if (!r.ok) throw new Error(`Redis ${r.status}`);
  return (await r.json()) as { result: unknown };
}

const sinAlmacen = () => NextResponse.json({ error: "sin-almacen" }, { status: 503 });
const idValido = (id: unknown): id is string => typeof id === "string" && /^[0-9a-f]{64}$/.test(id);

/** Límite simple por dirección para que nadie pruebe códigos a lo loco. */
async function demasiadas(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "sin-ip";
  const clave = `lim:${ip}:${Math.floor(Date.now() / 60_000)}`;
  const { result } = await redis("INCR", clave);
  if (result === 1) await redis("EXPIRE", clave, 70);
  return Number(result) > LIMITE_POR_MINUTO;
}

export async function GET(req: NextRequest) {
  if (!URL_REDIS || !TOKEN) return sinAlmacen();
  const id = req.nextUrl.searchParams.get("id");
  if (!idValido(id)) return NextResponse.json({ error: "id-invalido" }, { status: 400 });
  if (await demasiadas(req)) return NextResponse.json({ error: "espera" }, { status: 429 });
  const { result } = await redis("GET", `r:${id}`);
  if (!result) return NextResponse.json({ error: "no-encontrado" }, { status: 404 });
  return new NextResponse(String(result), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

export async function PUT(req: NextRequest) {
  if (!URL_REDIS || !TOKEN) return sinAlmacen();
  const texto = await req.text();
  if (texto.length > MAXIMO) return NextResponse.json({ error: "muy-grande" }, { status: 413 });
  let cuerpo: { id?: unknown; sobre?: { v?: unknown; iv?: unknown; datos?: unknown }; guardado?: unknown; movimientos?: unknown };
  try {
    cuerpo = JSON.parse(texto);
  } catch {
    return NextResponse.json({ error: "json" }, { status: 400 });
  }
  const { id, sobre } = cuerpo;
  if (!idValido(id) || !sobre || sobre.v !== 1 || typeof sobre.iv !== "string" || typeof sobre.datos !== "string") return NextResponse.json({ error: "formato" }, { status: 400 });
  if (await demasiadas(req)) return NextResponse.json({ error: "espera" }, { status: 429 });
  // Solo se guarda lo cifrado y dos datos que sirven para mostrar MD-10 antes de descifrar.
  const valor = JSON.stringify({ sobre, guardado: new Date().toISOString(), movimientos: typeof cuerpo.movimientos === "number" ? cuerpo.movimientos : null });
  await redis("SET", `r:${id}`, valor, "EX", DURA);
  return NextResponse.json({ ok: true });
}
