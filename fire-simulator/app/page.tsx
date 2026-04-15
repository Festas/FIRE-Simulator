"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { calculateFIRE, FireInputs, LifeEvent } from "@/lib/fireCalculations";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { ThemeProvider, useTheme } from "@/lib/theme";
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

const DEFAULT_INPUTS: FireInputs = {
  startKapital: 50_000,
  monatlicheSparrate: 3_250,
  dynamikSparrate: 2.0,
  etfRendite: 7.0,
  inflation: 2.5,
  bavJaehrlich: 8_000,
  zielvermoegen: 1_650_000,
  lzkJahre: 3,
  lzkRendite: 3.5,
  startYear: 2026,
  currentAge: 29,
  monatlichesWunschEinkommen: 4_000,
  gesetzlicheRente: 1_500,
  swr: 3.5,
  steuerModell: "single",
  kirchensteuer: false,
  taxCountry: "DE",
  entnahmeModell: "ewigeRente",
  kapitalverzehrJahre: 30,
  monatlichesNetto: 6_500,
  lifeEvents: [],
  arbeitszeitkontoEnabled: true,
  stundenProJahr: 200,
  wochenStunden: 40,
};

const LS_KEY = "fire-simulator-inputs";

// URL state serialization keys (short to keep URLs compact)
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
  ae: "arbeitszeitkontoEnabled",
  sp: "stundenProJahr",
  ws: "wochenStunden",
};

function parseURLInputs(): Partial<FireInputs> | null {
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
    } else if (full === "entnahmeModell") {
      result[full] = val === "kapitalverzehr" ? "kapitalverzehr" : "ewigeRente";
    } else if (full === "taxCountry") {
      const valid = ["DE", "US", "UK", "CH", "AT", "NL"];
      result[full] = valid.includes(val) ? val : "DE";
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) result[full] = num;
    }
  }

  return hasAny ? (result as Partial<FireInputs>) : null;
}

function inputsToURL(inputs: FireInputs): string {
  const params = new URLSearchParams();
  const reverseKeys = Object.fromEntries(
    Object.entries(URL_KEYS).map(([short, full]) => [full, short]),
  );

  for (const [full, short] of Object.entries(reverseKeys)) {
    const key = full as keyof FireInputs;
    const val = inputs[key];
    if (typeof val === "boolean") {
      params.set(short, val ? "1" : "0");
    } else {
      params.set(short, String(val));
    }
  }

  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
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
  const [activeTab, setActiveTab] = useState<"forward" | "reverse">("forward");
  const { theme, toggleTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();

  // Update html lang when locale changes
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const handleChange = (key: keyof FireInputs, value: number | string | boolean) => {
    setInputs((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-update zielvermoegen when income/pension/SWR change
      if (
        key === "monatlichesWunschEinkommen" ||
        key === "gesetzlicheRente" ||
        key === "swr"
      ) {
        const gap = Math.max(
          0,
          (key === "monatlichesWunschEinkommen" ? (value as number) : next.monatlichesWunschEinkommen) -
            (key === "gesetzlicheRente" ? (value as number) : next.gesetzlicheRente)
        );
        const swr = (key === "swr" ? (value as number) : next.swr) / 100;
        next.zielvermoegen = swr > 0 ? Math.round((gap * 12) / swr) : next.zielvermoegen;
      }
      saveInputs(next);
      return next;
    });
  };

  const result = useMemo(() => calculateFIRE(inputs), [inputs]);

  const handleExportCSV = useCallback(() => {
    const allData = [...result.yearlyData, ...result.drawdownData];
    const headers = [
      t.tableYear,
      t.calendarYear,
      t.tableEtf,
      t.tableLzk,
      t.tableTotal,
      t.tableSavingsMonth,
      t.tableTaxes,
      t.tableWithdrawal,
      t.tablePhase,
    ];
    const getPhaseLabel = (d: (typeof allData)[0]) => {
      if (d.isDrawdownPhase) return t.phaseWithdrawal;
      if (d.isFreistellungsPhase) return t.phaseFreistellung;
      if (d.isCoastPhase) return t.phaseCoast;
      if (d.isLZKPhase) return t.phaseLzk;
      return t.phaseSaving;
    };
    const rows = allData.map((d) => [
      d.year,
      d.calendarYear,
      Math.round(d.etfBalanceReal),
      Math.round(d.lzkBalanceReal),
      Math.round(d.totalReal),
      Math.round(d.monthlySavings),
      Math.round(d.taxPaid),
      Math.round(d.annualWithdrawal),
      getPhaseLabel(d),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM prefix for Excel UTF-8
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fire-simulation-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result, t]);

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
    const merged = { ...DEFAULT_INPUTS, ...loaded };
    setInputs(merged);
    saveInputs(merged);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] dark:bg-slate-900">
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
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-100 dark:border-slate-700 px-6 py-4 flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            onClick={() => setSidebarOpen(true)}
            aria-label={t.menuOpen}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#0f294d] dark:text-white leading-tight">
              {t.appTitle}
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
              {t.appSubtitle}
            </p>
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

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">{t.csvExport}</span>
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

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {t.live}
          </div>
        </header>

        {/* Dashboard content */}
        <div className="px-6 py-6 max-w-7xl mx-auto">
          {/* Scenario Manager & Example Plans */}
          <ScenarioManager currentInputs={inputs} onLoad={handleScenarioLoad} />
          <div className="mb-6">
            <ExamplePlansDropdown onLoad={handleScenarioLoad} />
          </div>

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
                <Warnings inputs={inputs} />
                <KPICards result={result} inputs={inputs} />
                <FireChart result={result} zielvermoegen={inputs.zielvermoegen} />
                <LifecycleMonteCarloChart result={result} />
                <MonteCarloChart result={result} />
                <DrawdownChart result={result} inputs={inputs} />
                <LifeEventsEditor
                  events={inputs.lifeEvents}
                  onChange={handleLifeEventsChange}
                  startYear={inputs.startYear}
                />
                <DetailTable result={result} />
                <PhasesTimeline result={result} startYear={inputs.startYear} />
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
