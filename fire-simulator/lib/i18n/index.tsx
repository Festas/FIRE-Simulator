"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Locale, Translations, getTranslations } from "./translations";
import { CURRENCY_CODE, formattingLocale } from "@/lib/currency";

interface I18nContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  formatCurrency: (value: number) => string;
  formatCurrencyShort: (value: number) => string;
  formatPercent: (value: number) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "de";
  try {
    const saved = localStorage.getItem("fire-simulator-locale");
    if (saved === "en" || saved === "de") return saved;
  } catch {
    // ignore
  }
  // Detect browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("de")) return "de";
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("fire-simulator-locale", newLocale);
    } catch {
      // ignore
    }
    document.documentElement.lang = newLocale;
  }, []);

  const t = getTranslations(locale);

  const intlLocale = formattingLocale(locale);

  const formatCurrency = useCallback(
    (value: number) =>
      new Intl.NumberFormat(intlLocale, {
        style: "currency",
        currency: CURRENCY_CODE,
        maximumFractionDigits: 0,
      }).format(value),
    [intlLocale],
  );

  const formatCurrencyShort = useCallback(
    (value: number) => {
      const symbol = new Intl.NumberFormat(intlLocale, {
        style: "currency",
        currency: CURRENCY_CODE,
        maximumFractionDigits: 0,
      }).formatToParts(0).find(p => p.type === "currency")?.value ?? CURRENCY_CODE;

      if (value >= 1_000_000) {
        const formatted = (value / 1_000_000).toLocaleString(
          intlLocale,
          { minimumFractionDigits: 1, maximumFractionDigits: 2 },
        );
        return locale === "de"
          ? `${formatted} Mio. ${symbol}`
          : `${symbol}${formatted}M`;
      }
      if (value >= 1_000) {
        const formatted = (value / 1_000).toLocaleString(
          intlLocale,
          { maximumFractionDigits: 0 },
        );
        return locale === "de"
          ? `${formatted}k ${symbol}`
          : `${symbol}${formatted}k`;
      }
      return formatCurrency(value);
    },
    [locale, intlLocale, formatCurrency],
  );

  const formatPercent = useCallback(
    (value: number) =>
      locale === "de"
        ? `${value.toFixed(1)} %`
        : `${value.toFixed(1)}%`,
    [locale],
  );

  return (
    <I18nContext.Provider
      value={{ locale, t, setLocale, formatCurrency, formatCurrencyShort, formatPercent }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
