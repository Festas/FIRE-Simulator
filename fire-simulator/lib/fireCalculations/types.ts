// ---------------------------------------------------------------------------
// Interfaces & Types for FIRE calculations
// ---------------------------------------------------------------------------

import type { TaxCountry } from "@/lib/tax";

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
  | "side_income"
  | "savings_rate_change";

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
  zielvermoegenOverride: boolean; // when true, manual target overrides auto-calculated FIRE number
  lzkJahre: number;
  lzkRendite: number;
  startYear: number;
  currentAge: number;

  // Retirement income
  monatlichesWunschEinkommen: number; // desired monthly income in retirement
  gesetzlicheRente: number; // expected monthly state pension
  renteneintrittsalter: number; // age at which state pension begins (e.g. 67)

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

  // Arbeitszeitkonto (working time account) — accumulate hours for paid leave
  arbeitszeitkontoEnabled: boolean; // enable the working-time-account model
  stundenProJahr: number; // hours accumulated per year on the time account
  wochenStunden: number; // regular weekly working hours (for conversion to years)
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
  age: number;
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

  // Arbeitszeitkonto fields
  stundenGuthaben: number; // accumulated hours on working-time account
  isFreistellungsPhase: boolean; // paid leave from accumulated hours
  isCoastPhase: boolean; // coasting: savings rate = 0, portfolio grows by return only
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

  // Age-based milestones
  coastFireAge: number | null;
  fullFireAge: number | null;
  lzkSabbaticalStartAge: number;

  // Freistellung (paid leave) milestones
  freistellungStartAge: number | null;
  freistellungEndAge: number | null;
  freistellungJahre: number; // total paid leave years available

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

  // No-investment comparison (savings only, inflation-eroded)
  noInvestmentData: YearDataPoint[];
}

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

  // Monte Carlo–backed savings recommendation (75th percentile)
  mcRecommendedSavings: number;
  mcSuccessRate: number; // fraction of MC sims reaching FIRE at recommended savings
  accumulationMonteCarlo: LifecycleMonteCarloResult;
}
