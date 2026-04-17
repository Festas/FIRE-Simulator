// ---------------------------------------------------------------------------
// Reverse planner — calculate required savings to reach FIRE
// ---------------------------------------------------------------------------

import type {
  AgeSavingsRow,
  FireInputs,
  LifeEvent,
  ReverseResult,
  SensitivityRow,
  YearDataPoint,
} from "./types";
import {
  DRAWDOWN_RETURN_DEDUCTION,
  SENSITIVITY_MIN_RETURN,
  SENSITIVITY_MAX_RETURN,
  SENSITIVITY_STEP,
} from "./constants";
import { calculateTax } from "./tax";
import { lifeEventCashFlow, getSavingsRateOverride } from "./lifeEvents";
import { simulateAccumulation } from "./accumulation";
import { simulateDrawdown } from "./drawdown";
import { simulateMonteCarlo, simulateLifecycleMonteCarlo, calculateMCRequiredSparrate } from "./monteCarlo";
import type { TaxCountry } from "@/lib/tax";

// ---------------------------------------------------------------------------
// Binary-search for required monthly savings
// ---------------------------------------------------------------------------

export function calculateRequiredSparrate(
  inputs: FireInputs,
  targetYears: number,
): number {
  if (targetYears <= 0) return 0;

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

  const roi = etfRendite / 100;
  const inf = inflation / 100;
  const dyn = dynamikSparrate / 100;

  function finalRealValue(monthlySavings: number): number {
    let bal = startKapital;
    for (let y = 1; y <= targetYears; y++) {
      const override = getSavingsRateOverride(lifeEvents, startYear + y);
      const savings = override !== null ? override : monthlySavings * Math.pow(1 + dyn, y - 1);
      const contrib = savings * 12 + bavJaehrlich;
      const prev = bal;
      bal = (bal + contrib) * (1 + roi);
      const gains = bal - prev - contrib;
      bal -= calculateTax(gains, inputs);
      // Life events impact
      const eventCF = lifeEventCashFlow(lifeEvents, startYear + y, inf, startYear);
      bal += eventCF;
      bal = Math.max(0, bal);
    }
    return bal / Math.pow(1 + inf, targetYears);
  }

  let lo = 0;
  let hi = 50_000;

  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (finalRealValue(mid) < zielvermoegen) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return Math.round((lo + hi) / 2);
}

// ---------------------------------------------------------------------------
// Reverse planner entry point
// ---------------------------------------------------------------------------

