"use client";

import React, { useState, useMemo, useCallback, useEffect, useDeferredValue, useRef } from "react";
import { calculateFIRE, FireInputs, LifeEvent } from "@/lib/fireCalculations";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { parseURLInputs, inputsToURL } from "@/app/hooks/useUrlState";
import Sidebar from "@/app/components/Sidebar";
import KPICards from "@/app/components/KPICards";
import FireChart from "@/app/components/FireChart";
import DrawdownChart from "@/app/components/DrawdownChart";
import MonteCarloChart from "@/app/components/MonteCarloChart";
import LifecycleMonteCarloChart from "@/app/components/LifecycleMonteCarloChart";
import DetailTable from "@/app/components/DetailTable";
import PhasesTimeline from "@/app/components/PhasesTimeline";
import Warnings from "@/app/components/Warnings";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import ReversePlanner from "@/app/components/ReversePlanner";
import LifeEventsEditor from "@/app/components/LifeEventsEditor";
import ScenarioManager from "@/app/components/ScenarioManager";
import ExamplePlansDropdown from "@/app/components/ExamplePlansDropdown";
import OnboardingWizard from "@/app/components/OnboardingWizard";
import DashboardSection from "@/app/components/DashboardSection";
import FireProgressGauge from "@/app/components/FireProgressGauge";
import GuidanceCard from "@/app/components/GuidanceCard";
import LearnGlossaryModal from "@/app/components/LearnGlossaryModal";
import FireEducationPanel from "@/app/components/FireEducationPanel";
import BeginnerJourneyCard from "@/app/components/BeginnerJourneyCard";
import WhatIfPanel from "@/app/components/WhatIfPanel";
import ChartExplainer from "@/app/components/ChartExplainer";
import Milestones from "@/app/components/Milestones";
import FireScore from "@/app/components/FireScore";
import { COUNTRY_DEFAULTS } from "@/lib/countryDefaults";
import type { TaxCountry } from "@/lib/tax";

type DashboardMode = "beginner" | "standard" | "advanced";

const DEFAULT_INPUTS: FireInputs = {
  startKapital: 30_000,
  monatlicheSparrate: 1_500,
  dynamikSparrate: 2.0,
  etfRendite: 7.0,
  inflation: 2.5,
  bavJaehrlich: 0,
  zielvermoegen: Math.round((2_500 * 12) / 0.035), // auto-calculated: (desiredIncome * 12) / SWR
  zielvermoegenOverride: false,
  lzkJahre: 0,
  lzkRendite: 0,
  startYear: 2026,
  currentAge: 30,
  monatlichesWunschEinkommen: 2_500,
  gesetzlicheRente: 1_200,
  renteneintrittsalter: 67,
  swr: 3.5,
  steuerModell: "single",
  kirchensteuer: false,
  taxCountry: "DE",
  entnahmeModell: "ewigeRente",
  kapitalverzehrJahre: 30,
  monatlichesNetto: 5_200,
  lifeEvents: [],
  arbeitszeitkontoEnabled: false,
  stundenProJahr: 0,
  wochenStunden: 40,
};

const LS_KEY = "fire-simulator-inputs";
const LS_ONBOARDING_KEY = "fire-simulator-onboarded";
const UNDO_LIMIT = 30;

/** Detect likely tax country from browser locale */
function detectCountryFromLocale(): FireInputs["taxCountry"] | null {
  try {
    const lang = navigator.language || (navigator.languages?.[0] ?? "");
    const region = lang.split("-")[1]?.toUpperCase();
    const mapping: Record<string, FireInputs["taxCountry"]> = {
      DE: "DE", AT: "AT", CH: "CH", US: "US", GB: "UK", UK: "UK",
      NL: "NL", CA: "CA", AU: "AU", FR: "FR",
    };
    if (region && mapping[region]) return mapping[region];
    // Fallback: match language prefix
    const langPrefix = lang.split("-")[0].toLowerCase();
    const langMap: Record<string, FireInputs["taxCountry"]> = {
      de: "DE", en: "US", fr: "FR", nl: "NL",
    };
    return langMap[langPrefix] ?? null;
  } catch { return null; }
}

