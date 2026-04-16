// ---------------------------------------------------------------------------
// Monte Carlo simulations — drawdown and lifecycle
// ---------------------------------------------------------------------------

import type { FireInputs, MonteCarloResult, LifecycleMonteCarloResult } from "./types";
import {
  MC_SIMULATIONS,
  MC_DRAWDOWN_YEARS,
  MC_LIFECYCLE_SIMULATIONS,
  MC_TARGET_SUCCESS_RATE,
  TAX_RATE_BASE,
  TAX_RATE_KIST,
  MAX_YEARS,
} from "./constants";
import { calculateTax, makeTaxConfig } from "./tax";
import { lifeEventCashFlow, getSavingsRateOverride } from "./lifeEvents";
import { mulberry32, normalRandom, percentile } from "./helpers";
import { getTaxEngine } from "@/lib/tax";

// ---------------------------------------------------------------------------
// Monte Carlo drawdown simulation
// ---------------------------------------------------------------------------

export function simulateMonteCarlo(
  exitBalanceNominal: number,
  inputs: FireInputs,
  exitYear: number,
): MonteCarloResult {
  const {
    etfRendite,
    inflation,
    monatlichesWunschEinkommen,
    gesetzlicheRente,
    renteneintrittsalter,
    entnahmeModell,
    kapitalverzehrJahre,
    startYear,
    currentAge,
  } = inputs;

  // Expected return and volatility for drawdown phase
  const meanReturn = Math.max(0, etfRendite - 1) / 100; // conservative
  const stdDev = 0.15; // ~15% annual volatility (typical for diversified equity)
  const inf = inflation / 100;
  const monthlyGapFull = monatlichesWunschEinkommen;
  const monthlyGapWithPension = Math.max(0, monatlichesWunschEinkommen - gesetzlicheRente);
  const pensionAge = renteneintrittsalter ?? 67;

  const rng = mulberry32(42); // deterministic seed
  const balancesByYear: number[][] = Array.from(
    { length: MC_DRAWDOWN_YEARS },
    () => [],
  );
  let survivals = 0;

  for (let sim = 0; sim < MC_SIMULATIONS; sim++) {
    let balance = exitBalanceNominal;
    let survived = true;

    for (let y = 1; y <= MC_DRAWDOWN_YEARS; y++) {
      if (balance <= 0) {
        balancesByYear[y - 1].push(0);
        survived = false;
        continue;
      }

      // Stochastic return
      const annualReturn = meanReturn + stdDev * normalRandom(rng);
      const prevBalance = balance;
      balance *= 1 + annualReturn;
      const gains = balance - prevBalance;
      const tax = calculateTax(gains, inputs);
      balance -= tax;

      // Withdrawal
      let withdrawal: number;
      if (entnahmeModell === "kapitalverzehr") {
        const remaining = kapitalverzehrJahre - (y - 1);
        if (remaining <= 1) {
          withdrawal = balance;
        } else {
          const engine = getTaxEngine(inputs.taxCountry);
          const approxTaxDrag =
            (1 - engine.partialExemptionRate) *
            (inputs.taxCountry === "DE"
              ? (inputs.kirchensteuer ? TAX_RATE_KIST : TAX_RATE_BASE)
              : engine.calculateTax(1, makeTaxConfig(inputs)));
          const netReturn = annualReturn * (1 - approxTaxDrag);
          if (netReturn <= 0) {
            withdrawal = balance / remaining;
          } else {
            withdrawal =
              (balance * netReturn) /
              (1 - Math.pow(1 + netReturn, -remaining));
          }
        }
      } else {
        const age = currentAge + exitYear + y;
        const gap = age >= pensionAge ? monthlyGapWithPension : monthlyGapFull;
        withdrawal = gap * 12 * Math.pow(1 + inf, exitYear + y);
      }

      withdrawal = Math.min(withdrawal, balance);
      balance -= withdrawal;
      if (balance <= 0) balance = 0;

      const realFactor = Math.pow(1 + inf, exitYear + y);
      balancesByYear[y - 1].push(balance / realFactor);
    }

    if (survived && balance > 0) survivals++;
  }

  // Calculate percentiles
  const years: number[] = [];
  const p10: number[] = [];
  const p25: number[] = [];
  const p50: number[] = [];
  const p75: number[] = [];
  const p90: number[] = [];

  for (let y = 0; y < MC_DRAWDOWN_YEARS; y++) {
    years.push(startYear + exitYear + y + 1);
    const vals = balancesByYear[y];
    p10.push(Math.round(percentile(vals, 0.1)));
    p25.push(Math.round(percentile(vals, 0.25)));
    p50.push(Math.round(percentile(vals, 0.5)));
    p75.push(Math.round(percentile(vals, 0.75)));
    p90.push(Math.round(percentile(vals, 0.9)));
  }

  return {
    successRate: survivals / MC_SIMULATIONS,
    percentiles: { p10, p25, p50, p75, p90 },
    years,
  };
}

// ---------------------------------------------------------------------------
// Full lifecycle Monte Carlo (accumulation phase)
// ---------------------------------------------------------------------------

