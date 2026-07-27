// ---------------------------------------------------------------------------
// Tax Engine — Germany (Abgeltungssteuer)
// ---------------------------------------------------------------------------
//
// The simulator focuses exclusively on Germany. Capital gains are taxed via the
// Abgeltungssteuer (flat 25% + 5.5% Solidaritätszuschlag, optionally increased
// by Kirchensteuer), with the equity-ETF Teilfreistellung (30% partial
// exemption) and the annual Sparer-Pauschbetrag (tax-free allowance).
//
// Accumulating ("thesaurierend") equity ETFs defer the bulk of the capital-
// gains tax until the shares are sold. During the holding period only the
// annual **Vorabpauschale** (advance lump sum) is taxed, and the tax that was
// actually realised is settled on sale via cost-basis tracking. The stateful
// `GermanTaxAccount` below models exactly this behaviour so the simulator no
// longer over-taxes unrealised gains every year.
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

/**
 * Default Basiszins (base interest rate) for the Vorabpauschale, expressed as a
 * percentage. Published annually by the Bundesfinanzministerium; ~2.53% applied
 * for the 2025 tax year. Used when no explicit value is supplied.
 */
export const DEFAULT_BASISZINS = 2.53;

/** Share of the Basiszins that forms the Basisertrag (70%). */
export const VORABPAUSCHALE_FACTOR = 0.7;

/** Annual tax-free allowance (Sparer-Pauschbetrag) */
export function annualAllowance(config: TaxConfig): number {
  return config.filingStatus === "couple" ? 2_000 : 1_000;
}

/** Effective capital-gains tax rate (incl. Kirchensteuer if enabled) */
export function taxRate(config: TaxConfig): number {
  return config.kirchensteuer ? TAX_RATE_KIST : TAX_RATE_BASE;
}

/**
 * Basisertrag for the year = value at the start of the year × Basiszins × 70%.
 * This is the theoretical minimum return the tax office assumes.
 */
export function basisertrag(valueStartOfYear: number, basiszinsPercent: number): number {
  if (valueStartOfYear <= 0 || basiszinsPercent <= 0) return 0;
  return valueStartOfYear * (basiszinsPercent / 100) * VORABPAUSCHALE_FACTOR;
}

/**
 * Vorabpauschale for the year — capped at the actual value increase.
 * Returns 0 when the position did not gain value during the year.
 */
export function vorabpauschale(
  valueStartOfYear: number,
  valueEndOfYear: number,
  basiszinsPercent: number,
): number {
  const gain = valueEndOfYear - valueStartOfYear;
  if (gain <= 0) return 0;
  return Math.max(0, Math.min(basisertrag(valueStartOfYear, basiszinsPercent), gain));
}

/** Calculate German capital-gains tax on realised investment gains for one year */
export function calculateGermanTax(gains: number, config: TaxConfig): number {
  if (gains <= 0) return 0;
  const taxable = gains * (1 - TEILFREISTELLUNG);
  const afterFreibetrag = Math.max(0, taxable - annualAllowance(config));
  if (afterFreibetrag <= 0) return 0;
  return afterFreibetrag * taxRate(config);
}

// ---------------------------------------------------------------------------
// Stateful tax account — models tax deferral via cost-basis tracking
// ---------------------------------------------------------------------------

/**
 * A stateful German capital-gains tax account for a single ETF position.
 *
 * It tracks the position's cost basis and a per-year Sparer-Pauschbetrag budget
 * that is shared between the annual Vorabpauschale and realised gains, so that:
 *
 *  - during accumulation only the Vorabpauschale is taxed (deferral), and each
 *    taxed Vorabpauschale raises the cost basis so it is not taxed again on
 *    sale;
 *  - on withdrawal/sale only the realised-gain fraction of the amount sold is
 *    taxed (proportional-gain method), crediting the previously paid
 *    Vorabpauschale.
 *
 * The account is intended to be created once per simulation run and mutated as
 * the simulation advances year by year.
 */
export class GermanTaxAccount {
  readonly config: TaxConfig;
  readonly basiszinsPercent: number;
  /** Current cost basis (acquisition cost + contributions + taxed Vorabpauschale). */
  costBasis: number;
  /** Remaining Sparer-Pauschbetrag for the current year. */
  private allowanceLeft: number;

  constructor(config: TaxConfig, basiszinsPercent: number = DEFAULT_BASISZINS, initialBasis = 0) {
    this.config = config;
    this.basiszinsPercent = Math.max(0, basiszinsPercent);
    this.costBasis = Math.max(0, initialBasis);
    this.allowanceLeft = annualAllowance(config);
  }

  /** Reset the annual Sparer-Pauschbetrag budget. Call once at the start of each year. */
  beginYear(): void {
    this.allowanceLeft = annualAllowance(this.config);
  }

  /** Record a contribution/purchase — increases the cost basis, no tax. */
  contribute(amount: number): void {
    if (amount > 0) this.costBasis += amount;
  }

  /**
   * Tax a post-Teilfreistellung taxable amount against the remaining annual
   * allowance, consuming the allowance budget. Returns the tax owed.
   */
  private taxTaxable(taxableAfterExemption: number): number {
    if (taxableAfterExemption <= 0) return 0;
    const offset = Math.min(this.allowanceLeft, taxableAfterExemption);
    this.allowanceLeft -= offset;
    const net = taxableAfterExemption - offset;
    return net > 0 ? net * taxRate(this.config) : 0;
  }

  /**
   * Apply the annual Vorabpauschale on the year's unrealised growth.
   *
   * @param valueStartOfYear position value at the beginning of the year
   * @param growthGain       investment growth during the year (excluding contributions)
   * @returns tax paid on the Vorabpauschale (also raises the cost basis)
   */
  taxVorabpauschale(valueStartOfYear: number, growthGain: number): number {
    if (growthGain <= 0 || valueStartOfYear <= 0) return 0;
    const vap = Math.min(basisertrag(valueStartOfYear, this.basiszinsPercent), growthGain);
    if (vap <= 0) return 0;
    const taxable = vap * (1 - TEILFREISTELLUNG);
    const tax = this.taxTaxable(taxable);
    // The Vorabpauschale is taxed in advance, so it raises the acquisition cost
    // and is not taxed again when the shares are eventually sold.
    this.costBasis += vap;
    return tax;
  }

  /**
   * Tax the realised-gain fraction of a withdrawal/sale (proportional method)
   * and reduce the cost basis proportionally to the fraction of the position
   * that was sold.
   *
   * @param withdrawal             gross amount sold
   * @param valueBeforeWithdrawal  position value before the sale
   * @returns tax paid on the realised gain
   */
  taxWithdrawal(withdrawal: number, valueBeforeWithdrawal: number): number {
    if (withdrawal <= 0 || valueBeforeWithdrawal <= 0) return 0;
    const sold = Math.min(withdrawal, valueBeforeWithdrawal);
    const basisFraction = Math.min(1, this.costBasis / valueBeforeWithdrawal);
    // The realised gain is the part of the sale that is not return of capital.
    const realisedGain = Math.max(0, sold * (1 - basisFraction));
    // Return of capital reduces the remaining cost basis.
    this.costBasis = Math.max(0, this.costBasis - sold * basisFraction);
    if (realisedGain <= 0) return 0;
    const taxable = realisedGain * (1 - TEILFREISTELLUNG);
    return this.taxTaxable(taxable);
  }
}