function getInitialInputs(): FireInputs {
  if (typeof window === "undefined") return DEFAULT_INPUTS;

  // URL parameters take precedence
  const urlInputs = parseURLInputs();
  if (urlInputs) {
    return { ...DEFAULT_INPUTS, ...urlInputs };
  }

  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_INPUTS, ...parsed };
    }
  } catch {
    // ignore
  }

  // Auto-detect country from browser locale for first-time visitors
  const detectedCountry = detectCountryFromLocale();
  if (detectedCountry && detectedCountry !== DEFAULT_INPUTS.taxCountry) {
    const defaults = COUNTRY_DEFAULTS[detectedCountry];
    if (defaults) {
      const swr = defaults.swr / 100;
      return {
        ...DEFAULT_INPUTS,
        taxCountry: detectedCountry,
        monatlichesNetto: defaults.monatlichesNetto,
        monatlichesWunschEinkommen: defaults.monatlichesWunschEinkommen,
        gesetzlicheRente: defaults.gesetzlicheRente,
        renteneintrittsalter: defaults.renteneintrittsalter,
        etfRendite: defaults.etfRendite,
        inflation: defaults.inflation,
        swr: defaults.swr,
        zielvermoegen: swr > 0 ? Math.round((defaults.monatlichesWunschEinkommen * 12) / swr) : DEFAULT_INPUTS.zielvermoegen,
      };
    }
  }

  return DEFAULT_INPUTS;
}

function saveInputs(inputs: FireInputs) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(inputs));
  } catch {
    // ignore
  }
}

