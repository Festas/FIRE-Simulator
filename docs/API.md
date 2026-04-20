# API Reference

> Complete reference for the FIRE Simulator calculation engine.

## Table of Contents

- [Core Functions](#core-functions)
- [Types & Interfaces](#types--interfaces)
- [Tax Engine](#tax-engine)
- [Constants](#constants)
- [Utility Functions](#utility-functions)

---

## Core Functions

### `calculateFIRE(inputs: FireInputs): FireResult`

**Module:** `lib/fireCalculations/index.ts`

The main orchestrator function. Takes all user inputs and returns a complete simulation result including accumulation, drawdown, Monte Carlo analysis, and derived metrics.

**Parameters:**
- `inputs` — Complete set of user inputs (see [FireInputs](#fireinputs))

**Returns:** [FireResult](#fireresult) — Full simulation output

**Example:**
```typescript
import { calculateFIRE, FireInputs } from "@/lib/fireCalculations";

const inputs: FireInputs = {
  startKapital: 30_000,
  monatlicheSparrate: 1_500,
  dynamikSparrate: 2.0,
  etfRendite: 7.0,
  inflation: 2.5,
  bavJaehrlich: 0,
  zielvermoegen: 857_143,
  zielvermoegenOverride: false,
  lzkJahre: 0,
  lzkRendite: 0,
  startYear: 2026,
  currentAge: 30,
  monatlichesWunschEinkommen: 2_500,
  gesetzlicheRente: 1_200,
  renteneintrittsalter: 67,
  swr: 3.5,
  steuerModell: "single",
  kirchensteuer: false,
  taxCountry: "DE",
  entnahmeModell: "ewigeRente",
  kapitalverzehrJahre: 30,
  monatlichesNetto: 3_500,
  lifeEvents: [],
  arbeitszeitkontoEnabled: false,
  stundenProJahr: 0,
  wochenStunden: 40,
};

const result = calculateFIRE(inputs);
console.log(result.fullFireAge);          // e.g., 47
console.log(result.derivedFireNumber);     // e.g., 857_143
console.log(result.monteCarlo.successRate); // e.g., 0.92
```

---

### `simulateAccumulation(inputs, taxCalc, lifeEventCF, savingsOverride)`

**Module:** `lib/fireCalculations/accumulation.ts`

Simulates the wealth accumulation phase year by year for up to `MAX_YEARS` (50).

**Returns:** Array of [YearDataPoint](#yeardatapoint) for each simulated year.

**Key behavior:**
- Applies monthly savings with annual dynamic increase
- Calculates ETF returns and taxes on gains
- Checks for Coast FIRE and full FIRE thresholds
- Applies life event cash flows
- Models Arbeitszeitkonto (working time account) if enabled

---

### `simulateDrawdown(inputs, exitIdx, accumulationData, taxCalc)`

**Module:** `lib/fireCalculations/drawdown.ts`

Simulates the withdrawal phase for 40 years after FIRE is reached.

**Key behavior:**
- Withdraws based on SWR (perpetual income) or capital depletion
- Applies conservative return deduction (-1%)
- Models state pension kicking in at `renteneintrittsalter`
- Calculates tax on withdrawal-phase gains
- Detects portfolio depletion year

---

### `simulateMonteCarlo(inputs, exitBalance, ...)`

**Module:** `lib/fireCalculations/monteCarlo.ts`

Runs 1,000 Monte Carlo simulations of the drawdown phase with randomized annual returns.

**Returns:** [MonteCarloResult](#montecarloresult)
- `successRate` — fraction of simulations where portfolio survives
- `percentiles` — P10, P25, P50, P75, P90 portfolio trajectories
- `years` — calendar years for each data point

---

### `simulateLifecycleMonteCarlo(inputs, ...)`

**Module:** `lib/fireCalculations/monteCarlo.ts`

Runs 500 Monte Carlo simulations of the **full lifecycle** — from current age through accumulation and drawdown to age 90.

**Returns:** [LifecycleMonteCarloResult](#lifecyclemontecarloresult)
- FIRE year confidence intervals (P10–P90)
- Accumulation and lifecycle percentile bands
- Lifecycle survival rate
- Median FIRE year and pension start year

---

### `calculateRequiredSparrate(inputs, ...)`

**Module:** `lib/fireCalculations/reverse.ts`

Uses binary search to find the minimum monthly savings rate needed to reach FIRE within `MAX_YEARS`.

**Returns:** `number` — Required monthly savings (€/month)

---

### `calculateReverse(inputs, targetAge, ...)`

**Module:** `lib/fireCalculations/reverse.ts`

Comprehensive reverse calculation: given a target FIRE age, calculates all required parameters.

**Returns:** [ReverseResult](#reverseresult)

---

### `calculateAgeSavingsAnalysis(inputs, ...)`

**Module:** `lib/fireCalculations/reverse.ts`

Generates a table of required savings for different target FIRE ages, with both deterministic and Monte Carlo–backed estimates.

**Returns:** Array of [AgeSavingsRow](#agesavingsrow)

---

## Types & Interfaces

### `FireInputs`

Complete set of user inputs for the simulation.

| Field                      | Type                              | Description                                          |
| -------------------------- | --------------------------------- | ---------------------------------------------------- |
| `startKapital`             | `number`                          | Starting capital (€)                                 |
| `monatlicheSparrate`       | `number`                          | Monthly savings (€)                                  |
| `dynamikSparrate`          | `number`                          | Annual savings increase (%)                          |
| `etfRendite`               | `number`                          | Expected ETF return (%)                              |
| `inflation`                | `number`                          | Expected inflation (%)                               |
| `bavJaehrlich`             | `number`                          | Annual employer pension contribution (€)             |
| `zielvermoegen`            | `number`                          | Target wealth (€, auto or manual)                    |
| `zielvermoegenOverride`    | `boolean`                         | Manual target overrides auto-calculated FIRE number  |
| `lzkJahre`                 | `number`                          | LZK (Lebensarbeitszeitkonto) phase years             |
| `lzkRendite`               | `number`                          | LZK phase return (%)                                 |
| `startYear`                | `number`                          | Simulation start year                                |
| `currentAge`               | `number`                          | User's current age                                   |
| `monatlichesWunschEinkommen` | `number`                        | Desired monthly retirement income (€)                |
| `gesetzlicheRente`         | `number`                          | Expected monthly state pension (€)                   |
| `renteneintrittsalter`     | `number`                          | State pension start age                              |
| `swr`                      | `number`                          | Safe withdrawal rate (%)                             |
| `steuerModell`             | `"single" \| "couple"`            | Tax filing status                                    |
| `kirchensteuer`            | `boolean`                         | Church tax surcharge (DE only)                       |
| `taxCountry`               | `TaxCountry`                      | Tax jurisdiction                                     |
| `entnahmeModell`           | `"ewigeRente" \| "kapitalverzehr"` | Perpetual income vs. capital depletion              |
| `kapitalverzehrJahre`      | `number`                          | Depletion period in years                            |
| `monatlichesNetto`         | `number`                          | Monthly net income (for savings rate display)        |
| `lifeEvents`               | `LifeEvent[]`                     | Life events timeline                                 |
| `arbeitszeitkontoEnabled`  | `boolean`                         | Enable working time account                          |
| `stundenProJahr`           | `number`                          | Hours accumulated per year                           |
| `wochenStunden`            | `number`                          | Regular weekly working hours                         |

---

### `FireResult`

Complete simulation output.

| Field                    | Type                          | Description                                    |
| ------------------------ | ----------------------------- | ---------------------------------------------- |
| `yearlyData`             | `YearDataPoint[]`             | Year-by-year accumulation data                 |
| `coastFireYear`          | `number \| null`              | Year offset when Coast FIRE is reached         |
| `fullFireYear`           | `number \| null`              | Year offset when full FIRE is reached          |
| `coastFireCalendarYear`  | `number \| null`              | Calendar year of Coast FIRE                    |
| `fullFireCalendarYear`   | `number \| null`              | Calendar year of full FIRE                     |
| `coastFireAge`           | `number \| null`              | Age at Coast FIRE                              |
| `fullFireAge`            | `number \| null`              | Age at full FIRE                               |
| `passiveIncomeAtExit`    | `number`                      | Monthly passive income at FIRE                 |
| `swRate`                 | `number`                      | Effective safe withdrawal rate                 |
| `targetReached`          | `boolean`                     | Whether FIRE target was reached                |
| `drawdownData`           | `YearDataPoint[]`             | Post-FIRE withdrawal simulation                |
| `drawdownSurvives`       | `boolean`                     | Portfolio survives 40-year drawdown            |
| `drawdownDepletionYear`  | `number \| null`              | Year portfolio is depleted (null = survives)   |
| `derivedFireNumber`      | `number`                      | Calculated FIRE number from income + SWR       |
| `monteCarlo`             | `MonteCarloResult`            | Monte Carlo drawdown analysis                  |
| `lifecycleMonteCarlo`    | `LifecycleMonteCarloResult`   | Full lifecycle Monte Carlo                     |
| `requiredSparrate`       | `number`                      | Minimum monthly savings to reach FIRE          |
| `sparquote`              | `number`                      | Current savings rate as % of net income        |
| `totalTaxPaid`           | `number`                      | Total taxes paid over simulation               |
| `effectiveTaxRate`       | `number`                      | Effective tax rate on gains                    |
| `scenarioOptimistic`     | `YearDataPoint[]`             | +2% return scenario                            |
| `scenarioPessimistic`    | `YearDataPoint[]`             | -2% return scenario                            |
| `noInvestmentData`       | `YearDataPoint[]`             | Savings-only baseline (no returns)             |
| `coastFireAmount`        | `number`                      | Dynamic Coast FIRE threshold amount            |
| `freistellungStartAge`   | `number \| null`              | Paid leave start age                           |
| `freistellungEndAge`     | `number \| null`              | Paid leave end age                             |
| `freistellungJahre`      | `number`                      | Total paid leave years                         |

---

### `YearDataPoint`

Single year of simulation data (used for both accumulation and drawdown).

| Field                | Type      | Description                                  |
| -------------------- | --------- | -------------------------------------------- |
| `year`               | `number`  | Year offset from start (0-based)             |
| `calendarYear`       | `number`  | Actual calendar year                         |
| `age`                | `number`  | User's age in this year                      |
| `etfBalanceNominal`  | `number`  | ETF balance (nominal)                        |
| `etfBalanceReal`     | `number`  | ETF balance (inflation-adjusted)             |
| `lzkBalanceNominal`  | `number`  | LZK balance (nominal)                        |
| `lzkBalanceReal`     | `number`  | LZK balance (inflation-adjusted)             |
| `totalReal`          | `number`  | Total portfolio (inflation-adjusted)         |
| `annualETFContrib`   | `number`  | Annual ETF contribution                      |
| `annualLZKContrib`   | `number`  | Annual LZK contribution                      |
| `monthlySavings`     | `number`  | Monthly savings in this year                 |
| `isLZKPhase`         | `boolean` | Currently in LZK phase                       |
| `taxPaid`            | `number`  | Tax paid this year                           |
| `annualGains`        | `number`  | Investment gains this year                   |
| `isDrawdownPhase`    | `boolean` | In withdrawal phase                          |
| `annualWithdrawal`   | `number`  | Annual withdrawal amount                     |
| `stundenGuthaben`    | `number`  | Accumulated working time hours               |
| `isFreistellungsPhase` | `boolean` | In paid leave phase                        |
| `isCoastPhase`       | `boolean` | In Coast FIRE phase                          |

---

### `MonteCarloResult`

| Field         | Type                      | Description                          |
| ------------- | ------------------------- | ------------------------------------ |
| `successRate` | `number`                  | Portfolio survival probability (0–1) |
| `percentiles` | `{ p10, p25, p50, p75, p90: number[] }` | Portfolio value trajectories |
| `years`       | `number[]`                | Calendar years for each index        |

---

### `LifecycleMonteCarloResult`

| Field                      | Type                                | Description                           |
| -------------------------- | ----------------------------------- | ------------------------------------- |
| `fireYearPercentiles`      | `{ p10–p90: number \| null }`       | FIRE year confidence intervals        |
| `fireSuccessRate`          | `number`                            | % of sims reaching FIRE               |
| `accumulationPercentiles`  | `{ p10–p90: number[] }`             | Accumulation portfolio bands          |
| `accumulationYears`        | `number[]`                          | Calendar years for accumulation       |
| `lifecyclePercentiles`     | `{ p10–p90: number[] }`             | Full lifecycle portfolio bands        |
| `lifecycleYears`           | `number[]`                          | Calendar years for full lifecycle     |
| `lifecycleTotalYears`      | `number`                            | Total years simulated                 |
| `medianFireYear`           | `number \| null`                    | Median FIRE year offset               |
| `pensionStartYear`         | `number`                            | Year offset when pension begins       |
| `lifecycleSuccessRate`     | `number`                            | Portfolio survival to end of lifecycle |

---

### `LifeEvent`

| Field               | Type              | Description                                    |
| -------------------- | ----------------- | ---------------------------------------------- |
| `id`                | `string`          | Unique identifier (crypto.randomUUID)          |
| `type`              | `LifeEventType`   | Event category (see below)                     |
| `name`              | `string`          | Display name                                   |
| `startYear`         | `number`          | Calendar year the event starts                 |
| `endYear`           | `number`          | Calendar year the event ends                   |
| `annualAmount`      | `number`          | Annual cash-flow impact (negative = expense)   |
| `inflationAdjusted` | `boolean`         | Whether amount adjusts for inflation           |

**LifeEventType values:**
`home_purchase`, `child`, `career_change`, `inheritance`, `pension_start`, `healthcare`, `one_time_expense`, `one_time_income`, `side_income`, `savings_rate_change`

---

### `ReverseResult`

| Field                      | Type                          | Description                              |
| -------------------------- | ----------------------------- | ---------------------------------------- |
| `requiredMonthlySavings`   | `number`                      | Required monthly savings (€)             |
| `fireNumber`               | `number`                      | Target FIRE number                       |
| `yearsToFire`              | `number`                      | Years needed to reach FIRE               |
| `monteCarlo`               | `MonteCarloResult`            | MC analysis at calculated savings        |
| `yearlyProjection`         | `YearDataPoint[]`             | Projected accumulation path              |
| `scenarioOptimistic`       | `YearDataPoint[]`             | +2% scenario                             |
| `scenarioPessimistic`      | `YearDataPoint[]`             | -2% scenario                             |
| `drawdownData`             | `YearDataPoint[]`             | Post-FIRE drawdown simulation            |
| `drawdownSurvives`         | `boolean`                     | Portfolio survival                       |
| `totalTaxPaid`             | `number`                      | Total taxes over projection              |
| `passiveIncomeAtFire`      | `number`                      | Monthly income at FIRE                   |
| `coastFireYear`            | `number \| null`              | Coast FIRE year                          |
| `currentProjection`        | `YearDataPoint[] \| null`     | Current-savings projection               |
| `sensitivity`              | `SensitivityRow[]`            | Sensitivity analysis table               |
| `mcRecommendedSavings`     | `number`                      | MC-backed savings recommendation         |
| `mcSuccessRate`            | `number`                      | Success rate at recommended savings      |
| `accumulationMonteCarlo`   | `LifecycleMonteCarloResult`   | Full lifecycle MC at recommended savings |

---

### `AgeSavingsRow`

| Field                | Type     | Description                             |
| -------------------- | -------- | --------------------------------------- |
| `exitAge`            | `number` | Target FIRE age                         |
| `targetYears`        | `number` | Years until target age                  |
| `mcSavings`          | `number` | MC-backed required monthly savings      |
| `mcSuccessRate`      | `number` | MC success rate at calculated savings   |
| `deterministicSavings` | `number` | Deterministic required monthly savings |
| `fireNumber`         | `number` | FIRE number for this exit age           |

---

## Tax Engine

### `TaxCountry`

```typescript
type TaxCountry = "DE" | "US" | "UK" | "CH" | "AT" | "NL" | "CA" | "AU" | "FR";
```

### `TaxConfig`

| Field          | Type                    | Description                        |
| -------------- | ----------------------- | ---------------------------------- |
| `country`      | `TaxCountry`            | Tax jurisdiction                   |
| `filingStatus` | `"single" \| "couple"`  | Filing status                      |
| `kirchensteuer` | `boolean`              | Church tax (DE only)               |
| `annualIncome` | `number` (optional)     | Annual income for progressive tax  |

### `TaxEngine` Interface

```typescript
interface TaxEngine {
  readonly id: TaxCountry;
  calculateTax(gains: number, config: TaxConfig): number;
  annualAllowance(config: TaxConfig): number;
  partialExemptionRate: number;
}
```

---

## Constants

| Constant                    | Value   | Module          |
| --------------------------- | ------- | --------------- |
| `MAX_YEARS`                 | `50`    | constants.ts    |
| `DRAWDOWN_YEARS`            | `40`    | constants.ts    |
| `DRAWDOWN_RETURN_DEDUCTION` | `1`     | constants.ts    |
| `LIFECYCLE_END_AGE`         | `90`    | constants.ts    |
| `MC_SIMULATIONS`            | `1000`  | constants.ts    |
| `MC_LIFECYCLE_SIMULATIONS`  | `500`   | constants.ts    |
| `MC_DRAWDOWN_YEARS`         | `40`    | constants.ts    |
| `MC_TARGET_SUCCESS_RATE`    | `0.75`  | constants.ts    |
| `TAX_RATE_BASE`             | `0.26375` | constants.ts  |
| `TAX_RATE_KIST`             | `0.2782`  | constants.ts  |

---

## Utility Functions

### `formatEuro(value: number): string`

Formats a number as Euro currency string with German locale.

### `formatPercent(value: number): string`

Formats a number as a percentage string.

### `lifeEventCashFlow(events, year, inflation, startYear): number`

Calculates the net cash-flow impact of all life events for a given year.

### `getSavingsRateOverride(events, year, startYear): number | null`

Returns the savings rate override from life events, if any.

### `makeTaxConfig(inputs: FireInputs): TaxConfig`

Creates a tax configuration object from FIRE inputs.

### `calculateTax(gains: number, config: TaxConfig): number`

Calculates tax on investment gains using the appropriate country engine.

### `makeYearZero(inputs: FireInputs): YearDataPoint`

Creates the initial year-0 data point for the simulation.
