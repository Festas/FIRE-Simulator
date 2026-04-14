import { describe, it, expect } from "vitest";
import { getTaxEngine, TAX_COUNTRIES, type TaxConfig } from "./index";

function makeConfig(overrides: Partial<TaxConfig> = {}): TaxConfig {
  return {
    country: "DE",
    filingStatus: "single",
    kirchensteuer: false,
    annualIncome: 60_000,
    ...overrides,
  };
}

describe("Tax Engine Registry", () => {
  it("returns an engine for every supported country", () => {
    for (const country of TAX_COUNTRIES) {
      const engine = getTaxEngine(country);
      expect(engine).toBeDefined();
      expect(engine.id).toBe(country);
    }
  });

  it("all engines return 0 tax on 0 gains", () => {
    for (const country of TAX_COUNTRIES) {
      const engine = getTaxEngine(country);
      expect(engine.calculateTax(0, makeConfig({ country }))).toBe(0);
    }
  });

  it("all engines return 0 tax on negative gains", () => {
    for (const country of TAX_COUNTRIES) {
      const engine = getTaxEngine(country);
      expect(engine.calculateTax(-5_000, makeConfig({ country }))).toBe(0);
    }
  });
});

describe("Germany (DE)", () => {
  const engine = getTaxEngine("DE");

  it("applies Teilfreistellung (30% exempt)", () => {
    expect(engine.partialExemptionRate).toBe(0.3);
  });

  it("gives €1,000 Freibetrag for single", () => {
    expect(engine.annualAllowance(makeConfig())).toBe(1_000);
  });

  it("gives €2,000 Freibetrag for couple", () => {
    expect(engine.annualAllowance(makeConfig({ filingStatus: "couple" }))).toBe(2_000);
  });

  it("taxes gains above Freibetrag at ~26.375%", () => {
    // 10,000 gains * 0.7 = 7,000 taxable, minus 1,000 Freibetrag = 6,000
    // 6,000 * 26.375% = 1,582.50
    const tax = engine.calculateTax(10_000, makeConfig());
    expect(tax).toBeCloseTo(1_582.5, 0);
  });

  it("returns 0 for small gains within Freibetrag", () => {
    // 1,000 * 0.7 = 700, which is below 1,000 Freibetrag
    expect(engine.calculateTax(1_000, makeConfig())).toBe(0);
  });

  it("increases tax with Kirchensteuer", () => {
    const withoutKS = engine.calculateTax(10_000, makeConfig({ kirchensteuer: false }));
    const withKS = engine.calculateTax(10_000, makeConfig({ kirchensteuer: true }));
    expect(withKS).toBeGreaterThan(withoutKS);
  });
});

describe("United States (US)", () => {
  const engine = getTaxEngine("US");

  it("has no partial exemption", () => {
    expect(engine.partialExemptionRate).toBe(0);
  });

  it("applies 0% rate for low income", () => {
    const tax = engine.calculateTax(5_000, makeConfig({ country: "US", annualIncome: 30_000 }));
    expect(tax).toBe(0);
  });

  it("applies 15% rate for mid income", () => {
    const tax = engine.calculateTax(10_000, makeConfig({ country: "US", annualIncome: 100_000 }));
    expect(tax).toBe(1_500);
  });

  it("applies 20% rate for high income", () => {
    const tax = engine.calculateTax(10_000, makeConfig({ country: "US", annualIncome: 600_000 }));
    expect(tax).toBe(2_000);
  });
});

describe("United Kingdom (UK)", () => {
  const engine = getTaxEngine("UK");

  it("has CGT allowance", () => {
    const allowance = engine.annualAllowance(makeConfig({ country: "UK" }));
    expect(allowance).toBeGreaterThan(0);
  });

  it("exempts gains below CGT allowance", () => {
    const allowance = engine.annualAllowance(makeConfig({ country: "UK" }));
    expect(engine.calculateTax(allowance, makeConfig({ country: "UK" }))).toBe(0);
  });

  it("taxes gains above allowance at basic rate for low income", () => {
    const tax = engine.calculateTax(10_000, makeConfig({ country: "UK", annualIncome: 30_000 }));
    expect(tax).toBeGreaterThan(0);
  });
});

describe("Switzerland (CH)", () => {
  const engine = getTaxEngine("CH");

  it("has zero tax on private investment gains", () => {
    expect(engine.calculateTax(1_000_000, makeConfig({ country: "CH" }))).toBe(0);
  });

  it("has infinite allowance", () => {
    expect(engine.annualAllowance(makeConfig({ country: "CH" }))).toBe(Infinity);
  });
});

describe("Austria (AT)", () => {
  const engine = getTaxEngine("AT");

  it("applies flat 27.5% KESt", () => {
    expect(engine.calculateTax(10_000, makeConfig({ country: "AT" }))).toBe(2_750);
  });

  it("has zero allowance", () => {
    expect(engine.annualAllowance(makeConfig({ country: "AT" }))).toBe(0);
  });
});

describe("Netherlands (NL)", () => {
  const engine = getTaxEngine("NL");

  it("applies Box 3 notional return tax", () => {
    const tax = engine.calculateTax(10_000, makeConfig({ country: "NL" }));
    expect(tax).toBeGreaterThan(0);
    expect(tax).toBeLessThan(10_000);
  });
});