function HomeContent() {
  const [inputs, setInputs] = useState<FireInputs>(getInitialInputs);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [learnModalOpen, setLearnModalOpen] = useState(false);
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>(() => {
    if (typeof window === "undefined") return "standard";
    try {
      const saved = localStorage.getItem("fire-simulator-mode");
      if (saved === "beginner" || saved === "standard" || saved === "advanced") return saved;
    } catch { /* ignore */ }
    return "standard";
  });
  const [activeTab, setActiveTab] = useState<"forward" | "reverse">("forward");
  const [exportToast, setExportToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showNominal, setShowNominal] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t, locale, setLocale, formatCurrency, setCurrency } = useI18n();

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    try {
      const onboarded = localStorage.getItem(LS_ONBOARDING_KEY);
      const hasUrlParams = new URLSearchParams(window.location.search).size > 0;
      const hasSavedInputs = localStorage.getItem(LS_KEY) !== null;
      if (!onboarded && !hasUrlParams && !hasSavedInputs) {
        setShowOnboarding(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Undo/redo stacks
  const undoStack = useRef<FireInputs[]>([]);
  const redoStack = useRef<FireInputs[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pushUndo = useCallback((prev: FireInputs) => {
    const stack = undoStack.current;
    if (stack.length >= UNDO_LIMIT) stack.shift();
    stack.push(prev);
    redoStack.current.length = 0;
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current.pop()!;
    redoStack.current.push(inputs);
    setInputs(prev);
    saveInputs(prev);
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(true);
  }, [inputs]);

  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop()!;
    undoStack.current.push(inputs);
    setInputs(next);
    saveInputs(next);
    setCanRedo(redoStack.current.length > 0);
    setCanUndo(true);
  }, [inputs]);

  // Update html lang when locale changes
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // Sync currency formatting when tax country changes
  useEffect(() => {
    setCurrency(inputs.taxCountry);
  }, [inputs.taxCountry, setCurrency]);

  // Auto-dismiss export toast
  useEffect(() => {
    if (exportToast) {
      const timer = setTimeout(() => setExportToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [exportToast]);

  // Close export menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    if (exportMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [exportMenuOpen]);

  const handleChange = (key: keyof FireInputs, value: number | string | boolean) => {
    setInputs((prev) => {
      pushUndo(prev);
      const next = { ...prev, [key]: value };
      // Auto-update zielvermoegen when income or SWR change (only if override is not active)
      // Use full desired income (not reduced by pension) since pension only starts at Renteneintrittsalter
      if (
        !next.zielvermoegenOverride &&
        (key === "monatlichesWunschEinkommen" ||
        key === "swr")
      ) {
        const income = (key === "monatlichesWunschEinkommen" ? (value as number) : next.monatlichesWunschEinkommen);
        const swr = (key === "swr" ? (value as number) : next.swr) / 100;
        next.zielvermoegen = swr > 0 ? Math.round((income * 12) / swr) : next.zielvermoegen;
      }
      // When override is turned off, recalculate from current income/SWR
      if (key === "zielvermoegenOverride" && value === false) {
        const swr = next.swr / 100;
        next.zielvermoegen = swr > 0 ? Math.round((next.monatlichesWunschEinkommen * 12) / swr) : next.zielvermoegen;
      }
      // Apply country-specific defaults when tax country changes
      if (key === "taxCountry") {
        const country = value as TaxCountry;
        const defaults = COUNTRY_DEFAULTS[country];
        if (defaults) {
          next.monatlichesNetto = defaults.monatlichesNetto;
          next.monatlichesWunschEinkommen = defaults.monatlichesWunschEinkommen;
          next.gesetzlicheRente = defaults.gesetzlicheRente;
          next.renteneintrittsalter = defaults.renteneintrittsalter;
          next.etfRendite = defaults.etfRendite;
          next.inflation = defaults.inflation;
          next.swr = defaults.swr;
          // Auto-recalculate FIRE number with new defaults
          if (!next.zielvermoegenOverride) {
            const swr = defaults.swr / 100;
            next.zielvermoegen = swr > 0 ? Math.round((defaults.monatlichesWunschEinkommen * 12) / swr) : next.zielvermoegen;
          }
        }
      }
      saveInputs(next);
      return next;
    });
  };

  // Defer expensive calculation to keep UI responsive during slider drags
  const deferredInputs = useDeferredValue(inputs);
  const result = useMemo(() => calculateFIRE(deferredInputs), [deferredInputs]);

  const handleExportXLSX = useCallback(async () => {
    try {
      const { exportXLSX } = await import("@/lib/export");
      await exportXLSX({ result, inputs, t, formatCurrency });
    } catch {
      setExportToast({ message: t.exportError, type: "error" });
    }
  }, [result, inputs, t, formatCurrency]);

  const handleExportPDF = useCallback(async () => {
    try {
      const { exportPDF } = await import("@/lib/export");
      await exportPDF({ result, inputs, t, formatCurrency });
    } catch {
      setExportToast({ message: t.exportError, type: "error" });
    }
  }, [result, inputs, t, formatCurrency]);

  const handleExportCSV = useCallback(async () => {
    try {
      const { exportCSV } = await import("@/lib/export");
      exportCSV({ result, inputs, t, formatCurrency });
    } catch {
      setExportToast({ message: t.exportError, type: "error" });
    }
  }, [result, inputs, t, formatCurrency]);

  const handleExportJSON = useCallback(async () => {
    try {
      const { exportScenarioJSON } = await import("@/lib/export");
      exportScenarioJSON(inputs);
    } catch {
      setExportToast({ message: t.exportError, type: "error" });
    }
  }, [inputs, t]);

  const handleImportJSON = useCallback(async (file: File) => {
    try {
      const { importScenarioJSON } = await import("@/lib/export");
      const imported = await importScenarioJSON(file);
      // Merge with defaults to ensure any missing fields are filled
      const merged = { ...DEFAULT_INPUTS, ...imported };
      setInputs(merged);
      saveInputs(merged);
      setExportToast({ message: t.importSuccess, type: "success" });
    } catch {
      setExportToast({ message: t.importError, type: "error" });
    }
  }, [t]);

  const handleShareLink = useCallback(() => {
    const url = inputsToURL(inputs);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setShareTooltip(true);
        setTimeout(() => setShareTooltip(false), 2000);
      }).catch(() => {
        // Fallback: prompt user with the URL to copy manually
        window.prompt(t.shareLink, url);
      });
    } else {
      // Fallback for environments without clipboard API
      window.prompt(t.shareLink, url);
    }
  }, [inputs, t]);

  const handleReset = useCallback(() => {
    if (window.confirm(t.resetConfirm)) {
      setInputs(DEFAULT_INPUTS);
      saveInputs(DEFAULT_INPUTS);
    }
  }, [t]);

  const handleLifeEventsChange = useCallback((events: LifeEvent[]) => {
    setInputs((prev) => {
      const next = { ...prev, lifeEvents: events };
      saveInputs(next);
      return next;
    });
  }, []);

  const handleScenarioLoad = useCallback((loaded: FireInputs) => {
    pushUndo(inputs);
    const merged = { ...DEFAULT_INPUTS, ...loaded };
    setInputs(merged);
    saveInputs(merged);
  }, [inputs, pushUndo]);

  const handleOnboardingComplete = useCallback((data: {
    currentAge: number;
    monatlichesNetto: number;
    startKapital: number;
    monatlicheSparrate: number;
    monatlichesWunschEinkommen: number;
    taxCountry: string;
  }) => {
    const country = data.taxCountry as FireInputs["taxCountry"];
    const countryDef = COUNTRY_DEFAULTS[country];
    const swr = countryDef.swr;
    const swrDecimal = swr / 100;
    const zielvermoegen = swrDecimal > 0 ? Math.round((data.monatlichesWunschEinkommen * 12) / swrDecimal) : DEFAULT_INPUTS.zielvermoegen;
    const merged: FireInputs = {
      ...DEFAULT_INPUTS,
      currentAge: data.currentAge,
      monatlichesNetto: data.monatlichesNetto,
      startKapital: data.startKapital,
      monatlicheSparrate: data.monatlicheSparrate,
      monatlichesWunschEinkommen: data.monatlichesWunschEinkommen,
      taxCountry: country,
      gesetzlicheRente: countryDef.gesetzlicheRente,
      renteneintrittsalter: countryDef.renteneintrittsalter,
      etfRendite: countryDef.etfRendite,
      inflation: countryDef.inflation,
      swr,
      zielvermoegen,
    };
    setInputs(merged);
    saveInputs(merged);
    setShowOnboarding(false);
    try {
      localStorage.setItem(LS_ONBOARDING_KEY, "1");
    } catch { /* ignore */ }
  }, []);

  const handleOnboardingSkip = useCallback(() => {
    setShowOnboarding(false);
    try {
      localStorage.setItem(LS_ONBOARDING_KEY, "1");
    } catch { /* ignore */ }
  }, []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't override undo/redo in input fields
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleUndo, handleRedo]);

  const handleModeChange = useCallback((mode: DashboardMode) => {
    setDashboardMode(mode);
    try { localStorage.setItem("fire-simulator-mode", mode); } catch { /* ignore */ }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] dark:bg-slate-900">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-emerald-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        {t.skipToContent}
      </a>

      {/* Learn Glossary Modal */}
      <LearnGlossaryModal isOpen={learnModalOpen} onClose={() => setLearnModalOpen(false)} />

      {/* Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 w-80 bg-[#0f294d] dark:bg-slate-800 flex flex-col",
          "transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:translate-x-0 lg:flex-shrink-0 lg:z-auto",
          "overflow-y-auto sidebar-scroll",
        ].join(" ")}
      >
        <Sidebar inputs={inputs} onChange={handleChange} onReset={handleReset} />
      </aside>

      {/* Main area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-100 dark:border-slate-700 px-3 sm:px-6 py-3 sm:py-4 flex items-center flex-wrap gap-2 sm:gap-4">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            onClick={() => setSidebarOpen(true)}
            aria-label={t.menuOpen}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-[#0f294d] dark:text-white leading-tight truncate">
              {t.appTitle}
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title={`${t.undo} (Ctrl+Z)`}
              aria-label={t.undo}
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title={`${t.redo} (Ctrl+Shift+Z)`}
              aria-label={t.redo}
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H9a5 5 0 00-5 5v2a1 1 0 11-2 0v-2a7 7 0 017-7h5.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Share Link button */}
          <div className="relative">
            <button
              onClick={handleShareLink}
              className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              title={t.shareLink}
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
              </svg>
              <span className="hidden sm:inline">{t.shareLink}</span>
            </button>
            {shareTooltip && (
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-emerald-600 rounded whitespace-nowrap">
                {t.linkCopied}
              </div>
            )}
          </div>

          {/* Export / Import dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setExportMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              aria-label={t.exportImport}
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">{t.exportImport}</span>
              <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" className={`transition-transform ${exportMenuOpen ? "rotate-180" : ""}`}>
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 py-1 z-50">
                <button
                  onClick={() => { handleExportXLSX(); setExportMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {t.xlsxExport}
                </button>
                <button
                  onClick={() => { handleExportPDF(); setExportMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  {t.pdfExport}
                </button>
                <button
                  onClick={() => { handleExportCSV(); setExportMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {t.csvExport}
                </button>
                <button
                  onClick={() => { handleExportJSON(); setExportMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {t.jsonExport}
                </button>
                <div className="border-t border-slate-200 dark:border-slate-600 my-1" />
                <label className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  {t.jsonImport}
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImportJSON(file);
                      e.target.value = "";
                      setExportMenuOpen(false);
                    }}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Learn button */}
          <button
            onClick={() => setLearnModalOpen(true)}
            className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            title={t.learnTitle}
          >
            <span className="hidden sm:inline">{t.learnButton}</span>
            <span className="sm:hidden">📖</span>
          </button>

          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === "de" ? "en" : "de")}
            className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            title={t.language}
          >
            {locale === "de" ? "🇬🇧 EN" : "🇩🇪 DE"}
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            aria-label={theme === "dark" ? t.lightMode : t.darkMode}
          >
            {theme === "dark" ? (
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </header>

        {/* Dashboard content */}
        <div id="main-content" className="px-3 sm:px-6 py-6 max-w-7xl mx-auto">
          {/* Dashboard Mode Toggle */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.modeLabel}:
            </span>
            {(["beginner", "standard", "advanced"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  dashboardMode === mode
                    ? "bg-emerald-500 border-emerald-400 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {mode === "beginner" ? t.modeBeginner : mode === "standard" ? t.modeStandard : t.modeAdvanced}
              </button>
            ))}
          </div>

          {/* FIRE Education Panel — show for beginners */}
          {dashboardMode === "beginner" && <FireEducationPanel />}

          {/* Scenario Manager & Example Plans — hide in beginner mode */}
          {dashboardMode !== "beginner" && (
            <>
              <ScenarioManager currentInputs={inputs} onLoad={handleScenarioLoad} />
              <div className="mb-6">
                <ExamplePlansDropdown onLoad={handleScenarioLoad} />
              </div>
            </>
          )}

          {/* Tab navigation */}
          <div className="flex gap-2 mb-6" role="tablist">
            <button
              onClick={() => setActiveTab("forward")}
              role="tab"
              aria-selected={activeTab === "forward"}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "forward"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {t.forwardSimTab}
            </button>
            <button
              onClick={() => setActiveTab("reverse")}
              role="tab"
              aria-selected={activeTab === "reverse"}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "reverse"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {t.reversePlannerTab}
            </button>
          </div>

          <ErrorBoundary
            errorTitle={t.errorTitle}
            fallbackMessage={t.errorMessage}
            errorRetryLabel={t.errorRetry}
          >
            {activeTab === "forward" ? (
              <>
                {/* Guidance Card — contextual feedback */}
                <GuidanceCard result={result} inputs={inputs} />

                <Warnings inputs={inputs} />

                {/* Beginner Mode: simplified view */}
                {dashboardMode === "beginner" ? (
                  <>
                    <BeginnerJourneyCard result={result} inputs={inputs} />
                    <WhatIfPanel inputs={inputs} result={result} onChange={handleChange} />
                    <Milestones result={result} inputs={inputs} />
                    <ErrorBoundary
                      errorTitle={t.errorTitle}
                      fallbackMessage={t.errorMessage}
                      errorRetryLabel={t.errorRetry}
                    >
                      <DashboardSection
                        title={t.sectionFireJourney}
                        description={t.sectionFireJourneyDesc}
                        defaultOpen={true}
                      >
                        <div className="relative">
                          <ChartExplainer
                            explanation={t.chartExplainFireChart}
                            summary={t.chartSummaryFireChart(result.fullFireAge)}
                          />
                          <FireChart result={result} zielvermoegen={inputs.zielvermoegen} showNominal={showNominal} />
                        </div>
                      </DashboardSection>
                    </ErrorBoundary>
                    <FireScore result={result} inputs={inputs} />
                  </>
                ) : (
                  /* Standard / Advanced Mode */
                  <>
                    <ErrorBoundary
                      errorTitle={t.errorTitle}
                      fallbackMessage={t.errorMessage}
                      errorRetryLabel={t.errorRetry}
                    >
                      <DashboardSection
                        title={t.sectionFireJourney}
                        description={t.sectionFireJourneyDesc}
                        defaultOpen={true}
                      >
                        {/* Nominal / Real toggle + FIRE Progress Gauge row */}
                        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                          <div className="flex-1 w-full">
                            <KPICards result={result} inputs={inputs} />
                          </div>
                          <div className="w-full sm:w-auto flex-shrink-0 flex flex-col gap-4">
                            <FireProgressGauge result={result} inputs={inputs} />
                            <FireScore result={result} inputs={inputs} />
                          </div>
                        </div>

                        {/* Nominal/Real toggle */}
                        <div className="flex items-center gap-2 mb-4">
                          <button
                            onClick={() => setShowNominal(!showNominal)}
                            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border ${
                              showNominal
                                ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700"
                                : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700"
                            }`}
                            title={t.nominalTooltip}
                          >
                            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            {showNominal ? t.showNominal : t.showReal}
                          </button>
                        </div>

                        <div className="relative">
                          <ChartExplainer
                            explanation={t.chartExplainFireChart}
                            summary={t.chartSummaryFireChart(result.fullFireAge)}
                          />
                          <FireChart result={result} zielvermoegen={inputs.zielvermoegen} showNominal={showNominal} />
                        </div>
                      </DashboardSection>
                    </ErrorBoundary>

                    {/* What If panel — in standard+ modes */}
                    <WhatIfPanel inputs={inputs} result={result} onChange={handleChange} />

                    {/* Milestones — in standard+ modes */}
                    <Milestones result={result} inputs={inputs} />

                    <ErrorBoundary
                      errorTitle={t.errorTitle}
                      fallbackMessage={t.errorMessage}
                      errorRetryLabel={t.errorRetry}
                    >
                      <DashboardSection
                        title={t.sectionStressTesting}
                        description={t.sectionStressTestingDesc}
                        defaultOpen={true}
                      >
                        <div className="relative">
                          <ChartExplainer
                            explanation={t.chartExplainLifecycleChart}
                            summary={t.chartSummaryMonteCarloChart((result.monteCarlo.successRate * 100).toFixed(0))}
                          />
                          <LifecycleMonteCarloChart result={result} />
                        </div>
                        <div className="relative">
                          <ChartExplainer
                            explanation={t.chartExplainMonteCarloChart}
                            summary={t.chartSummaryMonteCarloChart((result.monteCarlo.successRate * 100).toFixed(0))}
                          />
                          <MonteCarloChart result={result} />
                        </div>
                      </DashboardSection>
                    </ErrorBoundary>

                    <ErrorBoundary
                      errorTitle={t.errorTitle}
                      fallbackMessage={t.errorMessage}
                      errorRetryLabel={t.errorRetry}
                    >
                      <DashboardSection
                        title={t.sectionDrawdownAnalysis}
                        description={t.sectionDrawdownAnalysisDesc}
                        defaultOpen={true}
                      >
                        <div className="relative">
                          <ChartExplainer
                            explanation={t.chartExplainDrawdownChart}
                            summary={t.chartSummaryDrawdownChart(result.drawdownSurvives)}
                          />
                          <DrawdownChart result={result} inputs={inputs} />
                        </div>
                      </DashboardSection>
                    </ErrorBoundary>

                    {/* Planning section — only in advanced mode */}
                    {dashboardMode === "advanced" && (
                      <ErrorBoundary
                        errorTitle={t.errorTitle}
                        fallbackMessage={t.errorMessage}
                        errorRetryLabel={t.errorRetry}
                      >
                        <DashboardSection
                          title={t.sectionPlanning}
                          description={t.sectionPlanningDesc}
                          defaultOpen={false}
                        >
                          <LifeEventsEditor
                            events={inputs.lifeEvents}
                            onChange={handleLifeEventsChange}
                            startYear={inputs.startYear}
                          />
                          <DetailTable result={result} />
                          <PhasesTimeline result={result} startYear={inputs.startYear} />
                        </DashboardSection>
                      </ErrorBoundary>
                    )}
                  </>
                )}
              </>
            ) : (
              <ReversePlanner inputs={inputs} />
            )}
          </ErrorBoundary>

          <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-6 pb-6">
            {t.disclaimer}
          </p>
        </div>
      </main>

      {/* Export/Import toast notification */}
      {exportToast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm text-white transition-all ${
          exportToast.type === "error" ? "bg-red-600" : "bg-emerald-600"
        }`}>
          {exportToast.message}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <HomeContent />
      </I18nProvider>
    </ThemeProvider>
  );
}