export function simulateLifecycleMonteCarlo(
  inputs: FireInputs,
): LifecycleMonteCarloResult {
  const {
    startKapital,
    monatlicheSparrate,
    dynamikSparrate,
    etfRendite,
    inflation,
    bavJaehrlich,
    zielvermoegen,
    startYear,
    lifeEvents,
  } = inputs;

  const meanReturn = etfRendite / 100;
  const stdDev = 0.15;
  const inf = inflation / 100;
  const dyn = dynamikSparrate / 100;

  const rng = mulberry32(123); // different seed from drawdown
  const fireYears: number[] = [];
  const balancesByYear: number[][] = Array.from(
    { length: MAX_YEARS },
    () => [],
  );

  for (let sim = 0; sim < MC_LIFECYCLE_SIMULATIONS; sim++) {
    let balance = startKapital;
    let fireYear: number | null = null;

    for (let y = 1; y <= MAX_YEARS; y++) {
      const override = getSavingsRateOverride(lifeEvents, startYear + y);
      const savings = override !== null ? override : monatlicheSparrate * Math.pow(1 + dyn, y - 1);
      const contrib = savings * 12 + bavJaehrlich;

      const annualReturn = meanReturn + stdDev * normalRandom(rng);
      const prev = balance;
      balance = (balance + contrib) * (1 + annualReturn);
      const gains = balance - prev - contrib;
      balance -= calculateTax(Math.max(0, gains), inputs);

      // Life events
      const eventCF = lifeEventCashFlow(lifeEvents, startYear + y, inf, startYear);
      balance += eventCF;
      balance = Math.max(0, balance);

      const realVal = balance / Math.pow(1 + inf, y);
      balancesByYear[y - 1].push(realVal);

      if (fireYear === null && realVal >= zielvermoegen) {
        fireYear = y;
      }
    }

    if (fireYear !== null) {
      fireYears.push(fireYear);
    }
  }

  // Percentiles for fire year
  const sortedYears = [...fireYears].sort((a, b) => a - b);
  const pctFire = (p: number): number | null => {
    if (sortedYears.length === 0) return null;
    const idx = Math.floor(p * (sortedYears.length - 1));
    return sortedYears[idx];
  };

  const accYears: number[] = [];
  const accP10: number[] = [];
  const accP25: number[] = [];
  const accP50: number[] = [];
  const accP75: number[] = [];
  const accP90: number[] = [];

  for (let y = 0; y < MAX_YEARS; y++) {
    accYears.push(startYear + y + 1);
    const vals = balancesByYear[y];
    accP10.push(Math.round(percentile(vals, 0.1)));
    accP25.push(Math.round(percentile(vals, 0.25)));
    accP50.push(Math.round(percentile(vals, 0.5)));
    accP75.push(Math.round(percentile(vals, 0.75)));
    accP90.push(Math.round(percentile(vals, 0.9)));
  }

  return {
    fireYearPercentiles: {
      p10: pctFire(0.1),
      p25: pctFire(0.25),
      p50: pctFire(0.5),
      p75: pctFire(0.75),
      p90: pctFire(0.9),
    },
    fireSuccessRate: fireYears.length / MC_LIFECYCLE_SIMULATIONS,
    accumulationPercentiles: {
      p10: accP10,
      p25: accP25,
      p50: accP50,
      p75: accP75,
      p90: accP90,
    },
    accumulationYears: accYears,
  };
}

// ---------------------------------------------------------------------------
// Monte Carlo–backed required savings rate (binary search for 75% success)
// ---------------------------------------------------------------------------

/**
 * Binary-search for a monthly savings rate so that ≥75% of Monte Carlo
 * accumulation simulations reach the FIRE number within `targetYears`.
 *
 * Returns { monthlySavings, successRate }.
 */
export function calculateMCRequiredSparrate(
  inputs: FireInputs,
  targetYears: number,
): { monthlySavings: number; successRate: number } {
  if (targetYears <= 0) {
    // No time to save — success depends on whether we already have enough
    const alreadyFire = inputs.startKapital >= inputs.zielvermoegen;
    return { monthlySavings: 0, successRate: alreadyFire ? 1 : 0 };
  }

  const {
    startKapital,
    dynamikSparrate,
    etfRendite,
    inflation,
    bavJaehrlich,
    zielvermoegen,
    startYear,
    lifeEvents,
  } = inputs;

  const meanReturn = etfRendite / 100;
  const stdDev = 0.15;
  const inf = inflation / 100;
  const dyn = dynamikSparrate / 100;

  /**
   * Run MC accumulation with a given monthly savings rate
   * and return the fraction of simulations that reach FIRE within targetYears.
   */
  function mcSuccessRate(monthlySavings: number): number {
    const rng = mulberry32(77); // fixed seed for determinism
    let successes = 0;

    for (let sim = 0; sim < MC_LIFECYCLE_SIMULATIONS; sim++) {
      let balance = startKapital;
      let reached = false;

      for (let y = 1; y <= targetYears; y++) {
        const override = getSavingsRateOverride(lifeEvents, startYear + y);
        const savings = override !== null ? override : monthlySavings * Math.pow(1 + dyn, y - 1);
        const contrib = savings * 12 + bavJaehrlich;

        const annualReturn = meanReturn + stdDev * normalRandom(rng);
        const prev = balance;
        balance = (balance + contrib) * (1 + annualReturn);
        const gains = balance - prev - contrib;
        balance -= calculateTax(Math.max(0, gains), inputs);

        const eventCF = lifeEventCashFlow(lifeEvents, startYear + y, inf, startYear);
        balance += eventCF;
        balance = Math.max(0, balance);

        const realVal = balance / Math.pow(1 + inf, y);
        if (realVal >= zielvermoegen) {
          reached = true;
          break;
        }
      }

      if (reached) successes++;
    }

    return successes / MC_LIFECYCLE_SIMULATIONS;
  }

  // Binary search: dynamic upper bound based on FIRE number and time horizon
  let lo = 0;
  let hi = Math.max(50_000, ((zielvermoegen - startKapital) / (targetYears * 12)) * 1.5);

  // 30 iterations → precision of ~hi/2^30 ≈ sub-euro for typical ranges
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (mcSuccessRate(mid) < MC_TARGET_SUCCESS_RATE) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const result = Math.round((lo + hi) / 2);
  return { monthlySavings: result, successRate: mcSuccessRate(result) };
}
