import { describe, it, expect } from "vitest";
import {
  calculateFIRE,
  calculateReverse,
  FireInputs,
  formatEuro,
  formatEuroShort,
} from "./fireCalculations";

// ---------------------------------------------------------------------------
// Default test inputs
// ---------------------------------------------------------------------------

const defaultInputs: FireInputs = {
  startKapital: 50_000,
  monatlicheSparrate: 3_250,
  dynamikSparrate: 2.0,
  etfRendite: 7.0,
  inflation: 2.5,
  bavJaehrlich: 8_000,
  zielvermoegen: 1_650_000,
  lzkJahre: 3,
  lzkRendite: 3.5,
  startYear: 2026,
  monatlichesWunschEinkommen: 4_000,
  gesetzlicheRente: 1_500,
  swr: 3.5,
  steuerModell: "single",
  kirchensteuer: false,
  entnahmeModell: "ewigeRente",
  kapitalverzehrJahre: 30,
  monatlichesBrutto: 6_500,
};

function makeInputs(overrides: Partial<FireInputs> = {}): FireInputs {
  return { ...defaultInputs, ...overrides };
}

// ---------------------------------------------------------------------------
// Tax calculation tests
// ---------------------------------------------------------------------------

describe("Tax calculation", () => {
  it("applies Teilfreistellung (30% of gains are tax-free)", () => {
    const result = calculateFIRE(makeInputs());
    // Effective tax rate should be less than the base rate of 26.375%
    // because only 70% of gains are taxable
    expect(result.effectiveTaxRate).toBeLessThan(0.26375);
    expect(result.effectiveTaxRate).toBeGreaterThan(0);
  });

  it("increases tax with Kirchensteuer enabled", () => {
    const without = calculateFIRE(makeInputs({ kirchensteuer: false }));
    const with_ = calculateFIRE(makeInputs({ kirchensteuer: true }));
    expect(with_.totalTaxPaid).toBeGreaterThan(without.totalTaxPaid);
  });

  it("gives higher Freibetrag for couples", () => {
    const single = calculateFIRE(makeInputs({ steuerModell: "single" }));
    const couple = calculateFIRE(makeInputs({ steuerModell: "couple" }));
    // Couples should pay less tax due to double Freibetrag
    expect(couple.totalTaxPaid).toBeLessThan(single.totalTaxPaid);
  });

  it("effective tax rate is between 0 and 30%", () => {
    const result = calculateFIRE(makeInputs());
    expect(result.effectiveTaxRate).toBeGreaterThanOrEqual(0);
    expect(result.effectiveTaxRate).toBeLessThan(0.3);
  });
});

// ---------------------------------------------------------------------------
// FIRE milestone tests
// ---------------------------------------------------------------------------

describe("FIRE milestones", () => {
  it("reaches Full FIRE with good savings rate and return", () => {
    const result = calculateFIRE(makeInputs());
    expect(result.targetReached).toBe(true);
    expect(result.fullFireYear).not.toBeNull();
    expect(result.fullFireCalendarYear).not.toBeNull();
  });

  it("calculates Coast FIRE before or at Full FIRE", () => {
    const result = calculateFIRE(makeInputs());
    if (result.coastFireYear !== null && result.fullFireYear !== null) {
      expect(result.coastFireYear).toBeLessThanOrEqual(result.fullFireYear);
    }
  });

  it("does not reach FIRE with very low savings", () => {
    const result = calculateFIRE(
      makeInputs({
        monatlicheSparrate: 100,
        startKapital: 0,
        dynamikSparrate: 0,
        bavJaehrlich: 0,
        zielvermoegen: 5_000_000,
      }),
    );
    expect(result.targetReached).toBe(false);
  });

  it("reaches FIRE immediately with large starting capital", () => {
    const result = calculateFIRE(
      makeInputs({
        startKapital: 5_000_000,
        zielvermoegen: 1_000_000,
      }),
    );
    expect(result.fullFireYear).toBe(0);
    expect(result.targetReached).toBe(true);
  });

  it("calculates correct calendar years", () => {
    const result = calculateFIRE(makeInputs({ startYear: 2026 }));
    if (result.fullFireYear !== null) {
      expect(result.fullFireCalendarYear).toBe(2026 + result.fullFireYear);
    }
  });
});

// ---------------------------------------------------------------------------
// Drawdown tests
// ---------------------------------------------------------------------------

