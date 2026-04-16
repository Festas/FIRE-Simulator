import type { TaxCountry } from "@/lib/tax";

export type CurrencyCode = "EUR" | "USD" | "GBP" | "CHF" | "CAD" | "AUD";

export const COUNTRY_CURRENCY: Record<TaxCountry, CurrencyCode> = {
  DE: "EUR",
  AT: "EUR",
  NL: "EUR",
  FR: "EUR",
  US: "USD",
  UK: "GBP",
  CH: "CHF",
  CA: "CAD",
  AU: "AUD",
};

/** Return the Intl locale best matching the country */
export function countryLocale(country: TaxCountry): string {
  const map: Record<TaxCountry, string> = {
    DE: "de-DE",
    AT: "de-AT",
    NL: "nl-NL",
    FR: "fr-FR",
    US: "en-US",
    UK: "en-GB",
    CH: "de-CH",
    CA: "en-CA",
    AU: "en-AU",
  };
  return map[country];
}