export function calculateReverse(
  targetMonthlyIncome: number,
  targetYears: number,
  statePension: number,
  startCapital: number,
  expectedReturn: number,
  inflation: number,
  swr: number,
  dynamicSavings: number,
  bavAnnual: number,
  steuerModell: "single" | "couple",
  kirchensteuer: boolean,
  entnahmeModell: "ewigeRente" | "kapitalverzehr",
  kapitalverzehrJahre: number,
  taxCountry: TaxCountry = "DE",
  lifeEvents: LifeEvent[] = [],
  currentMonthlySavings: number = 0,
  monatlichesNetto: number = 0,
  currentAge: number = 30,
  renteneintrittsalter: number = 67,
): ReverseResult {
  const monthlyGapFull = targetMonthlyIncome;
  const monthlyGap = Math.max(0, targetMonthlyIncome - statePension);
  const swrDecimal = swr / 100;
  const inf = inflation / 100;

  // Better FIRE number for kapitalverzehr mode (present-value-of-annuity)
  // Use full income (no pension offset) since we need to cover pre-pension years
  let fireNumber: number;
  if (entnahmeModell === "kapitalverzehr" && kapitalverzehrJahre > 0 && swrDecimal > 0) {
    // Use a conservative return (−1 pp) for drawdown, matching simulateDrawdown/simulateMonteCarlo
    const conservativeReturn = Math.max(0, expectedReturn - DRAWDOWN_RETURN_DEDUCTION) / 100;
    const realReturn = (1 + conservativeReturn) / (1 + inf) - 1;
    const annualNeed = monthlyGapFull * 12;
    if (realReturn <= 0) {
      fireNumber = annualNeed * kapitalverzehrJahre;
    } else {
      fireNumber = annualNeed * (1 - Math.pow(1 + realReturn, -kapitalverzehrJahre)) / realReturn;
    }
  } else {
    fireNumber = swrDecimal > 0 ? (monthlyGapFull * 12) / swrDecimal : 0;
  }

  const inputs: FireInputs = {
    startKapital: startCapital,
    monatlicheSparrate: 0,
    dynamikSparrate: dynamicSavings,
    etfRendite: expectedReturn,
    inflation,
    bavJaehrlich: bavAnnual,
    zielvermoegen: fireNumber,
    zielvermoegenOverride: false,
    lzkJahre: 3,
    lzkRendite: 3.5,
    startYear: new Date().getFullYear(),
    currentAge,
    monatlichesWunschEinkommen: targetMonthlyIncome,
    gesetzlicheRente: statePension,
    renteneintrittsalter,
    swr,
    steuerModell,
    kirchensteuer,
    entnahmeModell,
    kapitalverzehrJahre,
    monatlichesNetto,
    taxCountry,
    lifeEvents,
    arbeitszeitkontoEnabled: false,
    stundenProJahr: 0,
    wochenStunden: 40,
  };

  const requiredMonthlySavings = calculateRequiredSparrate(inputs, targetYears);

  // Generate projection with the required savings
  const projectionInputs = { ...inputs, monatlicheSparrate: requiredMonthlySavings };
  const yearlyProjection = simulateAccumulation(projectionInputs, 0);

  // Scenario bands (±2% return)
  const scenarioOptimistic = simulateAccumulation(projectionInputs, 2);
  const scenarioPessimistic = simulateAccumulation(projectionInputs, -2);

  // Exit balance at target year
  const exitIdx = Math.min(targetYears, yearlyProjection.length - 1);
  const exitData = yearlyProjection[exitIdx];
  const exitBalanceNominal = exitData ? exitData.etfBalanceNominal : 0;

  // Monte Carlo drawdown simulation (full percentile data)
  const monteCarlo = simulateMonteCarlo(exitBalanceNominal, projectionInputs, targetYears);

  // Deterministic drawdown simulation
  const drawdownResult = simulateDrawdown(exitBalanceNominal, projectionInputs, targetYears);

  // Total tax paid during accumulation
  let totalTaxPaid = 0;
  for (let i = 1; i <= exitIdx && i < yearlyProjection.length; i++) {
    totalTaxPaid += yearlyProjection[i].taxPaid;
  }

  // Passive income at FIRE
  const exitBalanceReal = exitData?.totalReal ?? 0;
  const passiveIncomeAtFire = (exitBalanceReal * swrDecimal) / 12;

  // Coast FIRE year — when you could stop saving and coast to FIRE number
  const realReturn = (1 + expectedReturn / 100) / (1 + inf) - 1;
  let coastFireYear: number | null = null;
  for (let i = 1; i <= exitIdx && i < yearlyProjection.length; i++) {
    const yearsRemaining = targetYears - i;
    if (yearsRemaining <= 0) break;
    const coastThreshold = fireNumber / Math.pow(1 + realReturn, yearsRemaining);
    if (yearlyProjection[i].totalReal >= coastThreshold) {
      coastFireYear = i;
      break;
    }
  }

  // Current savings projection (if user has a current savings rate)
  let currentProjection: YearDataPoint[] | null = null;
  if (currentMonthlySavings > 0 && currentMonthlySavings !== requiredMonthlySavings) {
    const currentInputs = { ...inputs, monatlicheSparrate: currentMonthlySavings };
    currentProjection = simulateAccumulation(currentInputs, 0);
  }

  // Sensitivity analysis — vary return rate
  const sensitivity: SensitivityRow[] = [];
  for (let r = SENSITIVITY_MIN_RETURN; r <= SENSITIVITY_MAX_RETURN; r += SENSITIVITY_STEP) {
    const sensInputs = { ...inputs, etfRendite: r };
    // Recalculate FIRE number for this return rate
    let sensFireNumber: number;
    if (entnahmeModell === "kapitalverzehr" && kapitalverzehrJahre > 0) {
      const sensConservativeReturn = Math.max(0, r - DRAWDOWN_RETURN_DEDUCTION) / 100;
      const sensRealReturn = (1 + sensConservativeReturn) / (1 + inf) - 1;
      const annualNeed = monthlyGap * 12;
      if (sensRealReturn <= 0) {
        sensFireNumber = annualNeed * kapitalverzehrJahre;
      } else {
        sensFireNumber = annualNeed * (1 - Math.pow(1 + sensRealReturn, -kapitalverzehrJahre)) / sensRealReturn;
      }
    } else {
      sensFireNumber = swrDecimal > 0 ? (monthlyGap * 12) / swrDecimal : 0;
    }
    sensInputs.zielvermoegen = sensFireNumber;
    const sensSavings = calculateRequiredSparrate(sensInputs, targetYears);
    sensitivity.push({ returnRate: r, requiredSavings: sensSavings, fireNumber: sensFireNumber });
  }

  // Monte Carlo–backed recommended savings rate (75th percentile)
  const mcResult = calculateMCRequiredSparrate(inputs, targetYears);

  // Accumulation Monte Carlo with the MC-recommended savings
  const mcProjectionInputs = { ...inputs, monatlicheSparrate: mcResult.monthlySavings };
  const accumulationMonteCarlo = simulateLifecycleMonteCarlo(mcProjectionInputs);

  return {
    requiredMonthlySavings,
    fireNumber,
    yearsToFire: targetYears,
    monteCarlo,
    yearlyProjection,
    scenarioOptimistic,
    scenarioPessimistic,
    drawdownData: drawdownResult.data,
    drawdownSurvives: drawdownResult.survives,
    drawdownDepletionYear: drawdownResult.depletionYear,
    totalTaxPaid,
    passiveIncomeAtFire,
    coastFireYear,
    currentProjection,
    sensitivity,
    mcRecommendedSavings: mcResult.monthlySavings,
    mcSuccessRate: mcResult.successRate,
    accumulationMonteCarlo,
  };
}

