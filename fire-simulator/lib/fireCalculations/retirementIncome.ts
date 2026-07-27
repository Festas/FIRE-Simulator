// ---------------------------------------------------------------------------
// Retirement income & needs — shared across all drawdown simulations
// ---------------------------------------------------------------------------
//
// Centralises how the annual net withdrawal need is computed so that the
// deterministic drawdown, the Monte-Carlo drawdown and the lifecycle Monte-Carlo
// all stay consistent. Models Germany-specific realism:
//
//   • lifelong health-insurance cost (freiwillige GKV / PKV),
//   • state pension that is taxed (Besteuerungsanteil + KVdR) and may grow at a
//     different rate than price inflation,
//   • pension only credited from `renteneintrittsalter`.
//
// With the default inputs (health-insurance 0, pension tax 0, pension inflation
// = price inflation) the result is identical to the previous behaviour, so the
// change is fully backward compatible.
// ---------------------------------------------------------------------------

import type { FireInputs } from "./types";

/** Net monthly state pension after taxation (today's €, before inflation). */
export function netMonthlyPension(inputs: FireInputs): number {
  const rate = Math.max(0, Math.min(100, inputs.pensionSteuersatz ?? 0)) / 100;
  return Math.max(0, inputs.gesetzlicheRente) * (1 - rate);
}

/** Effective pension growth rate (decimal). Falls back to price inflation. */
export function pensionGrowthRate(inputs: FireInputs): number {
  const p = inputs.pensionInflation;
  const inf = inputs.inflation / 100;
  return typeof p === "number" && isFinite(p) ? p / 100 : inf;
}

/**
 * Gross annual withdrawal need for a given age, `yearsFromStart` years after the
 * simulation start (used for inflation scaling). Returns the amount that must be
 * drawn from the portfolio after crediting the (net, possibly slower-growing)
 * state pension once the retiree reaches pension age.
 *
 * @param inputs        simulation inputs
 * @param age           the retiree's age in this year
 * @param yearsFromStart number of years since the simulation's `startYear`
 */
export function annualWithdrawalNeed(
  inputs: FireInputs,
  age: number,
  yearsFromStart: number,
): number {
  const inf = inputs.inflation / 100;
  const pensionAge = inputs.renteneintrittsalter ?? 67;
  const priceFactor = Math.pow(1 + inf, yearsFromStart);

  const kvMonthly = Math.max(0, inputs.krankenversicherungMonatlich ?? 0);
  const grossNeedAnnual =
    (inputs.monatlichesWunschEinkommen + kvMonthly) * 12 * priceFactor;

  if (age < pensionAge) return Math.max(0, grossNeedAnnual);

  const pensionFactor = Math.pow(1 + pensionGrowthRate(inputs), yearsFromStart);
  const pensionAnnual = netMonthlyPension(inputs) * 12 * pensionFactor;
  return Math.max(0, grossNeedAnnual - pensionAnnual);
}
