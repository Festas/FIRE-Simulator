// ---------------------------------------------------------------------------
// Constants for FIRE calculations
// ---------------------------------------------------------------------------

/** Maximum accumulation simulation horizon (years) */
export const MAX_YEARS = 50;

/** Drawdown simulation length (years) */
export const DRAWDOWN_YEARS = 40;

/** Drawdown return deduction (percentage points) — conservative allocation assumption */
export const DRAWDOWN_RETURN_DEDUCTION = 1;

/** Sensitivity analysis range for reverse planner */
export const SENSITIVITY_MIN_RETURN = 4;
export const SENSITIVITY_MAX_RETURN = 10;
export const SENSITIVITY_STEP = 1;

/** Legacy constants for backward compatibility */
export const TAX_RATE_BASE = 0.26375;
export const TAX_RATE_KIST = 0.2782;

/** Number of Monte Carlo simulations for drawdown phase */
export const MC_SIMULATIONS = 1_000;

/** Number of years for Monte Carlo drawdown simulation */
export const MC_DRAWDOWN_YEARS = 40;

/** Number of Monte Carlo simulations for accumulation phase (fewer for performance) */
export const MC_LIFECYCLE_SIMULATIONS = 500;

/** Target success rate for MC-backed savings recommendation */
export const MC_TARGET_SUCCESS_RATE = 0.75;
