// ---------------------------------------------------------------------------
// Tax Engine — Germany (Abgeltungssteuer)
// ---------------------------------------------------------------------------
//
// The simulator focuses exclusively on Germany. Capital gains are taxed via the
// Abgeltungssteuer (flat 25% + 5.5% Solidaritätszuschlag, optionally increased
// by Kirchensteuer), with the equity-ETF Teilfreistellung (30% partial
// exemption) and the annual Sparer-Pauschbetrag (tax-free allowance).
// ---------------------------------------------------------------------------

/**
 * Tax-relevant configuration for the German capital-gains tax.
 */
export interface TaxConfig {
  /** Filing status — determines the Sparer-Pauschbetrag (1.000 € vs. 2.000 €) */
  filingStatus: "single" | "couple";
  /** Church-tax surcharge (increases the effective rate) */
  kirchensteuer: boolean;
}

/** Teilfreistellung for equity ETFs — 30% of gains are exempt */
export const TEILFREISTELLUNG = 0.3;
/** Base rate: 25% Abgeltungssteuer + 5.5% Solidaritätszuschlag */
export const TAX_RATE_BASE = 0.26375;
/** Rate including 8% Kirchensteuer */
export const TAX_RATE_KIST = 0.2782;

/** Partial-exemption rate applied to gains before taxation */
export const PARTIAL_EXEMPTION_RATE = TEILFREISTELLUNG;

/** Annual tax-free allowance (Sparer-Pauschbetrag) */
export function annualAllowance(config: TaxConfig): number {
  return config.filingStatus === "couple" ? 2_000 : 1_000;
}

/** Effective capital-gains tax rate (incl. Kirchensteuer if enabled) */
export function taxRate(config: TaxConfig): number {
  return config.kirchensteuer ? TAX_RATE_KIST : TAX_RATE_BASE;
}

/** Calculate German capital-gains tax on investment gains for one year */
export function calculateGermanTax(gains: number, config: TaxConfig): number {
  if (gains <= 0) return 0;
  const taxable = gains * (1 - TEILFREISTELLUNG);
  const afterFreibetrag = Math.max(0, taxable - annualAllowance(config));
  if (afterFreibetrag <= 0) return 0;
  return afterFreibetrag * taxRate(config);
}
