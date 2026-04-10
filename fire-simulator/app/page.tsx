"use client";

import React, { useState, useMemo, useCallback } from "react";
import { calculateFIRE, FireInputs } from "@/lib/fireCalculations";
import Sidebar from "@/app/components/Sidebar";
import KPICards from "@/app/components/KPICards";
import FireChart from "@/app/components/FireChart";
import DrawdownChart from "@/app/components/DrawdownChart";
import DetailTable from "@/app/components/DetailTable";
import PhasesTimeline from "@/app/components/PhasesTimeline";
import Warnings from "@/app/components/Warnings";

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
  monatlichesWunschEinkommen: 4_000,
  gesetzlicheRente: 1_500,
  swr: 3.5,
  steuerModell: "single",
  kirchensteuer: false,
  entnahmeModell: "ewigeRente",
  kapitalverzehrJahre: 30,
  monatlichesBrutto: 6_500,
};

const LS_KEY = "fire-simulator-inputs";

function getInitialInputs(): FireInputs {
  if (typeof window === "undefined") return DEFAULT_INPUTS;
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

export default function Home() {
  const [inputs, setInputs] = useState<FireInputs>(getInitialInputs);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      "Jahr",
      "Kalenderjahr",
      "ETF (real)",
      "LZK (real)",
      "Gesamt (real)",
      "Sparrate/Monat",
      "Steuern",
      "Entnahme",
      "Phase",
    ];
    const rows = allData.map((d) => [
      d.year,
      d.calendarYear,
      Math.round(d.etfBalanceReal),
      Math.round(d.lzkBalanceReal),
      Math.round(d.totalReal),
      Math.round(d.monthlySavings),
      Math.round(d.taxPaid),
      Math.round(d.annualWithdrawal),
      d.isDrawdownPhase ? "Entnahme" : d.isLZKPhase ? "LZK" : "Sparphase",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fire-simulation-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
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
          "fixed inset-y-0 left-0 z-30 w-80 bg-[#0f294d] flex flex-col",
          "transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:translate-x-0 lg:flex-shrink-0 lg:z-auto",
          "overflow-y-auto sidebar-scroll",
        ].join(" ")}
      >
        <Sidebar inputs={inputs} onChange={handleChange} />
      </aside>

      {/* Main area */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-4 flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            onClick={() => setSidebarOpen(true)}
            aria-label="Menü öffnen"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#0f294d] leading-tight">
              FIRE Masterplan Simulator
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Family Office Dashboard · Kaufkraftbereinigte Projektion · inkl. Steuern &amp; Entnahmephase
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            CSV Export
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
        </header>

        {/* Dashboard content */}
        <div className="px-6 py-6 max-w-7xl mx-auto">
          <Warnings inputs={inputs} />
          <KPICards result={result} inputs={inputs} />
          <FireChart result={result} zielvermoegen={inputs.zielvermoegen} />
          <DrawdownChart result={result} inputs={inputs} />
          <DetailTable result={result} />
          <PhasesTimeline result={result} startYear={inputs.startYear} />

          <p className="text-xs text-slate-400 text-center mt-6 pb-6">
            Diese Simulation dient ausschließlich Informationszwecken und
            stellt keine Anlageberatung dar. Alle Werte basieren auf
            vereinfachten Annahmen und historischen Durchschnittswerten.
            Steuerberechnung nach deutschem Recht (Abgeltungssteuer + Teilfreistellung).
          </p>
        </div>
      </main>
    </div>
  );
}
