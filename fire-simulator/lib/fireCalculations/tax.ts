// ---------------------------------------------------------------------------
// Tax helper — German capital-gains tax
// ---------------------------------------------------------------------------

import { calculateGermanTax, type TaxConfig } from "@/lib/tax";
import type { FireInputs } from "./types";

export function makeTaxConfig(inputs: FireInputs): TaxConfig {
  return {
    filingStatus: inputs.steuerModell,
    kirchensteuer: inputs.kirchensteuer,
  };
}

export function calculateTax(gains: number, inputs: FireInputs): number {
  return calculateGermanTax(gains, makeTaxConfig(inputs));
}
