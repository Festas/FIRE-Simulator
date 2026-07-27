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
  /**
   * When true, apply a Günstigerprüfung: capital-gains tax is the lower of the
   * flat Abgeltungssteuer and the personal income-tax on the same taxable base
   * (with the Grundfreibetrag). Benefits retirees with low taxable income.
   */
  guenstigerpruefung?: boolean;
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
 * Grundfreibetrag (basic tax-free income allowance) for the 2024 German income
 * tax tariff, in euro. Doubled for jointly-assessed couples (Splitting).
 */
export const GRUNDFREIBETRAG = 11_604;

/**
 * Approximate German income tax (Einkommensteuer) for a given taxable income
 * using the 2024 §32a EStG tariff. Church tax / Soli are added on top to stay
 * comparable with the flat Abgeltungssteuer rate. For couples a simple Splitting
 * approximation is applied (tax on half the income, doubled).
 */
export function approxIncomeTax(taxableIncome: number, config: TaxConfig): number {
  const perPerson = config.filingStatus === "couple" ? taxableIncome / 2 : taxableIncome;
  const base = incomeTax2024(perPerson);
  const tax = config.filingStatus === "couple" ? base * 2 : base;
  // Add Solidaritätszuschlag (5.5%) and optional Kirchensteuer to match the
  // surcharges baked into the flat Abgeltungssteuer rate. Kirchensteuer is 8%
  // in Bavaria/Baden-Württemberg and 9% elsewhere; we approximate with 8%.
  const surcharge = 0.055 + (config.kirchensteuer ? 0.08 : 0);
  return tax * (1 + surcharge);
}

/** Core 2024 income-tax tariff (§32a EStG) for a single person, without Soli. */
function incomeTax2024(zvE: number): number {
  const x = Math.floor(Math.max(0, zvE));
  if (x <= GRUNDFREIBETRAG) return 0;
  if (x <= 17_005) {
    const y = (x - GRUNDFREIBETRAG) / 10_000;
    return (922.98 * y + 1_400) * y;
  }
  if (x <= 66_760) {
    const z = (x - 17_005) / 10_000;
    return (181.19 * z + 2_397) * z + 1_025.38;
  }
  if (x <= 277_825) return 0.42 * x - 10_602.13;
  return 0.45 * x - 18_936.88;
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
  /** Cumulative post-allowance taxable capital income booked this year (Günstiger). */
  private taxableThisYear = 0;
  /** Income tax already charged this year under Günstigerprüfung. */
  private incomeTaxPaidThisYear = 0;

  constructor(config: TaxConfig, basiszinsPercent: number = DEFAULT_BASISZINS, initialBasis = 0) {
    this.config = config;
    this.basiszinsPercent = Math.max(0, basiszinsPercent);
    this.costBasis = Math.max(0, initialBasis);
    this.allowanceLeft = annualAllowance(config);
  }

  /** Reset the annual Sparer-Pauschbetrag budget. Call once at the start of each year. */
  beginYear(): void {
    this.allowanceLeft = annualAllowance(this.config);
    this.taxableThisYear = 0;
    this.incomeTaxPaidThisYear = 0;
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
    if (net <= 0) return 0;
    const flatTax = net * taxRate(this.config);
    if (this.config.guenstigerpruefung) {
      // Günstigerprüfung: take the lower of the flat Abgeltungssteuer and the
      // personal income-tax on the realised taxable capital income this year.
      this.taxableThisYear += net;
      const personalTax = Math.max(
        0,
        approxIncomeTax(this.taxableThisYear, this.config) - this.incomeTaxPaidThisYear,
      );
      this.incomeTaxPaidThisYear += personalTax;
      return Math.min(flatTax, personalTax);
    }
    return flatTax;
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
