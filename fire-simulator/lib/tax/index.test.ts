import { describe, it, expect } from "vitest";
import {
  calculateGermanTax,
  annualAllowance,
  taxRate,
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
