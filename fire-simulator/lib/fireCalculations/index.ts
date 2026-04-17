// ---------------------------------------------------------------------------
// FIRE Calculations — main entry point
// ---------------------------------------------------------------------------
// This module re-exports all types, constants, and functions from the
// sub-modules. The main orchestrator `calculateFIRE` lives here.
// ---------------------------------------------------------------------------

// Re-export types
export type {
  LifeEventType,
  LifeEvent,
  FireInputs,
  MonteCarloResult,
  YearDataPoint,
  LifecycleMonteCarloResult,
  FireResult,
  SensitivityRow,
  AgeSavingsRow,
  ReverseResult,
} from "./types";

// Re-export constants
export {
  MAX_YEARS,
  DRAWDOWN_YEARS,
  DRAWDOWN_RETURN_DEDUCTION,
  MC_SIMULATIONS,
  MC_DRAWDOWN_YEARS,
  MC_LIFECYCLE_SIMULATIONS,
  MC_TARGET_SUCCESS_RATE,
} from "./constants";

// Re-export sub-module functions
export { simulateAccumulation, simulateNoInvestment } from "./accumulation";
export { simulateDrawdown } from "./drawdown";
export { simulateMonteCarlo, simulateLifecycleMonteCarlo, calculateMCRequiredSparrate } from "./monteCarlo";
export { calculateRequiredSparrate, calculateReverse, calculateAgeSavingsAnalysis } from "./reverse";
export { lifeEventCashFlow, getSavingsRateOverride } from "./lifeEvents";
export { calculateTax, makeTaxConfig } from "./tax";

// ---------------------------------------------------------------------------
// Imports for calculateFIRE
// ---------------------------------------------------------------------------

import type { FireInputs, FireResult } from "./types";
import { MAX_YEARS } from "./constants";
import { calculateTax } from "./tax";
import { lifeEventCashFlow, getSavingsRateOverride } from "./lifeEvents";
import { makeYearZero } from "./helpers";
import { simulateAccumulation, simulateNoInvestment } from "./accumulation";
import { simulateDrawdown } from "./drawdown";
import { simulateMonteCarlo, simulateLifecycleMonteCarlo } from "./monteCarlo";
import { calculateRequiredSparrate } from "./reverse";

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

export function formatEuro(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatEuroShort(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Mio. €`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString("de-DE", { maximumFractionDigits: 0 })}k €`;
  }
  return formatEuro(value);
}

// ---------------------------------------------------------------------------
// Main calculation
// ---------------------------------------------------------------------------