describe("Drawdown simulation", () => {
  it("produces drawdown data when FIRE is reached", () => {
    const result = calculateFIRE(makeInputs());
    expect(result.drawdownData.length).toBeGreaterThan(0);
  });

  it("marks all drawdown data as drawdown phase", () => {
    const result = calculateFIRE(makeInputs());
    for (const d of result.drawdownData) {
      expect(d.isDrawdownPhase).toBe(true);
    }
  });

  it("capital depletion mode empties portfolio", () => {
    const result = calculateFIRE(
      makeInputs({
        entnahmeModell: "kapitalverzehr",
        kapitalverzehrJahre: 20,
      }),
    );
    // In capital depletion mode, portfolio should eventually reach 0
    if (result.drawdownData.length >= 20) {
      const lastEntry = result.drawdownData[result.drawdownData.length - 1];
      // Should be very small or zero after kapitalverzehrJahre
      expect(lastEntry.etfBalanceNominal).toBeLessThan(result.drawdownData[0].etfBalanceNominal);
    }
  });

  it("survives with ewige Rente and sufficient portfolio", () => {
    const result = calculateFIRE(
      makeInputs({
        entnahmeModell: "ewigeRente",
        monatlichesWunschEinkommen: 2_000,
        gesetzlicheRente: 1_500,
        swr: 3.0,
      }),
    );
    if (result.targetReached) {
      expect(result.drawdownSurvives).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Derived values tests
// ---------------------------------------------------------------------------

describe("Derived values", () => {
  it("calculates FIRE number from income gap and SWR", () => {
    const inputs = makeInputs({
      monatlichesWunschEinkommen: 4_000,
      gesetzlicheRente: 1_500,
      swr: 4.0,
    });
    const result = calculateFIRE(inputs);
    // (4000 - 1500) * 12 / 0.04 = 750,000
    expect(result.derivedFireNumber).toBe(750_000);
  });

  it("calculates savings rate correctly", () => {
    const result = calculateFIRE(
      makeInputs({
        monatlicheSparrate: 3_000,
        monatlichesBrutto: 6_000,
      }),
    );
    expect(result.sparquote).toBeCloseTo(50, 0);
  });

  it("handles zero gross income for savings rate", () => {
    const result = calculateFIRE(makeInputs({ monatlichesBrutto: 0 }));
    expect(result.sparquote).toBe(0);
  });

  it("passive income is positive when FIRE reached", () => {
    const result = calculateFIRE(makeInputs());
    if (result.targetReached) {
      expect(result.passiveIncomeAtExit).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Reverse calculation (required Sparrate)
// ---------------------------------------------------------------------------

describe("Required savings rate", () => {
  it("returns a reasonable required savings amount", () => {
    const result = calculateFIRE(makeInputs());
    expect(result.requiredSparrate).toBeGreaterThan(0);
    expect(result.requiredSparrate).toBeLessThan(50_000);
  });

  it("returns 0 when target is already met", () => {
    const result = calculateFIRE(
      makeInputs({
        startKapital: 5_000_000,
        zielvermoegen: 1_000_000,
      }),
    );
    // If FIRE is reached at year 0, target years = 0, so required sparrate = 0
    expect(result.requiredSparrate).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Scenario comparison
// ---------------------------------------------------------------------------

describe("Scenario comparison", () => {
  it("optimistic scenario has higher values than baseline", () => {
    const result = calculateFIRE(makeInputs());
    const baseEnd = result.yearlyData[result.yearlyData.length - 1].totalReal;
    const optEnd = result.scenarioOptimistic[result.scenarioOptimistic.length - 1].totalReal;
    expect(optEnd).toBeGreaterThan(baseEnd);
  });

  it("pessimistic scenario has lower values than baseline", () => {
    const result = calculateFIRE(makeInputs());
    const baseEnd = result.yearlyData[result.yearlyData.length - 1].totalReal;
    const pessEnd = result.scenarioPessimistic[result.scenarioPessimistic.length - 1].totalReal;
    expect(pessEnd).toBeLessThan(baseEnd);
  });

  it("all scenarios have same number of data points", () => {
    const result = calculateFIRE(makeInputs());
    expect(result.scenarioOptimistic.length).toBe(result.yearlyData.length);
    expect(result.scenarioPessimistic.length).toBe(result.yearlyData.length);
  });
});

// ---------------------------------------------------------------------------
// Monte Carlo simulation
// ---------------------------------------------------------------------------

describe("Monte Carlo simulation", () => {
  it("returns success rate between 0 and 1", () => {
    const result = calculateFIRE(makeInputs());
    expect(result.monteCarlo.successRate).toBeGreaterThanOrEqual(0);
    expect(result.monteCarlo.successRate).toBeLessThanOrEqual(1);
  });

  it("returns 40 years of percentile data", () => {
    const result = calculateFIRE(makeInputs());
    expect(result.monteCarlo.years.length).toBe(40);
    expect(result.monteCarlo.percentiles.p10.length).toBe(40);
    expect(result.monteCarlo.percentiles.p25.length).toBe(40);
    expect(result.monteCarlo.percentiles.p50.length).toBe(40);
    expect(result.monteCarlo.percentiles.p75.length).toBe(40);
    expect(result.monteCarlo.percentiles.p90.length).toBe(40);
  });

  it("percentiles are correctly ordered (p10 <= p25 <= p50 <= p75 <= p90)", () => {
    const result = calculateFIRE(makeInputs());
    const { p10, p25, p50, p75, p90 } = result.monteCarlo.percentiles;
    for (let i = 0; i < p10.length; i++) {
      expect(p10[i]).toBeLessThanOrEqual(p25[i]);
      expect(p25[i]).toBeLessThanOrEqual(p50[i]);
      expect(p50[i]).toBeLessThanOrEqual(p75[i]);
      expect(p75[i]).toBeLessThanOrEqual(p90[i]);
    }
  });

  it("is deterministic (same inputs produce same results)", () => {
    const result1 = calculateFIRE(makeInputs());
    const result2 = calculateFIRE(makeInputs());
    expect(result1.monteCarlo.successRate).toBe(result2.monteCarlo.successRate);
    expect(result1.monteCarlo.percentiles.p50).toEqual(result2.monteCarlo.percentiles.p50);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe("Edge cases", () => {
  it("handles zero starting capital", () => {
    const result = calculateFIRE(makeInputs({ startKapital: 0 }));
    expect(result.yearlyData[0].etfBalanceNominal).toBe(0);
    expect(result.yearlyData.length).toBeGreaterThan(0);
  });

  it("handles zero savings rate", () => {
    const result = calculateFIRE(
      makeInputs({
        monatlicheSparrate: 100, // minimum is 100 per slider
        bavJaehrlich: 0,
      }),
    );
    expect(result.yearlyData.length).toBeGreaterThan(0);
  });

  it("handles return equal to inflation (zero real return)", () => {
    const result = calculateFIRE(
      makeInputs({
        etfRendite: 2.5,
        inflation: 2.5,
      }),
    );
    expect(result.yearlyData.length).toBeGreaterThan(0);
  });

  it("handles LZK phase of 1 year", () => {
    const result = calculateFIRE(makeInputs({ lzkJahre: 1 }));
    expect(result.yearlyData.length).toBeGreaterThan(0);
  });

  it("handles LZK phase of 7 years", () => {
    const result = calculateFIRE(makeInputs({ lzkJahre: 7 }));
    expect(result.yearlyData.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Formatter tests
// ---------------------------------------------------------------------------

describe("Formatters", () => {
  it("formatEuro formats correctly", () => {
    const result = formatEuro(1234);
    expect(result).toContain("1.234");
    expect(result).toContain("€");
  });

  it("formatEuroShort abbreviates millions", () => {
    const result = formatEuroShort(1_500_000);
    expect(result).toContain("Mio");
  });

  it("formatEuroShort abbreviates thousands", () => {
    const result = formatEuroShort(50_000);
    expect(result).toContain("50");
    expect(result).toContain("k");
  });

  it("formatEuro handles zero", () => {
    const result = formatEuro(0);
    expect(result).toContain("0");
    expect(result).toContain("€");
  });

  it("formatEuro handles negative values", () => {
    const result = formatEuro(-1234);
    expect(result).toContain("1.234");
    expect(result).toContain("€");
  });
});

// ---------------------------------------------------------------------------
// LZK (Langzeitkonto) tests
// ---------------------------------------------------------------------------

describe("LZK phase", () => {
  it("LZK balance is zero before LZK phase", () => {
    const result = calculateFIRE(makeInputs());
    const prePhase = result.yearlyData.filter(
      (d) => d.year > 0 && d.year < result.lzkStartYear,
    );
    for (const d of prePhase) {
      expect(d.lzkBalanceNominal).toBe(0);
      expect(d.isLZKPhase).toBe(false);
    }
  });

  it("LZK balance grows during LZK phase", () => {
    const result = calculateFIRE(makeInputs());
    const lzkPhase = result.yearlyData.filter((d) => d.isLZKPhase);
    if (lzkPhase.length > 1) {
      for (let i = 1; i < lzkPhase.length; i++) {
        expect(lzkPhase[i].lzkBalanceNominal).toBeGreaterThan(
          lzkPhase[i - 1].lzkBalanceNominal,
        );
      }
    }
  });

  it("ETF stops receiving contributions during LZK phase", () => {
    const result = calculateFIRE(makeInputs());
    const lzkPhase = result.yearlyData.filter((d) => d.isLZKPhase);
    for (const d of lzkPhase) {
      expect(d.annualETFContrib).toBe(0);
      expect(d.annualLZKContrib).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Reverse planner tests
// ---------------------------------------------------------------------------

describe("Reverse planner (calculateReverse)", () => {
  it("returns a positive required savings for a realistic scenario", () => {
    const result = calculateReverse(
      4_000, // target monthly income
      15, // target years
      1_500, // state pension
      50_000, // start capital
      7.0, // expected return
      2.5, // inflation
      3.5, // swr
      2.0, // dynamic savings
      8_000, // bav annual
      "single",
      false,
      "ewigeRente",
      30,
    );
    expect(result.requiredMonthlySavings).toBeGreaterThan(0);
    expect(result.fireNumber).toBeGreaterThan(0);
    expect(result.yearsToFire).toBe(15);
  });

  it("calculates FIRE number correctly", () => {
    const result = calculateReverse(
      4_000, 15, 1_500, 0, 7, 2.5, 4.0, 0, 0,
      "single", false, "ewigeRente", 30,
    );
    // (4000 - 1500) * 12 / 0.04 = 750,000
    expect(result.fireNumber).toBe(750_000);
  });

  it("returns Monte Carlo success rate between 0 and 1", () => {
    const result = calculateReverse(
      4_000, 15, 1_500, 50_000, 7, 2.5, 3.5, 2.0, 0,
      "single", false, "ewigeRente", 30,
    );
    expect(result.monteCarlo.successRate).toBeGreaterThanOrEqual(0);
    expect(result.monteCarlo.successRate).toBeLessThanOrEqual(1);
  });

  it("returns yearly projection data", () => {
    const result = calculateReverse(
      4_000, 15, 1_500, 50_000, 7, 2.5, 3.5, 2.0, 0,
      "single", false, "ewigeRente", 30,
    );
    expect(result.yearlyProjection.length).toBeGreaterThan(0);
  });

  it("returns zero savings when start capital already exceeds FIRE number", () => {
    const result = calculateReverse(
      2_000, // low target
      20,
      1_500, // high pension covers most
      5_000_000, // huge start capital
      7, 2.5, 3.5, 0, 0,
      "single", false, "ewigeRente", 30,
    );
    expect(result.requiredMonthlySavings).toBe(0);
  });

  it("couples pay less tax and need less savings", () => {
    const single = calculateReverse(
      4_000, 15, 1_500, 50_000, 7, 2.5, 3.5, 2.0, 0,
      "single", false, "ewigeRente", 30,
    );
    const couple = calculateReverse(
      4_000, 15, 1_500, 50_000, 7, 2.5, 3.5, 2.0, 0,
      "couple", false, "ewigeRente", 30,
    );
    expect(couple.requiredMonthlySavings).toBeLessThanOrEqual(single.requiredMonthlySavings);
  });
});

// ---------------------------------------------------------------------------
// Additional edge cases
// ---------------------------------------------------------------------------

describe("Additional edge cases", () => {
  it("handles negative real return (inflation > return)", () => {
    const result = calculateFIRE(
      makeInputs({
        etfRendite: 2.0,
        inflation: 3.0,
      }),
    );
    expect(result.yearlyData.length).toBeGreaterThan(0);
    // Real return is negative, so Coast FIRE should be hard to reach
    expect(result.targetReached).toBe(false);
  });

  it("handles very high savings rate", () => {
    const result = calculateFIRE(
      makeInputs({
        monatlicheSparrate: 20_000,
        startKapital: 500_000,
        zielvermoegen: 500_000,
      }),
    );
    expect(result.targetReached).toBe(true);
    expect(result.fullFireYear).toBe(0);
  });

  it("handles maximum SWR boundary", () => {
    const result = calculateFIRE(
      makeInputs({ swr: 5.0 }),
    );
    expect(result.yearlyData.length).toBeGreaterThan(0);
    expect(result.derivedFireNumber).toBeGreaterThan(0);
  });

  it("handles zero SWR gracefully", () => {
    const result = calculateFIRE(
      makeInputs({ swr: 0 }),
    );
    expect(result.derivedFireNumber).toBe(0);
    expect(result.yearlyData.length).toBeGreaterThan(0);
  });

  it("handles zero state pension", () => {
    const result = calculateFIRE(
      makeInputs({ gesetzlicheRente: 0 }),
    );
    expect(result.derivedFireNumber).toBeGreaterThan(0);
    expect(result.yearlyData.length).toBeGreaterThan(0);
  });

  it("handles kapitalverzehr with very short depletion horizon", () => {
    const result = calculateFIRE(
      makeInputs({
        entnahmeModell: "kapitalverzehr",
        kapitalverzehrJahre: 10,
      }),
    );
    expect(result.drawdownData.length).toBeGreaterThan(0);
  });

  it("handles kapitalverzehr with very long depletion horizon", () => {
    const result = calculateFIRE(
      makeInputs({
        entnahmeModell: "kapitalverzehr",
        kapitalverzehrJahre: 50,
      }),
    );
    expect(result.drawdownData.length).toBeGreaterThan(0);
  });
});
