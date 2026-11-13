import { describe, expect, it } from "vitest";
import { ALFABETO, CodigoIncorrecto, cifrar, descifrar, idDeCodigo, nuevoCodigo, revisarCodigo } from "./codigo";

describe("código de respaldo", () => {
  it("tiene tres grupos y no usa O, 0, I ni 1 en los grupos aleatorios", () => {
    for (let i = 0; i < 200; i++) {
      const c = nuevoCodigo();
      expect(c).toMatch(/^[A-Z]+-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
      expect(c.split("-").slice(1).join("")).not.toMatch(/[OI01]/);
    }
    expect(ALFABETO).toHaveLength(32);
  });

  it("acepta minúsculas, espacios y sin guiones", () => {
    expect(revisarCodigo("milpa 7k3q 92xd")).toEqual({ ok: true, codigo: "MILPA-7K3Q-92XD" });
    expect(revisarCodigo("MILPA7K3Q92XD")).toEqual({ ok: true, codigo: "MILPA-7K3Q-92XD" });
    expect(revisarCodigo(" calabaza-abcd-2345 ")).toEqual({ ok: true, codigo: "CALABAZA-ABCD-2345" });
  });

  it("explica los errores de MD-11 y MD-11b", () => {
    expect(revisarCodigo("MILPA-7K3O-92XD")).toEqual({ ok: false, error: "letra-o" });
    expect(revisarCodigo("MILPA-7K3")).toEqual({ ok: false, error: "incompleto" });
    expect(revisarCodigo("MILPA-7K30-92XD")).toEqual({ ok: false, error: "cero" });
    expect(revisarCodigo("PERRO-7K3Q-92XD")).toEqual({ ok: false, error: "palabra" });
    expect(revisarCodigo("")).toEqual({ ok: false, error: "vacio" });
  });
});

describe("cifrado", () => {
  it("el mismo código abre el respaldo y otro código no", async () => {
    const datos = { formato: "la-sembradora/respaldo", tablas: { movimientos: [{ id: "1", monto: 12000 }] } };
    const sobre = await cifrar("MILPA-7K3Q-92XD", datos);
    expect(sobre.datos).not.toContain("12000");
    expect(await descifrar("MILPA-7K3Q-92XD", sobre)).toEqual(datos);
    await expect(descifrar("MILPA-7K3Q-92XE", sobre)).rejects.toBeInstanceOf(CodigoIncorrecto);
  }, 20_000);

  it("el identificador no es el código y siempre es el mismo", async () => {
    const id = await idDeCodigo("MILPA-7K3Q-92XD");
    expect(id).toMatch(/^[0-9a-f]{64}$/);
    expect(id).toBe(await idDeCodigo("MILPA-7K3Q-92XD"));
    expect(id).not.toBe(await idDeCodigo("MILPA-7K3Q-92XE"));
  });
});
