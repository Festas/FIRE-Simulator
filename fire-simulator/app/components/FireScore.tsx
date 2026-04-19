"use client";

import React from "react";
import { FireResult, FireInputs } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";

interface FireScoreProps {
  result: FireResult;
  inputs: FireInputs;
}

export default function FireScore({ result, inputs }: FireScoreProps) {
  const { t } = useI18n();

  // --- Savings Rate (0-25) ---
  const sparquote = result.sparquote;
  const savingsPoints =
    sparquote >= 50 ? 25 : sparquote >= 30 ? 20 : sparquote >= 20 ? 15 : sparquote >= 10 ? 8 : 0;

  // --- FIRE Timeline (0-25) ---
  // Score based on how quickly FIRE is reached relative to a 30-year horizon.
  // Reaching FIRE in year 1 = 25 pts, year 15 = ~13 pts, year 30 = 0 pts.
  const maxTimelineYears = 30;
  const timelinePoints =
    result.targetReached && result.fullFireYear !== null
      ? Math.max(0, Math.round(25 * (1 - result.fullFireYear / maxTimelineYears)))
      : 0;

  // --- Monte Carlo (0-25) ---
  const monteCarloPoints = Math.round(result.monteCarlo.successRate * 25);

  // --- Drawdown Safety (0-25) ---
  const drawdownPoints = result.drawdownSurvives ? 25 : 0;

  // --- Total ---
  const totalScore = Math.min(100, savingsPoints + timelinePoints + monteCarloPoints + drawdownPoints);

  // --- Color & label ---
  const scoreColor =
    totalScore >= 80
      ? "#10b981"
      : totalScore >= 60
        ? "#3b82f6"
        : totalScore >= 40
          ? "#f59e0b"
          : "#ef4444";

  const scoreLabel =
    totalScore >= 80
      ? t.fireScoreExcellent
      : totalScore >= 60
        ? t.fireScoreGreat
        : totalScore >= 40
          ? t.fireScoreGood
          : t.fireScoreNeedsWork;

  // --- SVG gauge ---
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (totalScore / 100) * circumference;

  // --- Breakdown data ---
  const breakdown = [
    { label: t.fireScoreSavingsRate, points: savingsPoints, max: 25 },
    { label: t.fireScoreTimeline, points: timelinePoints, max: 25 },
    { label: t.fireScoreMonteCarlo, points: monteCarloPoints, max: 25 },
    { label: t.fireScoreDrawdown, points: drawdownPoints, max: 25 },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg" role="img" aria-label={t.fireScoreTitle}>
          🏆
        </span>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t.fireScoreTitle}
          </span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">{t.fireScoreSub}</p>
        </div>
      </div>

      {/* Score circle */}
      <div className="flex flex-col items-center gap-1 mb-4">
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-200 dark:text-slate-700"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tracking-tight" style={{ color: scoreColor }}>
              {totalScore}
            </span>
            <span className="text-[10px] font-medium" style={{ color: scoreColor }}>
              {scoreLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown mini-bars */}
      <div className="space-y-2">
        {breakdown.map((item) => {
          const pct = Math.round((item.points / item.max) * 100);
          return (
            <div key={item.label}>
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                <span>{item.label}</span>
                <span>
                  {item.points}/{item.max}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-1.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${pct}%`, backgroundColor: scoreColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
