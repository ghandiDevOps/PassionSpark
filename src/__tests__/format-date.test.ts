import { describe, it, expect } from "vitest";
import {
  formatDateLong,
  formatDateShort,
  formatTime,
  formatSessionDateTime,
  isSessionFuture,
} from "@/lib/utils/format-date";

const FIXED_DATE = new Date("2026-04-18T10:00:00.000Z"); // Samedi 18 avril 2026 à 10h UTC

describe("formatTime", () => {
  it("formate l'heure en HhMM", () => {
    // L'heure dépend du fuseau — on vérifie juste le format
    const result = formatTime(FIXED_DATE);
    expect(result).toMatch(/^\d{2}h\d{2}$/);
  });
});

describe("formatDateLong", () => {
  it("retourne une chaîne non vide", () => {
    expect(formatDateLong(FIXED_DATE).length).toBeGreaterThan(0);
  });

  it("contient l'année 2026", () => {
    expect(formatDateLong(FIXED_DATE)).toContain("2026");
  });

  it("contient le jour du mois (18)", () => {
    expect(formatDateLong(FIXED_DATE)).toContain("18");
  });
});

describe("formatDateShort", () => {
  it("retourne une chaîne non vide", () => {
    expect(formatDateShort(FIXED_DATE).length).toBeGreaterThan(0);
  });

  it("contient le jour du mois (18)", () => {
    expect(formatDateShort(FIXED_DATE)).toContain("18");
  });
});

describe("formatSessionDateTime", () => {
  it("contient un séparateur '·' entre date et heures", () => {
    const result = formatSessionDateTime(FIXED_DATE, 60);
    expect(result).toContain("·");
  });

  it("contient un séparateur '–' entre l'heure de début et de fin", () => {
    const result = formatSessionDateTime(FIXED_DATE, 60);
    expect(result).toContain("–");
  });

  it("retourne une chaîne non vide pour 60 min", () => {
    expect(formatSessionDateTime(FIXED_DATE, 60).length).toBeGreaterThan(0);
  });

  it("retourne une chaîne non vide pour 120 min", () => {
    expect(formatSessionDateTime(FIXED_DATE, 120).length).toBeGreaterThan(0);
  });

  it("le format 120 min est différent du format 60 min (heures différentes)", () => {
    const r60  = formatSessionDateTime(FIXED_DATE, 60);
    const r120 = formatSessionDateTime(FIXED_DATE, 120);
    expect(r60).not.toBe(r120);
  });
});

describe("isSessionFuture", () => {
  it("une date dans le futur lointain retourne true", () => {
    const futur = new Date(Date.now() + 100_000_000);
    expect(isSessionFuture(futur)).toBe(true);
  });

  it("une date passée retourne false", () => {
    const passe = new Date(2020, 0, 1);
    expect(isSessionFuture(passe)).toBe(false);
  });
});
