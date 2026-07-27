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
    costBasisNominal: startKapital,
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
    costBasisNominal: 0,
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
 * Draw a one-year *simple* return given an arithmetic mean and standard
 * deviation of returns.
 *
 * When `logNormal` is false the classic additive model is used
 * (`mean + stdDev · Z`), which can produce returns below −100 %.
 *
 * When `logNormal` is true, gross returns are drawn from a log-normal
 * distribution — the realistic model for compounding asset prices: it can never
 * wipe out more than 100 % of the portfolio and is right-skewed. The log-space
 * parameters are chosen so the *arithmetic* mean of the simple return stays
 * equal to `mean` (so expected outcomes are unchanged, only the shape/tail is
 * corrected):
 *
 *   σ² = ln(1 + (stdDev / (1 + mean))²)
 *   μ  = ln(1 + mean) − σ² / 2
 *   r  = exp(μ + σ · Z) − 1
 */
export function sampleAnnualReturn(
  rng: () => number,
  mean: number,
  stdDev: number,
  logNormal: boolean,
): number {
  const z = normalRandom(rng);
  if (!logNormal) return mean + stdDev * z;

  const base = 1 + mean;
  if (base <= 0) return mean + stdDev * z; // degenerate; fall back
  // Method-of-moments: choose log-space μ, σ so the growth factor (1+r) is
  // log-normal with arithmetic mean = base and std dev = stdDev. This keeps the
  // *arithmetic* mean of the simple return equal to `mean` while preventing any
  // draw below −100%. See the standard log-normal moment equations:
  //   σ² = ln(1 + (stdDev/base)²),  μ = ln(base) − σ²/2.
  const variance = Math.log(1 + Math.pow(stdDev / base, 2));
  const sigma = Math.sqrt(variance);
  const mu = Math.log(base) - variance / 2;
  return Math.exp(mu + sigma * z) - 1;
}

/**
 * Calculate a percentile value from a sorted array of numbers.
 * Returns 0 for empty arrays.
 */
export function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.floor(p * (sorted.length - 1));
  return sorted[idx];
}
