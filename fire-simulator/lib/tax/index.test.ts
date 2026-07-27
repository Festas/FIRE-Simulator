import { describe, it, expect } from "vitest";
import {
  calculateGermanTax,
  annualAllowance,
  taxRate,
  basisertrag,
  vorabpauschale,
  GermanTaxAccount,
  DEFAULT_BASISZINS,
  VORABPAUSCHALE_FACTOR,
  PARTIAL_EXEMPTION_RATE,
  TEILFREISTELLUNG,
  TAX_RATE_BASE,
  TAX_RATE_KIST,
  type TaxConfig,
} from "./index";

function makeConfig(overrides: Partial<TaxConfig> = {}): TaxConfig {
  return {
    filingStatus: "single",
    kirchensteuer: false,
    ...overrides,
  };
}

describe("Germany (Abgeltungssteuer)", () => {
  it("applies Teilfreistellung (30% exempt)", () => {
    expect(PARTIAL_EXEMPTION_RATE).toBe(0.3);
    expect(TEILFREISTELLUNG).toBe(0.3);
  });

  it("gives €1,000 Freibetrag for single", () => {
    expect(annualAllowance(makeConfig())).toBe(1_000);
  });

  it("gives €2,000 Freibetrag for couple", () => {
    expect(annualAllowance(makeConfig({ filingStatus: "couple" }))).toBe(2_000);
  });

  it("uses the base rate (~26.375%) without Kirchensteuer", () => {
    expect(taxRate(makeConfig())).toBeCloseTo(TAX_RATE_BASE, 5);
  });

  it("uses the higher rate with Kirchensteuer", () => {
    expect(taxRate(makeConfig({ kirchensteuer: true }))).toBeCloseTo(TAX_RATE_KIST, 5);
  });

  it("returns 0 tax on zero gains", () => {
    expect(calculateGermanTax(0, makeConfig())).toBe(0);
  });

  it("returns 0 tax on negative gains", () => {
    expect(calculateGermanTax(-5_000, makeConfig())).toBe(0);
  });

  it("taxes gains above Freibetrag at ~26.375%", () => {
    // 10,000 gains * 0.7 = 7,000 taxable, minus 1,000 Freibetrag = 6,000
    // 6,000 * 26.375% = 1,582.50
    const tax = calculateGermanTax(10_000, makeConfig());
    expect(tax).toBeCloseTo(1_582.5, 0);
  });

  it("returns 0 for small gains within Freibetrag", () => {
    // 1,000 * 0.7 = 700, which is below the 1,000 Freibetrag
    expect(calculateGermanTax(1_000, makeConfig())).toBe(0);
  });

  it("increases tax with Kirchensteuer", () => {
    const withoutKS = calculateGermanTax(10_000, makeConfig({ kirchensteuer: false }));
    const withKS = calculateGermanTax(10_000, makeConfig({ kirchensteuer: true }));
    expect(withKS).toBeGreaterThan(withoutKS);
  });
});

describe("Vorabpauschale (advance lump sum)", () => {
  it("Basisertrag = value × Basiszins × 70%", () => {
    expect(basisertrag(100_000, 2.53)).toBeCloseTo(100_000 * 0.0253 * VORABPAUSCHALE_FACTOR, 4);
    expect(VORABPAUSCHALE_FACTOR).toBe(0.7);
  });

  it("Basisertrag is 0 for non-positive value or rate", () => {
    expect(basisertrag(0, 2.53)).toBe(0);
    expect(basisertrag(100_000, 0)).toBe(0);
  });

  it("has a sensible default Basiszins", () => {
    expect(DEFAULT_BASISZINS).toBeGreaterThan(0);
    expect(DEFAULT_BASISZINS).toBeLessThan(10);
  });

  it("caps the Vorabpauschale at the actual yearly gain", () => {
    // Basisertrag = 100k × 2.53% × 70% = 1,771; gain only 500 → capped at 500
    expect(vorabpauschale(100_000, 100_500, 2.53)).toBeCloseTo(500, 4);
    // large gain → full Basisertrag
    expect(vorabpauschale(100_000, 130_000, 2.53)).toBeCloseTo(basisertrag(100_000, 2.53), 4);
  });

  it("is 0 when the position lost value", () => {
    expect(vorabpauschale(100_000, 90_000, 2.53)).toBe(0);
  });
});

