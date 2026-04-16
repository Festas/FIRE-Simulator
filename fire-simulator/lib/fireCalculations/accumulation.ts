// ---------------------------------------------------------------------------
// Accumulation simulation — portfolio growth phase
// ---------------------------------------------------------------------------

import type { FireInputs, YearDataPoint } from "./types";
import { MAX_YEARS } from "./constants";
import { calculateTax } from "./tax";
import { lifeEventCashFlow, getSavingsRateOverride } from "./lifeEvents";
import { makeYearZero } from "./helpers";

// ---------------------------------------------------------------------------
// Simplified accumulation for scenario comparison
// ---------------------------------------------------------------------------

export function simulateAccumulation(
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
    zielvermoegen,
    startYear,
    currentAge,
    lifeEvents,
    arbeitszeitkontoEnabled,
    stundenProJahr,
    wochenStunden,
  } = inputs;

  const roi = (etfRendite + returnOffset) / 100;
  const inf = inflation / 100;
  const dyn = dynamikSparrate / 100;
  const realReturn = (1 + roi) / (1 + inf) - 1;

  // Arbeitszeitkonto: hours → years conversion
  const annualWorkHours = wochenStunden * 52;

  // Pass 1: estimate FIRE year (without AZK effects) to anchor Coast FIRE
  let tempBal = startKapital;
  let estimatedFireYear = MAX_YEARS;
  for (let y = 1; y <= MAX_YEARS; y++) {
    const override = getSavingsRateOverride(lifeEvents, startYear + y);
    const baseSavings = override !== null ? override : monatlicheSparrate * Math.pow(1 + dyn, y - 1);
    const contrib = baseSavings * 12 + bavJaehrlich;
    const prev = tempBal;
    tempBal = (tempBal + contrib) * (1 + roi);
    const gains = tempBal - prev - contrib;
    tempBal -= calculateTax(gains, inputs);
    const eventCF = lifeEventCashFlow(lifeEvents, startYear + y, inf, startYear);
    tempBal += eventCF;
    tempBal = Math.max(0, tempBal);
    const realVal = tempBal / Math.pow(1 + inf, y);
    if (realVal >= zielvermoegen) {
      estimatedFireYear = y;
      break;
    }
  }

  // Pass 2: full simulation with Arbeitszeitkonto logic
  let etfBal = startKapital;
  const data: YearDataPoint[] = [];
  let accumulatedHours = 0;
  let coastFireReached = false;
  let remainingFreistellungYears = 0;

  data.push(makeYearZero(startKapital, monatlicheSparrate, startYear, currentAge));

  for (let y = 1; y <= MAX_YEARS; y++) {
    const override = getSavingsRateOverride(lifeEvents, startYear + y);
    const savings = override !== null ? override : monatlicheSparrate * Math.pow(1 + dyn, y - 1);
    const contrib = savings * 12 + bavJaehrlich;
    const realFactor = Math.pow(1 + inf, y);

    // Check Coast FIRE threshold
    if (!coastFireReached) {
      const yearsRemaining = Math.max(0, estimatedFireYear - y);
      const coastThreshold = yearsRemaining > 0
        ? zielvermoegen / Math.pow(1 + realReturn, yearsRemaining)
        : zielvermoegen;
      const currentReal = etfBal / Math.pow(1 + inf, y - 1);
      if (currentReal >= coastThreshold) {
        coastFireReached = true;
        if (arbeitszeitkontoEnabled && accumulatedHours > 0 && annualWorkHours > 0) {
          remainingFreistellungYears = accumulatedHours / annualWorkHours;
        }
      }
    }

    // Determine current phase
    let isFreistellung = false;
    let isCoast = false;
    let isLZK = false;

    if (arbeitszeitkontoEnabled && coastFireReached) {
      if (remainingFreistellungYears > 0) {
        // Freistellung phase: paid leave, no new ETF contributions
        isFreistellung = true;
        isLZK = true;
        remainingFreistellungYears = Math.max(0, remainingFreistellungYears - 1);
      } else {
        // Coasting phase: back to work but savings rate = 0, portfolio grows by return only
        isCoast = true;
        isLZK = true;
      }
    }

    // Accumulate hours before Coast FIRE
    if (arbeitszeitkontoEnabled && !coastFireReached) {
      accumulatedHours += stundenProJahr;
    }

    // ETF growth & contributions
    const prevEtf = etfBal;
    if (isFreistellung) {
      // Freistellung: no new contributions, only portfolio growth
      etfBal = etfBal * (1 + roi);
    } else if (isCoast) {
      // Coasting: no new contributions, only portfolio growth
      etfBal = etfBal * (1 + roi);
    } else {
      // Normal accumulation: contributions + growth
      etfBal = (etfBal + contrib) * (1 + roi);
    }
    const etfGains = etfBal - prevEtf - (isFreistellung || isCoast ? 0 : contrib);
    const etfTax = calculateTax(etfGains, inputs);
    etfBal -= etfTax;

    // Life events cash-flow
    const eventCF = lifeEventCashFlow(lifeEvents, startYear + y, inf, startYear);
    etfBal += eventCF;
    etfBal = Math.max(0, etfBal);

    const etfReal = etfBal / realFactor;
    const totalReal = etfReal;
    const effectiveMonthlySavings = (isFreistellung || isCoast) ? 0 : savings;

    data.push({
      year: y,
      calendarYear: startYear + y,
      age: currentAge + y,
      etfBalanceNominal: etfBal,
      etfBalanceReal: etfReal,
      lzkBalanceNominal: 0,
      lzkBalanceReal: 0,
      totalReal,
      annualETFContrib: (isFreistellung || isCoast) ? 0 : contrib,
      annualLZKContrib: 0,
      monthlySavings: effectiveMonthlySavings,
      isLZKPhase: isLZK,
      taxPaid: etfTax,
      annualGains: etfGains,
      isDrawdownPhase: false,
      annualWithdrawal: 0,
      stundenGuthaben: accumulatedHours,
      isFreistellungsPhase: isFreistellung,
      isCoastPhase: isCoast,
    });
  }

  return data;
}

