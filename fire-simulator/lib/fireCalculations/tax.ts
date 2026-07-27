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
    guenstigerpruefung: inputs.guenstigerpruefung ?? false,
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
 * portfolio and return any capital-gains tax triggered by the flow.
 *
 * Positive flows add fresh capital (basis increases, no tax). Negative flows are
 * treated as a partial sale: the realised-gain fraction is taxed (proportional
 * method) and the cost basis shrinks pro-rata. The caller must subtract the
 * returned tax from the balance.
 *
 * @param account       the tax account to update
 * @param eventCF       the net cash flow applied to the balance
 * @param balanceBefore the ETF balance before the cash flow is applied
 * @returns capital-gains tax owed on the sale (0 for non-negative flows)
 */
export function applyCashFlowToBasis(
  account: GermanTaxAccount,
  eventCF: number,
  balanceBefore: number,
): number {
  if (eventCF > 0) {
    account.contribute(eventCF);
    return 0;
  }
  if (eventCF < 0 && balanceBefore > 0) {
    // A negative cash flow (withdrawal) is a partial sale: it realises a
    // proportional share of the accrued gains, which is taxed, and returns the
    // remaining capital (reducing the cost basis pro-rata).
    return account.taxWithdrawal(-eventCF, balanceBefore);
  }
  return 0;
}