// ---------------------------------------------------------------------------
// Age-based savings analysis — MC-simulated savings for each exit age
// ---------------------------------------------------------------------------

/**
 * For each exit age in range [minAge, maxAge], calculate the MC-recommended
 * monthly savings rate and deterministic savings needed to reach FIRE.
 *
 * Failproof: clamps inputs, handles edge cases (already FIRE, impossible goals),
 * and never throws.
 */
export function calculateAgeSavingsAnalysis(
  targetMonthlyIncome: number,
  statePension: number,
  startCapital: number,
  expectedReturn: number,
  inflation: number,
  swr: number,
  dynamicSavings: number,
  bavAnnual: number,
  steuerModell: "single" | "couple",
  kirchensteuer: boolean,
  entnahmeModell: "ewigeRente" | "kapitalverzehr",
  kapitalverzehrJahre: number,
  taxCountry: TaxCountry = "DE",
  lifeEvents: LifeEvent[] = [],
  currentAge: number = 30,
  renteneintrittsalter: number = 67,
  minAge?: number,
  maxAge?: number,
  ageStep: number = 1,
): AgeSavingsRow[] {
  const rows: AgeSavingsRow[] = [];

  // Clamp inputs to safe ranges
  const safeCurrentAge = Math.max(18, Math.min(80, Math.round(currentAge)));
  const effectiveMinAge = Math.max(safeCurrentAge + 5, Math.round(minAge ?? safeCurrentAge + 5));
  const effectiveMaxAge = Math.min(safeCurrentAge + 45, Math.round(maxAge ?? safeCurrentAge + 40));
  const safeStep = Math.max(1, Math.min(10, Math.round(ageStep)));
  const swrDecimal = swr / 100;
  const inf = inflation / 100;

  if (effectiveMinAge > effectiveMaxAge) return rows;

  const monthlyGapFull = targetMonthlyIncome;

  for (let exitAge = effectiveMinAge; exitAge <= effectiveMaxAge; exitAge += safeStep) {
    const targetYears = exitAge - safeCurrentAge;
    if (targetYears <= 0) continue;

    try {
      // Calculate FIRE number for this time horizon
      let fireNumber: number;
      if (entnahmeModell === "kapitalverzehr" && kapitalverzehrJahre > 0 && swrDecimal > 0) {
        const conservativeReturn = Math.max(0, expectedReturn - DRAWDOWN_RETURN_DEDUCTION) / 100;
        const realReturn = (1 + conservativeReturn) / (1 + inf) - 1;
        const annualNeed = monthlyGapFull * 12;
        if (realReturn <= 0) {
          fireNumber = annualNeed * kapitalverzehrJahre;
        } else {
          fireNumber = annualNeed * (1 - Math.pow(1 + realReturn, -kapitalverzehrJahre)) / realReturn;
        }
      } else {
        fireNumber = swrDecimal > 0 ? (monthlyGapFull * 12) / swrDecimal : 0;
      }

      if (fireNumber <= 0) {
        rows.push({
          exitAge,
          targetYears,
          mcSavings: 0,
          mcSuccessRate: 1,
          deterministicSavings: 0,
          fireNumber: 0,
        });
        continue;
      }

      // Build inputs for this horizon
      const inputs: FireInputs = {
        startKapital: startCapital,
        monatlicheSparrate: 0,
        dynamikSparrate: dynamicSavings,
        etfRendite: expectedReturn,
        inflation,
        bavJaehrlich: bavAnnual,
        zielvermoegen: fireNumber,
        zielvermoegenOverride: false,
        lzkJahre: 3,
        lzkRendite: 3.5,
        startYear: new Date().getFullYear(),
        currentAge: safeCurrentAge,
        monatlichesWunschEinkommen: targetMonthlyIncome,
        gesetzlicheRente: statePension,
        renteneintrittsalter,
        swr,
        steuerModell,
        kirchensteuer,
        entnahmeModell,
        kapitalverzehrJahre,
        monatlichesNetto: 0,
        taxCountry,
        lifeEvents,
        arbeitszeitkontoEnabled: false,
        stundenProJahr: 0,
        wochenStunden: 40,
      };

      // Deterministic savings
      const detSavings = calculateRequiredSparrate(inputs, targetYears);

      // MC-backed savings
      const mcResult = calculateMCRequiredSparrate(inputs, targetYears);

      rows.push({
        exitAge,
        targetYears,
        mcSavings: Math.max(0, mcResult.monthlySavings),
        mcSuccessRate: mcResult.successRate,
        deterministicSavings: Math.max(0, detSavings),
        fireNumber: Math.round(fireNumber),
      });
    } catch {
      // Failproof: on any error, push a fallback row
      rows.push({
        exitAge,
        targetYears,
        mcSavings: 0,
        mcSuccessRate: 0,
        deterministicSavings: 0,
        fireNumber: 0,
      });
    }
  }

  return rows;
}
