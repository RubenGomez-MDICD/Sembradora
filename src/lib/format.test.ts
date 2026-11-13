import { describe, expect, it } from "vitest";
import { formatFechaLarga, formatMoney, parsePesos } from "./format";

describe("formato", () => {
  it("lee pesos como los escribe la gente", () => {
    expect(parsePesos("450")).toBe(45000);
    expect(parsePesos("$ 1,500")).toBe(150000);
    expect(parsePesos("1,500.50")).toBe(150050);
    expect(parsePesos("342.47")).toBe(34247);
    expect(parsePesos("450,5")).toBe(45050);
    expect(parsePesos("")).toBeNull();
    expect(parsePesos("abc")).toBeNull();
    expect(parsePesos("1.234")).toBeNull();
  });

  it("muestra dinero y fechas en es-MX", () => {
    expect(formatMoney(1687500)).toBe("$16,875");
    expect(formatMoney(34247)).toBe("$342.47");
    expect(formatMoney(-35000)).toBe("-$350");
    expect(formatFechaLarga("2026-10-15")).toBe("15 de octubre de 2026");
  });
});
