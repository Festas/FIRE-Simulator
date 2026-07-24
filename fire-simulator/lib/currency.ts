// ---------------------------------------------------------------------------
// Currency — fixed to Euro (Germany focus)
// ---------------------------------------------------------------------------

export type CurrencyCode = "EUR";

/** The only supported currency. */
export const CURRENCY_CODE: CurrencyCode = "EUR";

/** Intl locale used for currency/number formatting per UI language. */
export function formattingLocale(uiLocale: "de" | "en"): string {
  // English still formats Euro amounts; en-IE uses the € symbol with English.
  return uiLocale === "de" ? "de-DE" : "en-IE";
}
