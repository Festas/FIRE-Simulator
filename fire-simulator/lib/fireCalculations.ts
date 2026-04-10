// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

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

  // Withdrawal mode
  entnahmeModell: "ewigeRente" | "kapitalverzehr";
  kapitalverzehrJahre: number; // years to deplete (only for kapitalverzehr)

  // Gross income for savings-rate display
  monatlichesBrutto: number;
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

  // Savings rate as % of gross income
  sparquote: number;

  // Scenario comparison
  scenarioOptimistic: YearDataPoint[]; // +2 % return
  scenarioPessimistic: YearDataPoint[]; // −2 % return

  // Tax totals
  totalTaxPaid: number;
  effectiveTaxRate: number;

  // Derived FIRE number from desired income
  derivedFireNumber: number;

  // Monte Carlo simulation
  monteCarlo: MonteCarloResult;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_YEARS = 30;
const DRAWDOWN_YEARS = 40;

// Teilfreistellung: 30 % of equity-ETF gains are tax-free
const TEILFREISTELLUNG = 0.3;

// 25 % Abgeltungssteuer + 5.5 % Solidaritätszuschlag
const TAX_RATE_BASE = 0.26375;
// With 8 % Kirchensteuer on the 25 % base
const TAX_RATE_KIST = 0.2782;

// ---------------------------------------------------------------------------
// Tax helper — German Abgeltungssteuer
// ---------------------------------------------------------------------------

function calculateTax(gains: number, inputs: FireInputs): number {
  if (gains <= 0) return 0;

  // Only 70 % of equity-ETF gains are taxable
  const taxableGains = gains * (1 - TEILFREISTELLUNG);

  // Sparerpauschbetrag
  const freibetrag = inputs.steuerModell === "couple" ? 2_000 : 1_000;
  const afterFreibetrag = Math.max(0, taxableGains - freibetrag);

  if (afterFreibetrag <= 0) return 0;

  const rate = inputs.kirchensteuer ? TAX_RATE_KIST : TAX_RATE_BASE;
  return afterFreibetrag * rate;
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
    startYear,
  } = inputs;

  const roi = (etfRendite + returnOffset) / 100;
  const inf = inflation / 100;
  const dyn = dynamikSparrate / 100;

  let etfBal = startKapital;
  const data: YearDataPoint[] = [];

  data.push(makeYearZero(startKapital, monatlicheSparrate, startYear));

  for (let y = 1; y <= MAX_YEARS; y++) {
    const savings = monatlicheSparrate * Math.pow(1 + dyn, y - 1);
    const contrib = savings * 12 + bavJaehrlich;
    const prevBal = etfBal;
    etfBal = (etfBal + contrib) * (1 + roi);
    const gains = etfBal - prevBal - contrib;
    const tax = calculateTax(gains, inputs);
    etfBal -= tax;
    const realFactor = Math.pow(1 + inf, y);
    const etfReal = etfBal / realFactor;

    data.push({
      year: y,
      calendarYear: startYear + y,
      etfBalanceNominal: etfBal,
      etfBalanceReal: etfReal,
      lzkBalanceNominal: 0,
      lzkBalanceReal: 0,
      totalReal: etfReal,
      annualETFContrib: contrib,
      annualLZKContrib: 0,
      monthlySavings: savings,
      isLZKPhase: false,
      taxPaid: tax,
      annualGains: gains,
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
        const approxTaxDrag =
          (1 - TEILFREISTELLUNG) *
          (inputs.kirchensteuer ? TAX_RATE_KIST : TAX_RATE_BASE);
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
          const approxTaxDrag =
            (1 - TEILFREISTELLUNG) *
            (inputs.kirchensteuer ? TAX_RATE_KIST : TAX_RATE_BASE);
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
        withdrawal = monthlyGap * 12 * Math.pow(1 + inf, y);
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
    monatlichesBrutto,
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
  // Pass 1: estimate FIRE year without LZK (with tax)
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
    monatlichesBrutto > 0
      ? (monatlicheSparrate / monatlichesBrutto) * 100
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

export function formatEuroShort(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Mio. €`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString("de-DE", { maximumFractionDigits: 0 })}k €`;
  }
  return formatEuro(value);
}
