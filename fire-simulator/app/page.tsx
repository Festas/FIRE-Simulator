"use client";

import React, { useState, useMemo, useCallback } from "react";
import { calculateFIRE, FireInputs } from "@/lib/fireCalculations";
import Sidebar from "@/app/components/Sidebar";
import KPICards from "@/app/components/KPICards";
import FireChart from "@/app/components/FireChart";
import PhasesTimeline from "@/app/components/PhasesTimeline";

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
};

export default function Home() {
  const [inputs, setInputs] = useState<FireInputs>(DEFAULT_INPUTS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleChange = useCallback(
    (key: keyof FireInputs, value: number) => {
      setInputs((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const result = useMemo(() => calculateFIRE(inputs), [inputs]);

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
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#0f294d] leading-tight">
              FIRE Masterplan Simulator
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Family Office Dashboard · Kaufkraftbereinigte Projektion
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live-Berechnung aktiv
          </div>
        </header>

        {/* Dashboard content */}
        <div className="px-6 py-6 max-w-7xl mx-auto">
          <KPICards result={result} zielvermoegen={inputs.zielvermoegen} />
          <FireChart result={result} zielvermoegen={inputs.zielvermoegen} />
          <PhasesTimeline result={result} startYear={inputs.startYear} />

          <p className="text-xs text-slate-400 text-center mt-6 pb-6">
            Diese Simulation dient ausschließlich Informationszwecken und
            stellt keine Anlageberatung dar. Alle Werte basieren auf
            vereinfachten Annahmen und historischen Durchschnittswerten.
          </p>
        </div>
      </main>
    </div>
  );
}
