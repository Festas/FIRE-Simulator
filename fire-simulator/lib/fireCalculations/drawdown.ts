// ---------------------------------------------------------------------------
// Drawdown simulation — post-FIRE withdrawal phase
// ---------------------------------------------------------------------------

import type { FireInputs, YearDataPoint } from "./types";
import { DRAWDOWN_YEARS, TAX_RATE_BASE, TAX_RATE_KIST } from "./constants";
import { calculateTax, makeTaxConfig } from "./tax";
import { makeEmptyDrawdownPoint } from "./helpers";
import { getTaxEngine } from "@/lib/tax";

export function simulateDrawdown(
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
    renteneintrittsalter,
    entnahmeModell,
    kapitalverzehrJahre,
    startYear,
    currentAge,
  } = inputs;

  // More conservative allocation in drawdown (−1 % return)
  const roi = Math.max(0, etfRendite - 1) / 100;
  const inf = inflation / 100;
  // Full monthly gap (no pension) and reduced gap (with pension)
  const monthlyGapFull = monatlichesWunschEinkommen;
  const monthlyGapWithPension = Math.max(0, monatlichesWunschEinkommen - gesetzlicheRente);
  // Pension start age — default 67 if not set
  const pensionAge = renteneintrittsalter ?? 67;

  let balance = exitBalanceNominal;
  const data: YearDataPoint[] = [];
  let survives = true;
  let depletionYear: number | null = null;

  for (let y = 1; y <= DRAWDOWN_YEARS; y++) {
    const calYear = startYear + exitYear + y;
    const age = currentAge + exitYear + y;
    // Inflation factor from simulation start (accumulation + drawdown years)
    const realFactor = Math.pow(1 + inf, exitYear + y);

    if (balance <= 0) {
      data.push(makeEmptyDrawdownPoint(exitYear + y, calYear, age));
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
      // Before pension age: withdraw full desired income
      // After pension age: withdraw only the gap (desired - pension)
      const gap = age >= pensionAge ? monthlyGapWithPension : monthlyGapFull;
      withdrawal = gap * 12 * Math.pow(1 + inf, exitYear + y);
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
      age,
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
      stundenGuthaben: 0,
      isFreistellungsPhase: false,
      isCoastPhase: false,
    });
  }

  return { data, survives, depletionYear };
}
