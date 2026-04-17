"use client";

import type { FireInputs, LifeEvent } from "@/lib/fireCalculations";

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
// Life events URL serialization (base64-encoded JSON)
// ---------------------------------------------------------------------------

const LIFE_EVENTS_KEY = "le";

function encodeLifeEvents(events: LifeEvent[]): string {
  if (events.length === 0) return "";
  try {
    // Compact format: omit id (will be regenerated), abbreviate keys
    const compact = events.map((e) => ({
      t: e.type,
      n: e.name,
      s: e.startYear,
      e: e.endYear,
      a: e.annualAmount,
      i: e.inflationAdjusted ? 1 : 0,
    }));
    const json = JSON.stringify(compact);
    return btoa(json);
  } catch {
    return "";
  }
}

function decodeLifeEvents(encoded: string): LifeEvent[] {
  if (!encoded) return [];
  try {
    const json = atob(encoded);
    const compact = JSON.parse(json) as Array<{
      t: string;
      n: string;
      s: number;
      e: number;
      a: number;
      i: number;
    }>;
    return compact.map((c) => ({
      id: crypto.randomUUID(),
      type: c.t as LifeEvent["type"],
      name: c.n,
      startYear: c.s,
      endYear: c.e,
      annualAmount: c.a,
      inflationAdjusted: c.i === 1,
    }));
  } catch {
    return [];
  }
}

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

  // Decode life events from URL
  const leParam = params.get(LIFE_EVENTS_KEY);
  if (leParam) {
    const events = decodeLifeEvents(leParam);
    if (events.length > 0) {
      result.lifeEvents = events;
      hasAny = true;
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

  // Encode life events into URL
  if (inputs.lifeEvents && inputs.lifeEvents.length > 0) {
    const encoded = encodeLifeEvents(inputs.lifeEvents);
    if (encoded) {
      params.set(LIFE_EVENTS_KEY, encoded);
    }
  }

  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}
