// ---------------------------------------------------------------------------
// Pluggable Tax Engine — Multi-Country Support
// ---------------------------------------------------------------------------
//
// Each country module implements the TaxEngine interface.  The main calculation
// code calls `calculateTax(gains, config)` via the active engine, keeping
// country-specific logic isolated.
// ---------------------------------------------------------------------------

export type TaxCountry = "DE" | "US" | "UK" | "CH" | "AT" | "NL";

/**
 * Minimal tax-relevant configuration shared across engines.
 * Country-specific fields (e.g. filing status, church tax) are forwarded
 * via the same object; unused fields are simply ignored by other engines.
 */
export interface TaxConfig {
  country: TaxCountry;
  filingStatus: "single" | "couple";
  /** DE-specific: church-tax surcharge */
  kirchensteuer: boolean;
  /** Annual income (used by progressive-rate countries like US/UK) */
  annualIncome?: number;
}

export interface TaxEngine {
  /** Human-readable country label (untranslated key) */
  readonly id: TaxCountry;
  /** Calculate tax on investment gains for one year */
  calculateTax(gains: number, config: TaxConfig): number;
  /** Tax-free allowance (Sparerpauschbetrag equivalent) */
  annualAllowance(config: TaxConfig): number;
  /** Whether gains are partially exempt (e.g. Teilfreistellung for equity ETFs) */
  partialExemptionRate: number;
}

// ---------------------------------------------------------------------------
// 🇩🇪 Germany — Abgeltungssteuer
// ---------------------------------------------------------------------------

const TEILFREISTELLUNG = 0.3;
const TAX_RATE_BASE_DE = 0.26375; // 25% + 5.5% Soli
const TAX_RATE_KIST_DE = 0.2782; // with 8% Kirchensteuer

const germanyEngine: TaxEngine = {
  id: "DE",
  partialExemptionRate: TEILFREISTELLUNG,

  annualAllowance(config) {
    return config.filingStatus === "couple" ? 2_000 : 1_000;
  },

  calculateTax(gains, config) {
    if (gains <= 0) return 0;
    const taxable = gains * (1 - TEILFREISTELLUNG);
    const freibetrag = this.annualAllowance(config);
    const afterFreibetrag = Math.max(0, taxable - freibetrag);
    if (afterFreibetrag <= 0) return 0;
    const rate = config.kirchensteuer ? TAX_RATE_KIST_DE : TAX_RATE_BASE_DE;
    return afterFreibetrag * rate;
  },
};

// ---------------------------------------------------------------------------
// 🇺🇸 United States — Federal Long-Term Capital Gains
// ---------------------------------------------------------------------------
// Simplified: only federal LTCG brackets (0 / 15 / 20 %).
// State taxes are not modelled.  Standard deduction not applied to gains.
// ---------------------------------------------------------------------------

function usLtcgRate(taxableIncome: number, single: boolean): number {
  if (single) {
    if (taxableIncome <= 47_025) return 0.0;
    if (taxableIncome <= 518_900) return 0.15;
    return 0.20;
  }
  // married filing jointly
  if (taxableIncome <= 94_050) return 0.0;
  if (taxableIncome <= 583_750) return 0.15;
  return 0.20;
}

const usEngine: TaxEngine = {
  id: "US",
  partialExemptionRate: 0, // no partial exemption in the US

  annualAllowance() {
    return 0; // no flat allowance — handled via 0% bracket
  },

  calculateTax(gains, config) {
    if (gains <= 0) return 0;
    const income = config.annualIncome ?? 0;
    const rate = usLtcgRate(income + gains, config.filingStatus === "single");
    return gains * rate;
  },
};

// ---------------------------------------------------------------------------
// 🇬🇧 United Kingdom — Capital Gains Tax
// ---------------------------------------------------------------------------
// Basic-rate taxpayer: 10 % on gains above annual exempt amount (2024/25: £3,000)
// Higher/additional rate: 20 %
// Simplified: we use income to determine the marginal rate.
// ---------------------------------------------------------------------------

const UK_CGT_ALLOWANCE = 3_000; // 2024/25 onwards

