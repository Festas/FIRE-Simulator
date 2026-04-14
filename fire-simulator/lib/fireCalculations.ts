// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { getTaxEngine, type TaxCountry, type TaxConfig } from "@/lib/tax";

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

/** Life event types for cash-flow timeline modelling */
export type LifeEventType =
  | "home_purchase"
  | "child"
  | "career_change"
  | "inheritance"
  | "pension_start"
  | "healthcare"
  | "one_time_expense"
  | "one_time_income"
  | "side_income";

export interface LifeEvent {
  id: string;
  type: LifeEventType;
  name: string;
  /** Calendar year the event starts */
  startYear: number;
  /** Calendar year the event ends (same as startYear for one-time) */
  endYear: number;
  /** Annual net cash-flow impact (negative = expense, positive = income) */
  annualAmount: number;
  /** Whether the amount should be inflation-adjusted over time */
  inflationAdjusted: boolean;
}

export interface FireInputs {
  // Existing fields
  startKapital: number;
  monatlicheSparrate: number;
  dynamikSparrate: number;
  etfRendite: number;
  inflation: number;
  bavJaehrlich: number;
  zielvermoegen: number;
  lzkJahre: number;
  lzkRendite: number;
  startYear: number;

  // Retirement income
  monatlichesWunschEinkommen: number; // desired monthly income in retirement
  gesetzlicheRente: number; // expected monthly state pension

  // Safe withdrawal rate (percent, e.g. 3.5)
  swr: number;

  // Tax settings
  steuerModell: "single" | "couple"; // 1 000 € vs 2 000 € Freibetrag
  kirchensteuer: boolean; // adds church-tax surcharge

  // Multi-country tax
  taxCountry: TaxCountry;

  // Withdrawal mode
  entnahmeModell: "ewigeRente" | "kapitalverzehr";
  kapitalverzehrJahre: number; // years to deplete (only for kapitalverzehr)

  // Net income for savings-rate display
  monatlichesNetto: number;

  // Life events timeline
  lifeEvents: LifeEvent[];
}

export interface MonteCarloResult {
  successRate: number; // 0–1 probability portfolio survives
  percentiles: {
    p10: number[];
    p25: number[];
    p50: number[];
    p75: number[];
    p90: number[];
  };
  years: number[]; // calendar years for each index
}

export interface YearDataPoint {
  year: number;
  calendarYear: number;
  etfBalanceNominal: number;
  etfBalanceReal: number;
  lzkBalanceNominal: number;
  lzkBalanceReal: number;
  totalReal: number;
  annualETFContrib: number;
  annualLZKContrib: number;
  monthlySavings: number;
  isLZKPhase: boolean;

  taxPaid: number;
  annualGains: number;
  isDrawdownPhase: boolean;
  annualWithdrawal: number;
}

export interface LifecycleMonteCarloResult {
  /** Confidence intervals for the year FIRE is reached */
  fireYearPercentiles: {
    p10: number | null;
    p25: number | null;
    p50: number | null;
    p75: number | null;
    p90: number | null;
  };
  /** Percentage of simulations that reach FIRE within MAX_YEARS */
  fireSuccessRate: number;
  /** Percentile bands for portfolio value during accumulation */
  accumulationPercentiles: {
    p10: number[];
    p25: number[];
    p50: number[];
    p75: number[];
    p90: number[];
  };
  accumulationYears: number[]; // calendar years
}

export interface FireResult {
  // Existing fields
  yearlyData: YearDataPoint[];
  coastFireYear: number | null;
  fullFireYear: number | null;
  coastFireCalendarYear: number | null;
  fullFireCalendarYear: number | null;
  lzkStartYear: number;
  lzkStartCalendarYear: number;
  passiveIncomeAtExit: number;
  swRate: number;
  targetReached: boolean;

  // Drawdown
  drawdownData: YearDataPoint[];
  drawdownSurvives: boolean;
  drawdownDepletionYear: number | null;

  // Dynamic Coast FIRE threshold
  coastFireAmount: number;

  // Reverse calculation
  requiredSparrate: number;

  // Savings rate as % of net income
  sparquote: number;

  // Scenario comparison
  scenarioOptimistic: YearDataPoint[]; // +2 % return
  scenarioPessimistic: YearDataPoint[]; // −2 % return

  // Tax totals
  totalTaxPaid: number;
  effectiveTaxRate: number;

