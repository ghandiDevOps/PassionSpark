import { describe, it, expect } from "vitest";
import { generateQrToken } from "@/lib/utils/generate-qr-token";

describe("generateQrToken", () => {
  it("retourne une chaîne non vide", () => {
    expect(generateQrToken().length).toBeGreaterThan(0);
  });

  it("respecte le format UUID v4", () => {
    const uuid = generateQrToken();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("génère des tokens uniques à chaque appel", () => {
    const tokens = Array.from({ length: 100 }, () => generateQrToken());
    const unique = new Set(tokens);
    expect(unique.size).toBe(100);
  });

  it("a exactement 36 caractères (UUID standard)", () => {
    expect(generateQrToken()).toHaveLength(36);
  });
});