const ukEngine: TaxEngine = {
  id: "UK",
  partialExemptionRate: 0,

  annualAllowance() {
    return UK_CGT_ALLOWANCE;
  },

  calculateTax(gains, config) {
    if (gains <= 0) return 0;
    const taxable = Math.max(0, gains - UK_CGT_ALLOWANCE);
    if (taxable <= 0) return 0;

    const income = config.annualIncome ?? 0;
    // Higher rate threshold (2024/25): £50,270
    const higherRateThreshold = 50_270;
    const basicRateRoom = Math.max(0, higherRateThreshold - income);

    if (basicRateRoom >= taxable) {
      return taxable * 0.10;
    }
    return basicRateRoom * 0.10 + (taxable - basicRateRoom) * 0.20;
  },
};

// ---------------------------------------------------------------------------
// 🇨🇭 Switzerland — No capital gains tax on private investments
// ---------------------------------------------------------------------------
// Swiss residents pay no federal/cantonal tax on private capital gains from
// securities.  Wealth tax exists but is not modelled here (it applies to
// total net worth, not gains).
// ---------------------------------------------------------------------------

const switzerlandEngine: TaxEngine = {
  id: "CH",
  partialExemptionRate: 0,

  annualAllowance() {
    return Infinity;
  },

  calculateTax() {
    return 0; // no capital gains tax
  },
};

// ---------------------------------------------------------------------------
// 🇦🇹 Austria — KESt (Kapitalertragsteuer)
// ---------------------------------------------------------------------------
// Flat 27.5 % on capital gains — no partial exemption, no allowance.
// ---------------------------------------------------------------------------

const austriaEngine: TaxEngine = {
  id: "AT",
  partialExemptionRate: 0,

  annualAllowance() {
    return 0;
  },

  calculateTax(gains) {
    if (gains <= 0) return 0;
    return gains * 0.275;
  },
};

// ---------------------------------------------------------------------------
// 🇳🇱 Netherlands — Box 3 Notional Return Tax
// ---------------------------------------------------------------------------
// The Netherlands does not tax actual gains.  Instead, a fictitious return is
// assumed on net assets above a threshold and taxed at 36 %.  The notional
// return depends on the asset mix — we use a simplified blended rate of 6.04 %
// for investments (2024).  The tax-free threshold is €57,000 per person.
//
// Because this tax applies to total wealth and not per-year gains, we
// approximate it by applying the effective rate to the year's balance growth.
// ---------------------------------------------------------------------------

const NL_NOTIONAL_RATE = 0.0604; // blended assumed return (2024)
const NL_BOX3_TAX_RATE = 0.36;
const NL_THRESHOLD_SINGLE = 57_000;
const NL_THRESHOLD_COUPLE = 114_000;

const netherlandsEngine: TaxEngine = {
  id: "NL",
  partialExemptionRate: 0,

  annualAllowance(config) {
    return config.filingStatus === "couple" ? NL_THRESHOLD_COUPLE : NL_THRESHOLD_SINGLE;
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  calculateTax(gains, _config) {
    // In reality Box 3 applies to total balance — here we approximate with
    // an effective rate on gains.
    if (gains <= 0) return 0;
    const effectiveRate = NL_NOTIONAL_RATE * NL_BOX3_TAX_RATE;
    return gains * effectiveRate;
  },
};

// ---------------------------------------------------------------------------
// Engine registry
// ---------------------------------------------------------------------------

const engines: Record<TaxCountry, TaxEngine> = {
  DE: germanyEngine,
  US: usEngine,
  UK: ukEngine,
  CH: switzerlandEngine,
  AT: austriaEngine,
  NL: netherlandsEngine,
};

export function getTaxEngine(country: TaxCountry): TaxEngine {
  return engines[country];
}

export const TAX_COUNTRIES: TaxCountry[] = ["DE", "US", "UK", "CH", "AT", "NL"];

export const TAX_COUNTRY_LABELS: Record<TaxCountry, string> = {
  DE: "🇩🇪 Deutschland",
  US: "🇺🇸 United States",
  UK: "🇬🇧 United Kingdom",
  CH: "🇨🇭 Schweiz",
  AT: "🇦🇹 Österreich",
  NL: "🇳🇱 Nederland",
};
