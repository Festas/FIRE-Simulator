// ---------------------------------------------------------------------------
// Small helpers shared across modules
// ---------------------------------------------------------------------------

import type { YearDataPoint } from "./types";

export function makeYearZero(
  startKapital: number,
  monthlySavings: number,
  startYear: number,
  currentAge: number,
): YearDataPoint {
  return {
    year: 0,
    calendarYear: startYear,
    age: currentAge,
    etfBalanceNominal: startKapital,
    etfBalanceReal: startKapital,
    lzkBalanceNominal: 0,
    lzkBalanceReal: 0,
    totalReal: startKapital,
    annualETFContrib: 0,
    annualLZKContrib: 0,
    monthlySavings,
    isLZKPhase: false,
    taxPaid: 0,
    annualGains: 0,
    isDrawdownPhase: false,
    annualWithdrawal: 0,
    stundenGuthaben: 0,
    isFreistellungsPhase: false,
    isCoastPhase: false,
  };
}

export function makeEmptyDrawdownPoint(
  year: number,
  calendarYear: number,
  age: number,
): YearDataPoint {
  return {
    year,
    calendarYear,
    age,
    etfBalanceNominal: 0,
    etfBalanceReal: 0,
    lzkBalanceNominal: 0,
    lzkBalanceReal: 0,
    totalReal: 0,
    annualETFContrib: 0,
    annualLZKContrib: 0,
    monthlySavings: 0,
    isLZKPhase: false,
    taxPaid: 0,
    annualGains: 0,
    isDrawdownPhase: true,
    annualWithdrawal: 0,
    stundenGuthaben: 0,
    isFreistellungsPhase: false,
    isCoastPhase: false,
  };
}

// ---------------------------------------------------------------------------
// Seeded PRNG (Mulberry32) – deterministic, fast, no external deps
// ---------------------------------------------------------------------------

export function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller transform for normal distribution
export function normalRandom(rng: () => number): number {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Calculate a percentile value from a sorted array of numbers.
 */
export function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.floor(p * (sorted.length - 1));
  return sorted[idx];
}
