import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/utils/slugify";

describe("slugify", () => {
  it("met en minuscules", () => {
    expect(slugify("BASKET")).toBe("basket");
  });

  it("supprime les accents", () => {
    expect(slugify("défense")).toBe("defense");
    expect(slugify("séance")).toBe("seance");
    expect(slugify("Étude")).toBe("etude");
  });

  it("remplace les espaces par des tirets", () => {
    expect(slugify("tir a 3 points")).toBe("tir-a-3-points");
  });

  it("supprime les caractères spéciaux", () => {
    expect(slugify("MMA & défense au sol!")).toBe("mma-defense-au-sol");
  });

  it("fusionne les tirets multiples en un seul", () => {
    expect(slugify("mma  defense")).toBe("mma-defense");
  });

  it("supprime les tirets en début et fin", () => {
    const result = slugify("  basket  ");
    expect(result).not.toMatch(/^-|-$/);
  });

  it("tronque à 80 caractères maximum", () => {
    const long = "a".repeat(100);
    expect(slugify(long).length).toBeLessThanOrEqual(80);
  });

  it("gère une chaîne vide", () => {
    expect(slugify("")).toBe("");
  });

  it("conserve les chiffres", () => {
    expect(slugify("session 3 points")).toBe("session-3-points");
  });

  it("cas réel : 'Tir à 3 points Karim Paris'", () => {
    expect(slugify("Tir à 3 points Karim Paris")).toBe("tir-a-3-points-karim-paris");
  });

  it("cas réel : 'Défense au sol MMA'", () => {
    expect(slugify("Défense au sol MMA")).toBe("defense-au-sol-mma");
  });

  it("cas réel : 'Cuisine végétarienne & créative'", () => {
    expect(slugify("Cuisine végétarienne & créative")).toBe("cuisine-vegetarienne-creative");
  });
});
