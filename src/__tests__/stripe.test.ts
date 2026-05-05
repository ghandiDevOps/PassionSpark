import { describe, it, expect } from "vitest";
import { calculateAmounts, COACH_SHARE, PLATFORM_FEE, REFERRAL_FEE } from "@/lib/stripe";

// ─── calculateAmounts ─────────────────────────────────────────────────────────

describe("calculateAmounts", () => {
  it("coach reçoit 70% sur un prix de 1500 centimes", () => {
    const r = calculateAmounts(1500);
    expect(r.coachNetCents).toBe(Math.round(1500 * 0.70));
  });

  it("application_fee = platform (23%) + referral (7%) = 30%", () => {
    const r = calculateAmounts(1500);
    expect(r.applicationFeeCents).toBe(r.platformFeeCents + r.referralFeeCents);
    // La somme doit équilibrer le prix total
    expect(r.coachNetCents + r.applicationFeeCents).toBe(1500);
  });

  it("priceCents est retourné inchangé", () => {
    const r = calculateAmounts(2000);
    expect(r.priceCents).toBe(2000);
  });

  it("coachIsReferrer = false par défaut", () => {
    const r = calculateAmounts(1500);
    expect(r.coachIsReferrer).toBe(false);
  });

  it("coachIsReferrer = true si le coach est le référent", () => {
    const r = calculateAmounts(1500, true);
    expect(r.coachIsReferrer).toBe(true);
  });

  it("les montants sont des entiers (pas de centimes flottants)", () => {
    const r = calculateAmounts(1300);
    expect(Number.isInteger(r.coachNetCents)).toBe(true);
    expect(Number.isInteger(r.platformFeeCents)).toBe(true);
    expect(Number.isInteger(r.referralFeeCents)).toBe(true);
    expect(Number.isInteger(r.applicationFeeCents)).toBe(true);
  });

  it("calcul sur le prix minimum (1300 centimes = 13€)", () => {
    const r = calculateAmounts(1300);
    expect(r.platformFeeCents).toBe(Math.round(1300 * 0.23));
    expect(r.referralFeeCents).toBe(Math.round(1300 * 0.07));
    expect(r.coachNetCents).toBeGreaterThan(0);
  });

  it("calcul sur le prix maximum (2000 centimes = 20€)", () => {
    const r = calculateAmounts(2000);
    expect(r.coachNetCents).toBe(1400); // 70% de 2000
    expect(r.platformFeeCents).toBe(460); // 23% de 2000
    expect(r.referralFeeCents).toBe(140); // 7% de 2000
  });

  it("applicationFeeCents ≈ 30% du prix", () => {
    const price = 1800;
    const r = calculateAmounts(price);
    // Tolérance d'1 centime dû aux arrondis
    expect(r.applicationFeeCents).toBeCloseTo(price * 0.30, -1);
  });

  it("constants de taux sont cohérentes avec 100%", () => {
    expect(COACH_SHARE + PLATFORM_FEE + REFERRAL_FEE).toBeCloseTo(1.0);
  });

  it("ne plante pas sur un prix de 0", () => {
    const r = calculateAmounts(0);
    expect(r.coachNetCents).toBe(0);
    expect(r.applicationFeeCents).toBe(0);
  });
});