// ---------------------------------------------------------------------------
// No-investment comparison (savings only, eroded by inflation)
// Shows what would happen if you saved the same amounts but never invested
// ---------------------------------------------------------------------------

export function simulateNoInvestment(inputs: FireInputs): YearDataPoint[] {
  const {
    startKapital,
    monatlicheSparrate,
    dynamikSparrate,
    inflation,
    bavJaehrlich,
    startYear,
    currentAge,
  } = inputs;

  const inf = inflation / 100;
  const dyn = dynamikSparrate / 100;

  let nominalBalance = startKapital;
  const data: YearDataPoint[] = [];

  data.push(makeYearZero(startKapital, monatlicheSparrate, startYear, currentAge));

  for (let y = 1; y <= MAX_YEARS; y++) {
    const savings = monatlicheSparrate * Math.pow(1 + dyn, y - 1);
    const contrib = savings * 12 + bavJaehrlich;
    const realFactor = Math.pow(1 + inf, y);

    // No return — just add contributions
    nominalBalance += contrib;

    const realValue = nominalBalance / realFactor;

    data.push({
      year: y,
      calendarYear: startYear + y,
      age: currentAge + y,
      etfBalanceNominal: nominalBalance,
      etfBalanceReal: realValue,
      lzkBalanceNominal: 0,
      lzkBalanceReal: 0,
      totalReal: realValue,
      annualETFContrib: contrib,
      annualLZKContrib: 0,
      monthlySavings: savings,
      isLZKPhase: false,
      taxPaid: 0,
      annualGains: 0,
      isDrawdownPhase: false,
      annualWithdrawal: 0,
      stundenGuthaben: 0,
      isFreistellungsPhase: false,
      isCoastPhase: false,
    });
  }

  return data;
}