  // Derived FIRE number from desired income
  derivedFireNumber: number;

  // Monte Carlo simulation (drawdown)
  monteCarlo: MonteCarloResult;

  // Full lifecycle Monte Carlo
  lifecycleMonteCarlo: LifecycleMonteCarloResult;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_YEARS = 50;
const DRAWDOWN_YEARS = 40;

// Drawdown return deduction (percentage points) — conservative allocation assumption
const DRAWDOWN_RETURN_DEDUCTION = 1;

// Sensitivity analysis range for reverse planner
const SENSITIVITY_MIN_RETURN = 4;
const SENSITIVITY_MAX_RETURN = 10;
const SENSITIVITY_STEP = 1;

// Legacy constants for backward compatibility
const TAX_RATE_BASE = 0.26375;
const TAX_RATE_KIST = 0.2782;

// ---------------------------------------------------------------------------
// Tax helper — delegates to pluggable tax engine
// ---------------------------------------------------------------------------

function makeTaxConfig(inputs: FireInputs): TaxConfig {
  return {
    country: inputs.taxCountry,
    filingStatus: inputs.steuerModell,
    kirchensteuer: inputs.kirchensteuer,
    annualIncome: inputs.monatlichesNetto * 12,
  };
}

function calculateTax(gains: number, inputs: FireInputs): number {
  const engine = getTaxEngine(inputs.taxCountry);
  return engine.calculateTax(gains, makeTaxConfig(inputs));
}

// ---------------------------------------------------------------------------
// Life events helper — net cash-flow impact for a given calendar year
// ---------------------------------------------------------------------------

function lifeEventCashFlow(
  events: LifeEvent[],
  calendarYear: number,
  inflationRate: number,
  simStartYear: number,
): number {
  let total = 0;
  for (const evt of events) {
    if (calendarYear < evt.startYear || calendarYear > evt.endYear) continue;
    let amount = evt.annualAmount;
    if (evt.inflationAdjusted) {
      const yearsElapsed = calendarYear - simStartYear;
      amount *= Math.pow(1 + inflationRate, yearsElapsed);
    }
    total += amount;
  }
  return total;
}

// ---------------------------------------------------------------------------
// Simplified accumulation for scenario comparison
// ---------------------------------------------------------------------------

function simulateAccumulation(
  inputs: FireInputs,
  returnOffset: number,
): YearDataPoint[] {
  const {
    startKapital,
    monatlicheSparrate,
    dynamikSparrate,
    etfRendite,
    inflation,
    bavJaehrlich,
    lzkJahre,
    lzkRendite,
    zielvermoegen,
    startYear,
    lifeEvents,
  } = inputs;

  const roi = (etfRendite + returnOffset) / 100;
  const inf = inflation / 100;
  const dyn = dynamikSparrate / 100;
  const lzkRoi = lzkRendite / 100;

  // Pass 1: estimate FIRE year (with offset return) to determine LZK start
  let tempBal = startKapital;
  let estimatedFireYear = MAX_YEARS;
  for (let y = 1; y <= MAX_YEARS; y++) {
    const savings = monatlicheSparrate * Math.pow(1 + dyn, y - 1);
    const contrib = savings * 12 + bavJaehrlich;
    const prev = tempBal;
    tempBal = (tempBal + contrib) * (1 + roi);
    const gains = tempBal - prev - contrib;
    tempBal -= calculateTax(gains, inputs);
    // Life events impact
    const eventCF = lifeEventCashFlow(lifeEvents, startYear + y, inf, startYear);
    tempBal += eventCF;
    tempBal = Math.max(0, tempBal);
    const realVal = tempBal / Math.pow(1 + inf, y);
    if (realVal >= zielvermoegen) {
      estimatedFireYear = y;
      break;
    }
  }

  const lzkStartYear = Math.max(1, estimatedFireYear - lzkJahre);

  // Pass 2: full simulation with LZK
  let etfBal = startKapital;
  let lzkBal = 0;
  const data: YearDataPoint[] = [];

  data.push(makeYearZero(startKapital, monatlicheSparrate, startYear));

  for (let y = 1; y <= MAX_YEARS; y++) {
    const isLZKPhase = y >= lzkStartYear;
    const savings = monatlicheSparrate * Math.pow(1 + dyn, y - 1);
    const contrib = savings * 12 + bavJaehrlich;
    const realFactor = Math.pow(1 + inf, y);

    let annualETFContrib = 0;
    let annualLZKContrib = 0;
    let yearGains = 0;
    let yearTax = 0;

    if (isLZKPhase) {
      const prevEtf = etfBal;
      etfBal *= 1 + roi;
      const etfGains = etfBal - prevEtf;
      const etfTax = calculateTax(etfGains, inputs);
      etfBal -= etfTax;

      lzkBal = (lzkBal + contrib) * (1 + lzkRoi);

      yearGains = etfGains;
      yearTax = etfTax;
      annualLZKContrib = contrib;
    } else {
      const prevEtf = etfBal;
      etfBal = (etfBal + contrib) * (1 + roi);
      const etfGains = etfBal - prevEtf - contrib;
      const etfTax = calculateTax(etfGains, inputs);
      etfBal -= etfTax;

      yearGains = etfGains;
      yearTax = etfTax;
      annualETFContrib = contrib;
    }

    // Apply life events cash-flow to ETF balance
    const eventCF = lifeEventCashFlow(lifeEvents, startYear + y, inf, startYear);
    etfBal += eventCF;
    etfBal = Math.max(0, etfBal);

    const etfReal = etfBal / realFactor;
    const lzkReal = lzkBal / realFactor;
    const totalReal = etfReal + lzkReal;

    data.push({
      year: y,
      calendarYear: startYear + y,
      etfBalanceNominal: etfBal,
      etfBalanceReal: etfReal,
      lzkBalanceNominal: lzkBal,
      lzkBalanceReal: lzkReal,
      totalReal,
      annualETFContrib,
      annualLZKContrib,
      monthlySavings: savings,
      isLZKPhase,
      taxPaid: yearTax,
      annualGains: yearGains,
      isDrawdownPhase: false,
      annualWithdrawal: 0,
    });
  }

  return data;
}

// ---------------------------------------------------------------------------
// Drawdown simulation
// ---------------------------------------------------------------------------

function simulateDrawdown(
  exitBalanceNominal: number,
  inputs: FireInputs,
  exitYear: number,
): {
  data: YearDataPoint[];
  survives: boolean;
  depletionYear: number | null;
} {
  const {
    etfRendite,
    inflation,
    monatlichesWunschEinkommen,
    gesetzlicheRente,
    entnahmeModell,
    kapitalverzehrJahre,
    startYear,
  } = inputs;

  // More conservative allocation in drawdown (−1 % return)
  const roi = Math.max(0, etfRendite - 1) / 100;
  const inf = inflation / 100;
  const monthlyGap = Math.max(0, monatlichesWunschEinkommen - gesetzlicheRente);

  let balance = exitBalanceNominal;
  const data: YearDataPoint[] = [];
  let survives = true;
  let depletionYear: number | null = null;

  for (let y = 1; y <= DRAWDOWN_YEARS; y++) {
    const calYear = startYear + exitYear + y;
    // Inflation factor from simulation start (accumulation + drawdown years)
    const realFactor = Math.pow(1 + inf, exitYear + y);

    if (balance <= 0) {
      data.push(makeEmptyDrawdownPoint(exitYear + y, calYear));
      continue;
    }

    // Growth
    const prevBalance = balance;
    balance *= 1 + roi;
    const gains = balance - prevBalance;
    const tax = calculateTax(gains, inputs);
    balance -= tax;

    // Withdrawal calculation
    let withdrawal: number;
    if (entnahmeModell === "kapitalverzehr") {
      const remaining = kapitalverzehrJahre - (y - 1);
      if (remaining <= 1) {
        withdrawal = balance;
      } else {
        // Approximate net return after tax for the annuity formula
        const engine = getTaxEngine(inputs.taxCountry);
        const approxTaxDrag =
          (1 - engine.partialExemptionRate) *
          (inputs.taxCountry === "DE"
            ? (inputs.kirchensteuer ? TAX_RATE_KIST : TAX_RATE_BASE)
            : engine.calculateTax(1, makeTaxConfig(inputs)));
        const netReturn = roi * (1 - approxTaxDrag);
        if (netReturn <= 0) {
          withdrawal = balance / remaining;
        } else {
          withdrawal =
            (balance * netReturn) /
            (1 - Math.pow(1 + netReturn, -remaining));
        }
      }
    } else {
      // Ewige Rente: desired income gap, inflation-adjusted
      withdrawal = monthlyGap * 12 * Math.pow(1 + inf, exitYear + y);
    }

    withdrawal = Math.min(withdrawal, balance);
    balance -= withdrawal;

    if (balance <= 0 && depletionYear === null) {
      depletionYear = calYear;
      survives = false;
      balance = 0;
    }

    data.push({
      year: exitYear + y,
      calendarYear: calYear,
      etfBalanceNominal: balance,
      etfBalanceReal: balance / realFactor,
      lzkBalanceNominal: 0,
      lzkBalanceReal: 0,
      totalReal: balance / realFactor,
      annualETFContrib: 0,
      annualLZKContrib: 0,
      monthlySavings: 0,
      isLZKPhase: false,
      taxPaid: tax,
      annualGains: gains,
      isDrawdownPhase: true,
      annualWithdrawal: withdrawal,
    });
  }

  return { data, survives, depletionYear };
}

// ---------------------------------------------------------------------------
// Reverse calculation — binary-search for required monthly savings
// ---------------------------------------------------------------------------

function calculateRequiredSparrate(
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
      const savings = monthlySavings * Math.pow(1 + dyn, y - 1);
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
// Small helpers
// ---------------------------------------------------------------------------

function makeYearZero(
  startKapital: number,
  monthlySavings: number,
  startYear: number,
): YearDataPoint {
  return {
    year: 0,
    calendarYear: startYear,
    etfBalanceNominal: startKapital,
    etfBalanceReal: startKapital,
    lzkBalanceNominal: 0,
    lzkBalanceReal: 0,
    totalReal: startKapital,
    annualETFContrib: 0,
    annualLZKContrib: 0,
    monthlySavings,
    isLZKPhase: false,
    taxPaid: 0,
    annualGains: 0,
    isDrawdownPhase: false,
    annualWithdrawal: 0,
  };
}

function makeEmptyDrawdownPoint(
  year: number,
  calendarYear: number,
): YearDataPoint {
  return {
    year,
    calendarYear,
    etfBalanceNominal: 0,
    etfBalanceReal: 0,
    lzkBalanceNominal: 0,
    lzkBalanceReal: 0,
    totalReal: 0,
    annualETFContrib: 0,
    annualLZKContrib: 0,
    monthlySavings: 0,
    isLZKPhase: false,
    taxPaid: 0,
    annualGains: 0,
    isDrawdownPhase: true,
    annualWithdrawal: 0,
  };
}

// ---------------------------------------------------------------------------
// Seeded PRNG (Mulberry32) – deterministic, fast, no external deps
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller transform for normal distribution
function normalRandom(rng: () => number): number {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// ---------------------------------------------------------------------------
// Monte Carlo drawdown simulation
// ---------------------------------------------------------------------------

const MC_SIMULATIONS = 1_000;
const MC_DRAWDOWN_YEARS = 40;

function simulateMonteCarlo(
  exitBalanceNominal: number,
  inputs: FireInputs,
  exitYear: number,
): MonteCarloResult {
  const {
    etfRendite,
    inflation,
    monatlichesWunschEinkommen,
    gesetzlicheRente,
    entnahmeModell,
    kapitalverzehrJahre,
    startYear,
  } = inputs;

  // Expected return and volatility for drawdown phase
  const meanReturn = Math.max(0, etfRendite - 1) / 100; // conservative
  const stdDev = 0.15; // ~15% annual volatility (typical for diversified equity)
  const inf = inflation / 100;
  const monthlyGap = Math.max(0, monatlichesWunschEinkommen - gesetzlicheRente);

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
        withdrawal = monthlyGap * 12 * Math.pow(1 + inf, exitYear + y);
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
  const percentile = (arr: number[], p: number): number => {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.floor(p * (sorted.length - 1));
    return sorted[idx];
  };

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

const MC_LIFECYCLE_SIMULATIONS = 500; // fewer than drawdown for performance

function simulateLifecycleMonteCarlo(
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
      const savings = monatlicheSparrate * Math.pow(1 + dyn, y - 1);
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

  const percentile = (arr: number[], p: number): number => {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.floor(p * (sorted.length - 1));
    return sorted[idx];
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
    lzkJahre,
    lzkRendite,
    startYear,
    monatlichesWunschEinkommen,
    gesetzlicheRente,
    swr,
    monatlichesNetto,
    lifeEvents,
  } = inputs;

  const roi = etfRendite / 100;
  const inf = inflation / 100;
  const dyn = dynamikSparrate / 100;
  const lzkRoi = lzkRendite / 100;
  const swrDecimal = swr / 100;
  const realReturn = (1 + roi) / (1 + inf) - 1;

  // Derived FIRE number: (monthlyGap × 12) / SWR
  const monthlyGap = Math.max(
    0,
    monatlichesWunschEinkommen - gesetzlicheRente,
  );
  const derivedFireNumber =
    swrDecimal > 0 ? (monthlyGap * 12) / swrDecimal : 0;

  // -----------------------------------------------------------------------
  // Pass 1: estimate FIRE year without LZK (with tax + life events)
  // -----------------------------------------------------------------------
  let etfBal = startKapital;
  let estimatedFireYear = MAX_YEARS;
  for (let y = 1; y <= MAX_YEARS; y++) {
    const savings = monatlicheSparrate * Math.pow(1 + dyn, y - 1);
    const contrib = savings * 12 + bavJaehrlich;
    const prev = etfBal;
    etfBal = (etfBal + contrib) * (1 + roi);
    const gains = etfBal - prev - contrib;
    etfBal -= calculateTax(gains, inputs);
    // Life events impact
    const eventCF = lifeEventCashFlow(lifeEvents, startYear + y, inf, startYear);
    etfBal += eventCF;
    etfBal = Math.max(0, etfBal);
    const realVal = etfBal / Math.pow(1 + inf, y);
    if (realVal >= zielvermoegen) {
      estimatedFireYear = y;
      break;
    }
  }

  const lzkStartYear = Math.max(1, estimatedFireYear - lzkJahre);

  // -----------------------------------------------------------------------
  // Pass 2: full simulation with LZK and tax
  // -----------------------------------------------------------------------
  etfBal = startKapital;
  let lzkBal = 0;
  const yearlyData: YearDataPoint[] = [];
  let totalTaxPaid = 0;
  let totalGains = 0;

  yearlyData.push(makeYearZero(startKapital, monatlicheSparrate, startYear));

  let coastFireYear: number | null = null;
  let fullFireYear: number | null = null;

  // Check year-0 Coast FIRE
  const coastThreshold0 =
    estimatedFireYear > 0
      ? zielvermoegen / Math.pow(1 + realReturn, estimatedFireYear)
      : zielvermoegen;
  if (startKapital >= coastThreshold0) coastFireYear = 0;
  if (startKapital >= zielvermoegen) fullFireYear = 0;

  for (let y = 1; y <= MAX_YEARS; y++) {
    const isLZKPhase = y >= lzkStartYear;
    const savings = monatlicheSparrate * Math.pow(1 + dyn, y - 1);
    const contrib = savings * 12 + bavJaehrlich;
    const realFactor = Math.pow(1 + inf, y);

    let annualETFContrib = 0;
    let annualLZKContrib = 0;
    let yearGains = 0;
    let yearTax = 0;

    if (isLZKPhase) {
      const prevEtf = etfBal;
      etfBal *= 1 + roi;
      const etfGains = etfBal - prevEtf;
      const etfTax = calculateTax(etfGains, inputs);
      etfBal -= etfTax;

      lzkBal = (lzkBal + contrib) * (1 + lzkRoi);

      yearGains = etfGains;
      yearTax = etfTax;
      annualLZKContrib = contrib;
    } else {
      const prevEtf = etfBal;
      etfBal = (etfBal + contrib) * (1 + roi);
      const etfGains = etfBal - prevEtf - contrib;
      const etfTax = calculateTax(etfGains, inputs);
      etfBal -= etfTax;

      yearGains = etfGains;
      yearTax = etfTax;
      annualETFContrib = contrib;
    }

    totalTaxPaid += yearTax;
    totalGains += yearGains;

    // Apply life events cash-flow to ETF balance
    const eventCF = lifeEventCashFlow(lifeEvents, startYear + y, inf, startYear);
    etfBal += eventCF;
    etfBal = Math.max(0, etfBal);

    const etfReal = etfBal / realFactor;
    const lzkReal = lzkBal / realFactor;
    const totalReal = etfReal + lzkReal;

    yearlyData.push({
      year: y,
      calendarYear: startYear + y,
      etfBalanceNominal: etfBal,
      etfBalanceReal: etfReal,
      lzkBalanceNominal: lzkBal,
      lzkBalanceReal: lzkReal,
      totalReal,
      annualETFContrib,
      annualLZKContrib,
      monthlySavings: savings,
      isLZKPhase,
      taxPaid: yearTax,
      annualGains: yearGains,
      isDrawdownPhase: false,
      annualWithdrawal: 0,
    });

    // Dynamic Coast FIRE
    if (coastFireYear === null) {
      const yearsRemaining = Math.max(0, estimatedFireYear - y);
      const coastThreshold =
        yearsRemaining > 0
          ? zielvermoegen / Math.pow(1 + realReturn, yearsRemaining)
          : zielvermoegen;
      if (totalReal >= coastThreshold) coastFireYear = y;
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

  // -----------------------------------------------------------------------
  // Exit values
  // -----------------------------------------------------------------------
  const exitIdx = fullFireYear !== null ? fullFireYear : MAX_YEARS;
  const exitData = yearlyData[exitIdx];
  const exitBalance = exitData?.totalReal ?? 0;
  const exitBalanceNominal = exitData
    ? exitData.etfBalanceNominal + exitData.lzkBalanceNominal
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
    lzkStartYear,
    lzkStartCalendarYear: startYear + lzkStartYear,
    passiveIncomeAtExit,
    swRate: swr,
    targetReached: fullFireYear !== null,

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
  };
}

// ---------------------------------------------------------------------------
// Formatters (unchanged)
// ---------------------------------------------------------------------------

export function formatEuro(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

// ---------------------------------------------------------------------------
// Reverse planner
// ---------------------------------------------------------------------------

export interface SensitivityRow {
  returnRate: number;
  requiredSavings: number;
  fireNumber: number;
}

export interface ReverseResult {
  requiredMonthlySavings: number;
  fireNumber: number;
  yearsToFire: number;
  monteCarlo: MonteCarloResult;
  yearlyProjection: YearDataPoint[];

  // Scenario bands (±2% return)
  scenarioOptimistic: YearDataPoint[];
  scenarioPessimistic: YearDataPoint[];

  // Drawdown phase
  drawdownData: YearDataPoint[];
  drawdownSurvives: boolean;
  drawdownDepletionYear: number | null;

  // Additional KPI data
  totalTaxPaid: number;
  passiveIncomeAtFire: number;
  coastFireYear: number | null;

  // Current vs required comparison
  currentProjection: YearDataPoint[] | null;

  // Sensitivity analysis
  sensitivity: SensitivityRow[];
}

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
): ReverseResult {
  const monthlyGap = Math.max(0, targetMonthlyIncome - statePension);
  const swrDecimal = swr / 100;
  const inf = inflation / 100;

  // Better FIRE number for kapitalverzehr mode (present-value-of-annuity)
  let fireNumber: number;
  if (entnahmeModell === "kapitalverzehr" && kapitalverzehrJahre > 0 && swrDecimal > 0) {
    // Use a conservative return (−1 pp) for drawdown, matching simulateDrawdown/simulateMonteCarlo
    const conservativeReturn = Math.max(0, expectedReturn - DRAWDOWN_RETURN_DEDUCTION) / 100;
    const realReturn = (1 + conservativeReturn) / (1 + inf) - 1;
    const annualNeed = monthlyGap * 12;
    if (realReturn <= 0) {
      fireNumber = annualNeed * kapitalverzehrJahre;
    } else {
      fireNumber = annualNeed * (1 - Math.pow(1 + realReturn, -kapitalverzehrJahre)) / realReturn;
    }
  } else {
    fireNumber = swrDecimal > 0 ? (monthlyGap * 12) / swrDecimal : 0;
  }

  const inputs: FireInputs = {
    startKapital: startCapital,
    monatlicheSparrate: 0,
    dynamikSparrate: dynamicSavings,
    etfRendite: expectedReturn,
    inflation,
    bavJaehrlich: bavAnnual,
    zielvermoegen: fireNumber,
    lzkJahre: 3,
    lzkRendite: 3.5,
    startYear: new Date().getFullYear(),
    monatlichesWunschEinkommen: targetMonthlyIncome,
    gesetzlicheRente: statePension,
    swr,
    steuerModell,
    kirchensteuer,
    entnahmeModell,
    kapitalverzehrJahre,
    monatlichesNetto,
    taxCountry,
    lifeEvents,
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
  const exitBalanceNominal = exitData ? exitData.etfBalanceNominal + exitData.lzkBalanceNominal : 0;

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
  };
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
