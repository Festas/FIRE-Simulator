// ---------------------------------------------------------------------------
// Drawdown simulation — post-FIRE withdrawal phase
// ---------------------------------------------------------------------------

import type { FireInputs, YearDataPoint } from "./types";
import { DRAWDOWN_YEARS, DRAWDOWN_RETURN_DEDUCTION, TAX_RATE_BASE, TAX_RATE_KIST } from "./constants";
import { makeTaxAccount } from "./tax";
import { makeEmptyDrawdownPoint } from "./helpers";
import { annualWithdrawalNeed } from "./retirementIncome";
import { PARTIAL_EXEMPTION_RATE } from "@/lib/tax";

export function simulateDrawdown(
  exitBalanceNominal: number,
  inputs: FireInputs,
  exitYear: number,
  exitBasisNominal: number = exitBalanceNominal,
): {
  data: YearDataPoint[];
  survives: boolean;
  depletionYear: number | null;
} {
  const {
    etfRendite,
    inflation,
    entnahmeModell,
    kapitalverzehrJahre,
    startYear,
    currentAge,
  } = inputs;

  // More conservative allocation in drawdown (−1 % return)
  const roi = Math.max(0, etfRendite - DRAWDOWN_RETURN_DEDUCTION) / 100;
  const inf = inflation / 100;

  let balance = exitBalanceNominal;
  const tax = makeTaxAccount(inputs, exitBasisNominal);
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

    tax.beginYear();

    // Growth — only the annual Vorabpauschale is taxed while unrealised
    const prevBalance = balance;
    balance *= 1 + roi;
    const gains = balance - prevBalance;
    let annualTax = tax.taxVorabpauschale(prevBalance, gains);
    balance -= annualTax;

    // Withdrawal calculation
    let withdrawal: number;
    if (entnahmeModell === "kapitalverzehr") {
      const remaining = kapitalverzehrJahre - (y - 1);
      if (remaining <= 1) {
        withdrawal = balance;
      } else {
        // Approximate net return after tax for the annuity formula
        const approxTaxDrag =
          (1 - PARTIAL_EXEMPTION_RATE) *
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
      // Ewige Rente: desired income gap, inflation-adjusted. Health-insurance,
      // pension taxation and a distinct pension growth rate are handled by the
      // shared retirement-income helper (defaults reproduce the previous logic).
      withdrawal = annualWithdrawalNeed(inputs, age, exitYear + y);
    }

    withdrawal = Math.min(withdrawal, balance);
    // Tax the realised-gain fraction of the sale (proportional method)
    const withdrawalTax = tax.taxWithdrawal(withdrawal, balance);
    annualTax += withdrawalTax;
    balance -= withdrawal;
    balance -= withdrawalTax;

    if (balance <= 0 && depletionYear === null) {
      depletionYear = calYear;
      // Kapitalverzehr deliberately depletes the portfolio by the end of the
      // planned horizon, so only a *premature* depletion (before the planned
      // year `kapitalverzehrJahre`) counts as a failure. Ewige Rente treats any
      // depletion as a failure.
      const prematureDepletion =
        entnahmeModell !== "kapitalverzehr" || y < kapitalverzehrJahre;
      if (prematureDepletion) survives = false;
      balance = 0;
    }

    data.push({
      year: exitYear + y,
      calendarYear: calYear,
      age,
      etfBalanceNominal: balance,
      etfBalanceReal: balance / realFactor,
      costBasisNominal: tax.costBasis,
      lzkBalanceNominal: 0,
      lzkBalanceReal: 0,
      totalReal: balance / realFactor,
      annualETFContrib: 0,
      annualLZKContrib: 0,
      monthlySavings: 0,
      isLZKPhase: false,
      taxPaid: annualTax,
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
