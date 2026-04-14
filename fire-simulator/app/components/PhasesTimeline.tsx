"use client";

import React from "react";
import { FireResult } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";

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
  bgHexDark: string;
  bgColor: string;
  borderColor: string;
  active?: boolean;
}

interface PhasesTimelineProps {
  result: FireResult;
  startYear: number;
}

export default function PhasesTimeline({ result, startYear }: PhasesTimelineProps) {
  const { t } = useI18n();
  const { lzkStartYear, fullFireYear, lzkStartCalendarYear, fullFireCalendarYear, swRate } = result;

  const fireYear = fullFireYear ?? 25;
  const lzkStart = lzkStartYear;

  const totalPreLZK = lzkStart - 1;
  const phaseLen = Math.max(1, Math.floor(totalPreLZK / 3));

  const p1End = phaseLen;
  const p2End = phaseLen * 2;
  const p3End = lzkStart - 1;

  const phases: Phase[] = [
    {
      number: 1,
      icon: "🏗️",
      title: t.phase1Title,
      subtitle: t.phase1Subtitle,
      description: t.phase1Desc,
      yearStart: 1,
      yearEnd: p1End,
      calStart: startYear + 1,
      calEnd: startYear + p1End,
      color: "#0f294d",
      bgHex: "#f8fafc",
      bgHexDark: "#1e293b",
      bgColor: "bg-slate-50 dark:bg-slate-700/50",
      borderColor: "border-slate-200 dark:border-slate-600",
    },
    {
      number: 2,
      icon: "📈",
      title: t.phase2Title,
      subtitle: t.phase2Subtitle,
      description: t.phase2Desc,
      yearStart: p1End + 1,
      yearEnd: p2End,
      calStart: startYear + p1End + 1,
      calEnd: startYear + p2End,
      color: "#0369a1",
      bgHex: "#f0f9ff",
      bgHexDark: "#0c4a6e20",
      bgColor: "bg-sky-50 dark:bg-sky-900/20",
      borderColor: "border-sky-200 dark:border-sky-800",
    },
    {
      number: 3,
      icon: "⚖️",
      title: t.phase3Title,
      subtitle: t.phase3Subtitle,
      description: t.phase3Desc,
      yearStart: p2End + 1,
      yearEnd: p3End,
      calStart: startYear + p2End + 1,
      calEnd: startYear + p3End,
      color: "#7c3aed",
      bgHex: "#f5f3ff",
      bgHexDark: "#4c1d9520",
      bgColor: "bg-violet-50 dark:bg-violet-900/20",
      borderColor: "border-violet-200 dark:border-violet-800",
    },
    {
      number: 4,
      icon: "🔒",
      title: t.phase4Title,
      subtitle: t.phase4Subtitle,
      description: t.phase4Desc,
      yearStart: lzkStart,
      yearEnd: fireYear,
      calStart: lzkStartCalendarYear,
      calEnd: fullFireCalendarYear,
      color: "#d97706",
      bgHex: "#fffbeb",
      bgHexDark: "#78350f20",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      borderColor: "border-amber-200 dark:border-amber-800",
      active: true,
    },
    {
      number: 5,
      icon: "🎯",
      title: t.phase5Title,
      subtitle: t.phase5Subtitle,
      description: t.phase5Desc(swRate.toFixed(1)),
      yearStart: fireYear + 1,
      yearEnd: null,
      calStart: (fullFireCalendarYear ?? startYear + fireYear) + 1,
      calEnd: null,
      color: "#10b981",
      bgHex: "#ecfdf5",
      bgHexDark: "#06543420",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      active: true,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#0f294d] dark:text-white">{t.phasesTitle}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t.phasesSubtitle}
        </p>
      </div>

      <div className="flex flex-col gap-0">
        {phases.map((phase, idx) => (
          <div key={phase.number} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm border-2 flex-shrink-0"
                style={{ borderColor: phase.color, backgroundColor: phase.bgHex }}
              >
                {phase.icon}
              </div>
              {idx < phases.length - 1 && (
                <div className="w-0.5 flex-1 my-1 bg-slate-200 dark:bg-slate-600 min-h-[24px]" />
              )}
            </div>

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
                      {t.phaseLabel(phase.number)}
                    </span>
                    {phase.active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-medium">
                        {t.phaseCritical}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-[#0f294d] dark:text-white text-sm">{phase.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 italic">{phase.subtitle}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-semibold" style={{ color: phase.color }}>
                    {phase.calStart}
                    {phase.calEnd ? ` – ${phase.calEnd}` : " →"}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    {t.tableYear} {phase.yearStart}
                    {phase.yearEnd ? `–${phase.yearEnd}` : "+"}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{phase.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
