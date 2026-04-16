// ---------------------------------------------------------------------------
// Tax helper — delegates to pluggable tax engine
// ---------------------------------------------------------------------------

import { getTaxEngine, type TaxConfig } from "@/lib/tax";
import type { FireInputs } from "./types";

export function makeTaxConfig(inputs: FireInputs): TaxConfig {
  return {
    country: inputs.taxCountry,
    filingStatus: inputs.steuerModell,
    kirchensteuer: inputs.kirchensteuer,
    annualIncome: inputs.monatlichesNetto * 12,
  };
}

export function calculateTax(gains: number, inputs: FireInputs): number {
  const engine = getTaxEngine(inputs.taxCountry);
  return engine.calculateTax(gains, makeTaxConfig(inputs));
}