export function calculateFIRE(inputs: FireInputs): FireResult {
  const {
    startKapital,
    monatlicheSparrate,
    dynamikSparrate,
    etfRendite,
    inflation,
    bavJaehrlich,
    zielvermoegen,
    startYear,
    currentAge,
    monatlichesWunschEinkommen,
    swr,
    monatlichesNetto,
    lifeEvents,
    arbeitszeitkontoEnabled,
    stundenProJahr,
    wochenStunden,
  } = inputs;

  const roi = etfRendite / 100;
  const inf = inflation / 100;
  const dyn = dynamikSparrate / 100;
  const swrDecimal = swr / 100;
  const realReturn = (1 + roi) / (1 + inf) - 1;

  // Arbeitszeitkonto: hours → years conversion
  const annualWorkHours = wochenStunden * 52;

  // Derived FIRE number: accounts for full withdrawal before pension age
  // The binding constraint is the pre-pension period where no state pension is received
  const monthlyGapFull = monatlichesWunschEinkommen;
  const derivedFireNumber =
    swrDecimal > 0 ? (monthlyGapFull * 12) / swrDecimal : 0;

  // -----------------------------------------------------------------------
  // Pass 1: estimate FIRE year (without AZK effects, for Coast FIRE anchor)
  // -----------------------------------------------------------------------
  let etfBal = startKapital;
  let estimatedFireYear = MAX_YEARS;
  for (let y = 1; y <= MAX_YEARS; y++) {
    const override = getSavingsRateOverride(lifeEvents, startYear + y);
    const savings = override !== null ? override : monatlicheSparrate * Math.pow(1 + dyn, y - 1);
    const contrib = savings * 12 + bavJaehrlich;
    const prev = etfBal;
    etfBal = (etfBal + contrib) * (1 + roi);
    const gains = etfBal - prev - contrib;
    etfBal -= calculateTax(gains, inputs);
    const eventCF = lifeEventCashFlow(lifeEvents, startYear + y, inf, startYear);
    etfBal += eventCF;
    etfBal = Math.max(0, etfBal);
    const realVal = etfBal / Math.pow(1 + inf, y);
    if (realVal >= zielvermoegen) {
      estimatedFireYear = y;
      break;
    }
  }

  // Legacy LZK start year (used for backward compatibility with non-AZK mode)
  const lzkStartYear = arbeitszeitkontoEnabled
    ? estimatedFireYear // when AZK is on, lzkStartYear is set to wherever Coast FIRE triggers it
    : Math.max(1, estimatedFireYear - inputs.lzkJahre);

  // -----------------------------------------------------------------------
  // Pass 2: full simulation with Arbeitszeitkonto model
  // -----------------------------------------------------------------------
  etfBal = startKapital;
  const yearlyData: import("./types").YearDataPoint[] = [];
  let totalTaxPaid = 0;
  let totalGains = 0;
  let accumulatedHours = 0;
  let remainingFreistellungYears = 0;
  let freistellungStartYear: number | null = null;
  let freistellungEndYear: number | null = null;

  yearlyData.push(makeYearZero(startKapital, monatlicheSparrate, startYear, currentAge));

  let coastFireYear: number | null = null;
  let fullFireYear: number | null = null;

  // Check year-0 Coast FIRE
  const coastThreshold0 =
    estimatedFireYear > 0
      ? zielvermoegen / Math.pow(1 + realReturn, estimatedFireYear)
      : zielvermoegen;
  if (startKapital >= coastThreshold0) coastFireYear = 0;
  if (startKapital >= zielvermoegen) fullFireYear = 0;

  // Track actual lzk start year for the result
  let effectiveLzkStartYear = lzkStartYear;

  for (let y = 1; y <= MAX_YEARS; y++) {
    const override = getSavingsRateOverride(lifeEvents, startYear + y);
    const savings = override !== null ? override : monatlicheSparrate * Math.pow(1 + dyn, y - 1);
    const contrib = savings * 12 + bavJaehrlich;
    const realFactor = Math.pow(1 + inf, y);

    // Determine phase for this year
    let isFreistellung = false;
    let isCoast = false;
    let isLZK = false;

    if (arbeitszeitkontoEnabled) {
      // AZK model: phases based on Coast FIRE + accumulated hours
      if (coastFireYear !== null && fullFireYear === null) {
        // We've reached Coast FIRE but not Full FIRE yet
        if (remainingFreistellungYears > 0) {
          isFreistellung = true;
          isLZK = true;
          remainingFreistellungYears = Math.max(0, remainingFreistellungYears - 1);
        } else if (freistellungStartYear !== null) {
          // Freistellung hours exhausted, now coasting
          isCoast = true;
          isLZK = true;
        }
      }
      // Accumulate hours during normal working phase (before Coast FIRE)
      if (coastFireYear === null) {
        accumulatedHours += stundenProJahr;
      }
    } else {
      // Legacy LZK model: mark last lzkJahre years before FIRE as sabbatical
      isLZK = y >= effectiveLzkStartYear;
    }

    // ETF growth & contributions
    const prevEtf = etfBal;
    if (isFreistellung || isCoast) {
      // No new contributions during Freistellung or Coasting
      etfBal = etfBal * (1 + roi);
    } else {
      // Normal accumulation
      etfBal = (etfBal + contrib) * (1 + roi);
    }
    const etfGains = etfBal - prevEtf - ((isFreistellung || isCoast) ? 0 : contrib);
    const etfTax = calculateTax(etfGains, inputs);
    etfBal -= etfTax;

    const yearGains = etfGains;
    const yearTax = etfTax;

    totalTaxPaid += yearTax;
    totalGains += yearGains;

    // Apply life events cash-flow to ETF balance
    const eventCF = lifeEventCashFlow(lifeEvents, startYear + y, inf, startYear);
    etfBal += eventCF;
    etfBal = Math.max(0, etfBal);

    const etfReal = etfBal / realFactor;
    const totalReal = etfReal;
    const effectiveContrib = (isFreistellung || isCoast) ? 0 : contrib;
    const effectiveMonthlySavings = (isFreistellung || isCoast) ? 0 : savings;

    yearlyData.push({
      year: y,
      calendarYear: startYear + y,
      age: currentAge + y,
      etfBalanceNominal: etfBal,
      etfBalanceReal: etfReal,
      lzkBalanceNominal: 0,
      lzkBalanceReal: 0,
      totalReal,
      annualETFContrib: effectiveContrib,
      annualLZKContrib: 0,
      monthlySavings: effectiveMonthlySavings,
      isLZKPhase: isLZK,
      taxPaid: yearTax,
      annualGains: yearGains,
      isDrawdownPhase: false,
      annualWithdrawal: 0,
      stundenGuthaben: accumulatedHours,
      isFreistellungsPhase: isFreistellung,
      isCoastPhase: isCoast,
    });

    // Dynamic Coast FIRE
    if (coastFireYear === null) {
      const yearsRemaining = Math.max(0, estimatedFireYear - y);
      const coastThreshold =
        yearsRemaining > 0
          ? zielvermoegen / Math.pow(1 + realReturn, yearsRemaining)
          : zielvermoegen;
      if (totalReal >= coastThreshold) {
        coastFireYear = y;
        // Trigger Freistellung when AZK is enabled
        if (arbeitszeitkontoEnabled && accumulatedHours > 0 && annualWorkHours > 0) {
          remainingFreistellungYears = accumulatedHours / annualWorkHours;
          freistellungStartYear = y + 1; // starts next year
          freistellungEndYear = y + Math.ceil(remainingFreistellungYears);
          effectiveLzkStartYear = y + 1;
        }
      }
    }

    if (fullFireYear === null && totalReal >= zielvermoegen) fullFireYear = y;
  }

  // Coast FIRE amount at the year it was reached (or current threshold)
  let coastFireAmount: number;
  if (coastFireYear !== null) {
    const remaining = Math.max(0, estimatedFireYear - coastFireYear);
    coastFireAmount =
      remaining > 0
        ? zielvermoegen / Math.pow(1 + realReturn, remaining)
        : zielvermoegen;
  } else {
    coastFireAmount =
      zielvermoegen /
      Math.pow(1 + realReturn, Math.max(1, estimatedFireYear));
  }

  // Freistellung duration in years
  const totalFreistellungJahre = arbeitszeitkontoEnabled && annualWorkHours > 0
    ? (coastFireYear !== null
      ? (coastFireYear * stundenProJahr) / annualWorkHours
      : (estimatedFireYear * stundenProJahr) / annualWorkHours)
    : 0;

  // -----------------------------------------------------------------------
  // Exit values
  // -----------------------------------------------------------------------
  const exitIdx = fullFireYear !== null ? fullFireYear : MAX_YEARS;
  const exitData = yearlyData[exitIdx];
  const exitBalance = exitData?.totalReal ?? 0;
  const exitBalanceNominal = exitData
    ? exitData.etfBalanceNominal
    : 0;
  const passiveIncomeAtExit = (exitBalance * swrDecimal) / 12;

  // -----------------------------------------------------------------------
  // Derived metrics
  // -----------------------------------------------------------------------
  const effectiveTaxRate = totalGains > 0 ? totalTaxPaid / totalGains : 0;

  const sparquote =
    monatlichesNetto > 0
      ? (monatlicheSparrate / monatlichesNetto) * 100
      : 0;

  const targetYears = fullFireYear !== null ? fullFireYear : MAX_YEARS;
  const requiredSparrate = calculateRequiredSparrate(inputs, targetYears);

  // -----------------------------------------------------------------------
  // Drawdown phase
  // -----------------------------------------------------------------------
  const drawdownResult = simulateDrawdown(exitBalanceNominal, inputs, exitIdx);

  // -----------------------------------------------------------------------
  // Monte Carlo simulation
  // -----------------------------------------------------------------------
  const monteCarlo = simulateMonteCarlo(exitBalanceNominal, inputs, exitIdx);

  // -----------------------------------------------------------------------
  // Full lifecycle Monte Carlo
  // -----------------------------------------------------------------------
  const lifecycleMonteCarlo = simulateLifecycleMonteCarlo(inputs);

  // -----------------------------------------------------------------------
  // Scenario comparison (+/- 2 %)
  // -----------------------------------------------------------------------
  const scenarioOptimistic = simulateAccumulation(inputs, 2);
  const scenarioPessimistic = simulateAccumulation(inputs, -2);

  // -----------------------------------------------------------------------
  // No-investment comparison
  // -----------------------------------------------------------------------
  const noInvestmentData = simulateNoInvestment(inputs);

  // -----------------------------------------------------------------------
  // Return
  // -----------------------------------------------------------------------
  return {
    yearlyData,
    coastFireYear,
    fullFireYear,
    coastFireCalendarYear:
      coastFireYear !== null ? startYear + coastFireYear : null,
    fullFireCalendarYear:
      fullFireYear !== null ? startYear + fullFireYear : null,
    lzkStartYear: effectiveLzkStartYear,
    lzkStartCalendarYear: startYear + effectiveLzkStartYear,
    passiveIncomeAtExit,
    swRate: swr,
    targetReached: fullFireYear !== null,

    // Age-based milestones
    coastFireAge:
      coastFireYear !== null ? currentAge + coastFireYear : null,
    fullFireAge:
      fullFireYear !== null ? currentAge + fullFireYear : null,
    lzkSabbaticalStartAge: currentAge + effectiveLzkStartYear,

    // Freistellung milestones
    freistellungStartAge: freistellungStartYear !== null
      ? currentAge + freistellungStartYear
      : null,
    freistellungEndAge: freistellungEndYear !== null
      ? currentAge + freistellungEndYear
      : null,
    freistellungJahre: totalFreistellungJahre,

    drawdownData: drawdownResult.data,
    drawdownSurvives: drawdownResult.survives,
    drawdownDepletionYear: drawdownResult.depletionYear,

    coastFireAmount,
    requiredSparrate,
    sparquote,

    scenarioOptimistic,
    scenarioPessimistic,

    totalTaxPaid,
    effectiveTaxRate,
    derivedFireNumber,
    monteCarlo,
    lifecycleMonteCarlo,
    noInvestmentData,
  };
}
