// ---------------------------------------------------------------------------
// Tax helper — German capital-gains tax
// ---------------------------------------------------------------------------

import {
  calculateGermanTax,
  GermanTaxAccount,
  DEFAULT_BASISZINS,
  type TaxConfig,
} from "@/lib/tax";
import type { FireInputs } from "./types";

export function makeTaxConfig(inputs: FireInputs): TaxConfig {
  return {
    filingStatus: inputs.steuerModell,
    kirchensteuer: inputs.kirchensteuer,
  };
}

/** Resolve the Basiszins for the Vorabpauschale, falling back to the default. */
export function getBasiszins(inputs: FireInputs): number {
  const value = inputs.basiszins;
  return typeof value === "number" && isFinite(value) && value >= 0
    ? value
    : DEFAULT_BASISZINS;
}

/**
 * Create a stateful German tax account for a simulation run.
 *
 * @param inputs       simulation inputs (filing status, Kirchensteuer, Basiszins)
 * @param initialBasis initial cost basis (e.g. the starting capital already invested)
 */
export function makeTaxAccount(inputs: FireInputs, initialBasis = 0): GermanTaxAccount {
  return new GermanTaxAccount(makeTaxConfig(inputs), getBasiszins(inputs), initialBasis);
}

/**
 * Backward-compatible one-shot tax on realised gains (full-gain model).
 * Retained for callers that do not track cost basis.
 */
export function calculateTax(gains: number, inputs: FireInputs): number {
  return calculateGermanTax(gains, makeTaxConfig(inputs));
}

/**
 * Keep an account's cost basis consistent when a life-event cash flow hits the
 * portfolio: positive flows add fresh capital (basis increases), negative flows
 * are treated as a proportional return of capital (basis decreases pro-rata).
 *
 * @param account       the tax account to update
 * @param eventCF       the net cash flow applied to the balance
 * @param balanceBefore the ETF balance before the cash flow is applied
 */
export function applyCashFlowToBasis(
  account: GermanTaxAccount,
  eventCF: number,
  balanceBefore: number,
): void {
  if (eventCF > 0) {
    account.contribute(eventCF);
  } else if (eventCF < 0 && balanceBefore > 0) {
    const frac = Math.min(1, -eventCF / balanceBefore);
    account.costBasis = Math.max(0, account.costBasis * (1 - frac));
  }
}
