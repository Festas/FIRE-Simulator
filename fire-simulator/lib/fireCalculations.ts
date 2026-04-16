// ---------------------------------------------------------------------------
// FIRE Calculations — re-export barrel
// ---------------------------------------------------------------------------
// This file re-exports everything from the modular lib/fireCalculations/
// directory for backward compatibility.  All new code should import from
// "@/lib/fireCalculations" (the directory index) or from the specific
// sub-module.
// ---------------------------------------------------------------------------

export {
  // Types
  type LifeEventType,
  type LifeEvent,
  type FireInputs,
  type MonteCarloResult,
  type YearDataPoint,
  type LifecycleMonteCarloResult,
  type FireResult,
  type SensitivityRow,
  type ReverseResult,
  // Constants
  MAX_YEARS,
  DRAWDOWN_YEARS,
  DRAWDOWN_RETURN_DEDUCTION,
  MC_SIMULATIONS,
  MC_DRAWDOWN_YEARS,
  MC_LIFECYCLE_SIMULATIONS,
  MC_TARGET_SUCCESS_RATE,
  // Functions
  calculateFIRE,
  calculateReverse,
  calculateMCRequiredSparrate,
  formatEuro,
  formatEuroShort,
  simulateAccumulation,
  simulateNoInvestment,
  simulateDrawdown,
  simulateMonteCarlo,
  simulateLifecycleMonteCarlo,
  calculateRequiredSparrate,
  lifeEventCashFlow,
  getSavingsRateOverride,
  calculateTax,
  makeTaxConfig,
} from "./fireCalculations/index";
