/**
 * Shared Y-axis formatter for all chart components.
 * Abbreviates large numbers: 1,500,000 → "1.5M", 50,000 → "50k".
 */
export function yAxisFormatter(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
}
