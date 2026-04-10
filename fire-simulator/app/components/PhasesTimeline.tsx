"use client";

import React from "react";
import { FireResult } from "@/lib/fireCalculations";

interface Phase {
  number: number;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  yearStart: number;
  yearEnd: number | null;
  calStart: number;
  calEnd: number | null;
  color: string;
  bgHex: string;
  bgColor: string;
  borderColor: string;
  active?: boolean;
}

interface PhasesTimelineProps {
  result: FireResult;
  startYear: number;
}

export default function PhasesTimeline({ result, startYear }: PhasesTimelineProps) {
  const { lzkStartYear, fullFireYear, lzkStartCalendarYear, fullFireCalendarYear } = result;

  const fireYear = fullFireYear ?? 25;
  const lzkStart = lzkStartYear;

  // Divide pre-LZK time into 3 phases
  const totalPreLZK = lzkStart - 1;
  const phaseLen = Math.max(1, Math.floor(totalPreLZK / 3));

  const p1End = phaseLen;
  const p2End = phaseLen * 2;
  const p3End = lzkStart - 1;

  const phases: Phase[] = [
    {
      number: 1,
      icon: "🏗️",
      title: "Fundament & System-Autopilot",
      subtitle: "Grundstein legen",
      description:
        "ETF-Sparplan starten, Haushalt optimieren, Versicherungen checken, automatisiertes Sparen einrichten. Budget-Disziplin aufbauen.",
      yearStart: 1,
      yearEnd: p1End,
      calStart: startYear + 1,
      calEnd: startYear + p1End,
      color: "#0f294d",
      bgHex: "#f8fafc",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200",
    },
    {
      number: 2,
      icon: "📈",
      title: "Skalierung & Business-Aufbau",
      subtitle: "Einkommen erhöhen",
      description:
        "Gehaltserhöhungen verhandeln, Nebeneinnahmen aufbauen, Steuerstrategie optimieren. Sparrate jährlich erhöhen.",
      yearStart: p1End + 1,
      yearEnd: p2End,
      calStart: startYear + p1End + 1,
      calEnd: startYear + p2End,
      color: "#0369a1",
      bgHex: "#f0f9ff",
      bgColor: "bg-sky-50",
      borderColor: "border-sky-200",
    },
    {
      number: 3,
      icon: "⚖️",
      title: "Souveränität & Teilzeit",
      subtitle: "Freiheit gewinnen",
      description:
        "Teilzeitmodelle prüfen, passives Einkommen ausbauen, Familie und Finanzen ausbalancieren. Weniger Stress, mehr Lebensqualität.",
      yearStart: p2End + 1,
      yearEnd: p3End,
      calStart: startYear + p2End + 1,
      calEnd: startYear + p3End,
      color: "#7c3aed",
      bgHex: "#f5f3ff",
      bgColor: "bg-violet-50",
      borderColor: "border-violet-200",
    },
    {
      number: 4,
      icon: "🔒",
      title: "Langzeitkonto (LZK) Endspurt",
      subtitle: "Risiko reduzieren",
      description:
        "ETF-Beiträge stoppen. Monatliche Sparrate fließt in ein risikofreies Langzeitkonto (Festgeld/Tagesgeld). ETF wächst durch Zinseszins weiter.",
      yearStart: lzkStart,
      yearEnd: fireYear,
      calStart: lzkStartCalendarYear,
      calEnd: fullFireCalendarYear,
      color: "#d97706",
      bgHex: "#fffbeb",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      active: true,
    },
    {
      number: 5,
      icon: "🎯",
      title: "Exit & Entnahme",
      subtitle: "FIRE erreicht",
      description:
        "Finanzieller Ruhestand. Entnahme nach der Safe Withdrawal Rate (3,5 %). ETF und LZK decken alle Lebenshaltungskosten. Arbeit optional.",
      yearStart: fireYear + 1,
      yearEnd: null,
      calStart: (fullFireCalendarYear ?? startYear + fireYear) + 1,
      calEnd: null,
      color: "#10b981",
      bgHex: "#ecfdf5",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      active: true,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#0f294d]">Die 5 Phasen Ihres FIRE-Plans</h2>
        <p className="text-sm text-slate-500">
          Strategischer Fahrplan von heute bis zum finanziellen Exit
        </p>
      </div>

      {/* Timeline connector */}
      <div className="flex flex-col gap-0">
        {phases.map((phase, idx) => (
          <div key={phase.number} className="flex gap-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm border-2 flex-shrink-0"
                style={{ borderColor: phase.color, backgroundColor: phase.bgHex }}
              >
                {phase.icon}
              </div>
              {idx < phases.length - 1 && (
                <div className="w-0.5 flex-1 my-1 bg-slate-200 min-h-[24px]" />
              )}
            </div>

            {/* Phase content */}
            <div
              className={`flex-1 mb-4 p-4 rounded-xl border ${phase.bgColor} ${phase.borderColor}`}
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: phase.color }}
                    >
                      Phase {phase.number}
                    </span>
                    {phase.active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                        Kritisch
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-[#0f294d] text-sm">{phase.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 italic">{phase.subtitle}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-semibold" style={{ color: phase.color }}>
                    {phase.calStart}
                    {phase.calEnd ? ` – ${phase.calEnd}` : " →"}
                  </div>
                  <div className="text-xs text-slate-400">
                    Jahr {phase.yearStart}
                    {phase.yearEnd ? `–${phase.yearEnd}` : "+"}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{phase.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
