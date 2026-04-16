"use client";

import type { FireInputs } from "@/lib/fireCalculations";

// ---------------------------------------------------------------------------
// URL state serialization keys (short to keep URLs compact)
// ---------------------------------------------------------------------------

const URL_KEYS: Record<string, keyof FireInputs> = {
  sk: "startKapital",
  ms: "monatlicheSparrate",
  ds: "dynamikSparrate",
  er: "etfRendite",
  in: "inflation",
  bv: "bavJaehrlich",
  zv: "zielvermoegen",
  lj: "lzkJahre",
  lr: "lzkRendite",
  sy: "startYear",
  ca: "currentAge",
  wi: "monatlichesWunschEinkommen",
  gr: "gesetzlicheRente",
  sw: "swr",
  sm: "steuerModell",
  ks: "kirchensteuer",
  tc: "taxCountry",
  em: "entnahmeModell",
  kj: "kapitalverzehrJahre",
  mb: "monatlichesNetto",
  zo: "zielvermoegenOverride",
  ae: "arbeitszeitkontoEnabled",
  sp: "stundenProJahr",
  ws: "wochenStunden",
  ra: "renteneintrittsalter",
};

// ---------------------------------------------------------------------------
// Reverse lookup: full key → short key
// ---------------------------------------------------------------------------

const REVERSE_KEYS = Object.fromEntries(
  Object.entries(URL_KEYS).map(([short, full]) => [full, short]),
) as Record<keyof FireInputs, string>;

// ---------------------------------------------------------------------------
// Parse URL search params → partial FireInputs
// ---------------------------------------------------------------------------

export function parseURLInputs(): Partial<FireInputs> | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (params.size === 0) return null;

  const result: Record<string, unknown> = {};
  let hasAny = false;

  for (const [short, full] of Object.entries(URL_KEYS)) {
    const val = params.get(short);
    if (val === null) continue;
    hasAny = true;

    if (full === "steuerModell") {
      result[full] = val === "couple" ? "couple" : "single";
    } else if (full === "kirchensteuer" || full === "arbeitszeitkontoEnabled") {
      result[full] = val === "1";
    } else if (full === "zielvermoegenOverride") {
      result[full] = val === "1";
    } else if (full === "entnahmeModell") {
      result[full] = val === "kapitalverzehr" ? "kapitalverzehr" : "ewigeRente";
    } else if (full === "taxCountry") {
      const valid = ["DE", "US", "UK", "CH", "AT", "NL", "CA", "AU", "FR"];
      result[full] = valid.includes(val) ? val : "DE";
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) result[full] = num;
    }
  }

  return hasAny ? (result as Partial<FireInputs>) : null;
}

// ---------------------------------------------------------------------------
// Serialise FireInputs → shareable URL
// ---------------------------------------------------------------------------

export function inputsToURL(inputs: FireInputs): string {
  const params = new URLSearchParams();

  for (const [full, short] of Object.entries(REVERSE_KEYS)) {
    const key = full as keyof FireInputs;
    const val = inputs[key];
    if (typeof val === "boolean") {
      params.set(short, val ? "1" : "0");
    } else if (val !== undefined && val !== null && !Array.isArray(val)) {
      params.set(short, String(val));
    }
  }

  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}
