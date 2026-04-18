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
  const capitalProgress = fireNumber > 0 ? Math.min(100, (currentSavings / fireNumber) * 100) : 0;

  // If user has 0 savings but high savings rate, show at least a trajectory hint
  const trajectoryBonus = (result.targetReached && result.fullFireYear !== null && result.fullFireYear > 0 && capitalProgress < 5)
    ? Math.min(5, 25 / result.fullFireYear)
    : 0;

  const progress = Math.min(100, capitalProgress + trajectoryBonus);
  const progressRounded = Math.round(progress * 10) / 10;
  const isComplete = progress >= 100;

  // Color based on progress
  const progressColor = isComplete
    ? "#10b981" // emerald
    : progress >= 50
      ? "#f59e0b" // amber
      : "#6366f1"; // indigo

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg" role="img" aria-label={t.fireProgressTitle}>📊</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {t.fireProgressTitle}
        </span>
      </div>

      {/* Horizontal progress bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-2xl font-bold tracking-tight" style={{ color: progressColor }}>
            {progressRounded}%
          </span>
          {isComplete && (
            <span className="text-xs text-emerald-500 font-medium">
              {t.fireProgressComplete}
            </span>
          )}
        </div>
        <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%`, backgroundColor: progressColor }}
          />
        </div>
      </div>

      {/* Sub-text */}
      <div className="text-xs text-slate-500 dark:text-slate-400">
        {formatCurrencyShort(currentSavings)} {t.fireProgressOf} {formatCurrencyShort(fireNumber)}
      </div>
      <div className="text-[10px] text-slate-400 dark:text-slate-500">
        {t.fireProgressSub}
      </div>
    </div>
  );
}
