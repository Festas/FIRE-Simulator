// ---------------------------------------------------------------------------
// Life events helper — net cash-flow impact for a given calendar year
// ---------------------------------------------------------------------------

import type { LifeEvent } from "./types";

/**
 * Calculate the net cash-flow impact of all life events for a given calendar year.
 * Excludes savings_rate_change events (those are handled by getSavingsRateOverride).
 */
export function lifeEventCashFlow(
  events: LifeEvent[],
  calendarYear: number,
  inflationRate: number,
  simStartYear: number,
): number {
  let total = 0;
  for (const evt of events) {
    if (evt.type === "savings_rate_change") continue; // handled separately
    if (calendarYear < evt.startYear || calendarYear > evt.endYear) continue;
    let amount = evt.annualAmount;
    if (evt.inflationAdjusted) {
      const yearsElapsed = calendarYear - simStartYear;
      amount *= Math.pow(1 + inflationRate, yearsElapsed);
    }
    total += amount;
  }
  return total;
}

/**
 * Returns the overridden monthly savings rate if a savings_rate_change event
 * is active for the given calendar year, otherwise returns null.
 * Note: For savings_rate_change events, the `annualAmount` field stores
 * the new *monthly* savings rate (not an annual amount).
 */
export function getSavingsRateOverride(
  events: LifeEvent[],
  calendarYear: number,
): number | null {
  for (const evt of events) {
    if (evt.type !== "savings_rate_change") continue;
    if (calendarYear >= evt.startYear && calendarYear <= evt.endYear) {
      return evt.annualAmount; // annualAmount = new monthly savings rate
    }
  }
  return null;
}