describe("GermanTaxAccount", () => {
  function makeAccount(overrides: Partial<TaxConfig> = {}, basiszins = 2.53, initialBasis = 0) {
    return new GermanTaxAccount(makeConfig(overrides), basiszins, initialBasis);
  }

  it("defers tax: Vorabpauschale is far smaller than taxing full annual gains", () => {
    const acct = makeAccount({}, 2.53, 100_000);
    // Position grows 100k → 130k (30k gain)
    const vapTax = acct.taxVorabpauschale(100_000, 30_000);
    const fullGainTax = calculateGermanTax(30_000, makeConfig());
    expect(vapTax).toBeLessThan(fullGainTax);
  });

  it("raises the cost basis by the Vorabpauschale so it is not taxed twice", () => {
    const acct = makeAccount({}, 2.53, 100_000);
    const vap = Math.min(basisertrag(100_000, 2.53), 30_000);
    acct.taxVorabpauschale(100_000, 30_000);
    expect(acct.costBasis).toBeCloseTo(100_000 + vap, 4);
  });

  it("taxes only the realised gain fraction on withdrawal (proportional method)", () => {
    // basis 60k in a 100k position → 40% is gain
    const acct = makeAccount({ filingStatus: "single" }, 2.53, 60_000);
    const tax = acct.taxWithdrawal(10_000, 100_000);
    // realised gain = 10,000 × 0.4 = 4,000; taxable = 4,000 × 0.7 = 2,800; minus 1,000 allowance
    const expected = (4_000 * (1 - TEILFREISTELLUNG) - 1_000) * TAX_RATE_BASE;
    expect(tax).toBeCloseTo(expected, 2);
  });

  it("reduces cost basis proportionally after a withdrawal", () => {
    const acct = makeAccount({}, 2.53, 60_000);
    acct.taxWithdrawal(10_000, 100_000);
    // sold 10k, basisFraction 0.6 → basis drops by 6,000
    expect(acct.costBasis).toBeCloseTo(54_000, 4);
  });

  it("shares one annual Sparer-Pauschbetrag across Vorabpauschale and realised gains", () => {
    const acct = makeAccount({ filingStatus: "single" }, 2.53, 50_000);
    acct.beginYear();
    // Big Vorabpauschale consumes most of the €1,000 allowance
    const vapTax = acct.taxVorabpauschale(200_000, 100_000);
    expect(vapTax).toBeGreaterThan(0);
    // A subsequent realised gain in the same year gets little/no remaining allowance
    const wTax = acct.taxWithdrawal(20_000, 200_000);
    const freshYearTax = (() => {
      const fresh = makeAccount({}, 2.53, acct.costBasis);
      fresh.beginYear();
      return fresh.taxWithdrawal(20_000, 200_000);
    })();
    expect(wTax).toBeGreaterThanOrEqual(freshYearTax);
  });

  it("beginYear resets the allowance budget each year", () => {
    const acct = makeAccount({}, 2.53, 50_000);
    acct.beginYear();
    acct.taxVorabpauschale(200_000, 100_000); // consumes allowance
    acct.beginYear(); // reset
    // A fresh small gain within the allowance is now tax-free again
    const tax = acct.taxWithdrawal(1_000, 200_000);
    expect(tax).toBe(0);
  });

  it("no tax when withdrawing from a position with no gain", () => {
    const acct = makeAccount({}, 2.53, 100_000);
    expect(acct.taxWithdrawal(10_000, 100_000)).toBe(0);
  });
});
