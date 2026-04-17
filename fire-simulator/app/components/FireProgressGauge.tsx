"use client";

import React from "react";
import { FireResult, FireInputs } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";

interface FireProgressGaugeProps {
  result: FireResult;
  inputs: FireInputs;
}

export default function FireProgressGauge({ result, inputs }: FireProgressGaugeProps) {
  const { t, formatCurrencyShort } = useI18n();

  const fireNumber = result.derivedFireNumber;
  const currentSavings = inputs.startKapital;

  // Progress = current savings / FIRE number (capped at 100%)
  const progress = fireNumber > 0 ? Math.min(100, (currentSavings / fireNumber) * 100) : 0;
  const progressRounded = Math.round(progress * 10) / 10;
  const isComplete = progress >= 100;

  // SVG circle parameters
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  // Color based on progress
  const progressColor = isComplete
    ? "#10b981" // emerald
    : progress >= 50
      ? "#f59e0b" // amber
      : "#6366f1"; // indigo

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 w-full">
        <span className="text-lg" role="img" aria-label={t.fireProgressTitle}>📊</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {t.fireProgressTitle}
        </span>
      </div>

      {/* Circular gauge */}
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-700"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ color: progressColor }}
          >
            {progressRounded}%
          </span>
          {isComplete && (
            <span className="text-xs text-emerald-500 font-medium">
              {t.fireProgressComplete}
            </span>
          )}
        </div>
      </div>

      {/* Sub-text */}
      <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
        {formatCurrencyShort(currentSavings)} {t.fireProgressOf} {formatCurrencyShort(fireNumber)}
      </div>
      <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
        {t.fireProgressSub}
      </div>
    </div>
  );
}
