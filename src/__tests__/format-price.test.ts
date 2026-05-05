import { describe, it, expect } from "vitest";
import { formatPrice, formatPriceShort } from "@/lib/utils/format-price";

describe("formatPrice", () => {
  it("convertit 1500 centimes en '15 €'", () => {
    expect(formatPrice(1500)).toContain("15");
    expect(formatPrice(1500)).toContain("€");
  });

  it("convertit 2000 centimes en '20 €'", () => {
    expect(formatPrice(2000)).toContain("20");
  });

  it("convertit 1300 centimes en '13 €'", () => {
    expect(formatPrice(1300)).toContain("13");
  });

  it("0 centimes → '0 €'", () => {
    expect(formatPrice(0)).toContain("0");
    expect(formatPrice(0)).toContain("€");
  });

  it("n'affiche pas de décimales inutiles", () => {
    const result = formatPrice(1500);
    // Pas de ",00" ni ".00"
    expect(result).not.toMatch(/[,.]00/);
  });

  it("grandes valeurs : 100 000 centimes = 1 000 €", () => {
    const result = formatPrice(100_000);
    expect(result).toContain("1");
    expect(result).toContain("000");
  });
});

describe("formatPriceShort", () => {
  it("retourne '15€' pour 1500", () => {
    expect(formatPriceShort(1500)).toBe("15€");
  });

  it("retourne '20€' pour 2000", () => {
    expect(formatPriceShort(2000)).toBe("20€");
  });

  it("retourne '0€' pour 0", () => {
    expect(formatPriceShort(0)).toBe("0€");
  });
});
